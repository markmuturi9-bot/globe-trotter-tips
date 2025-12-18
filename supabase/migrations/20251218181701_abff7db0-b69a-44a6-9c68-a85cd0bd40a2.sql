-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  privacy_setting TEXT NOT NULL DEFAULT 'friends_only' CHECK (privacy_setting IN ('friends_only', 'public')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create countries table
CREATE TABLE public.countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION
);

-- Create tip categories enum
CREATE TYPE public.tip_category AS ENUM ('general', 'food', 'attractions', 'activities', 'accommodation', 'other');

-- Create tips table
CREATE TABLE public.tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  country_id UUID NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  category tip_category NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create friendships table
CREATE TABLE public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(requester_id, addressee_id)
);

-- Create chats table
CREATE TABLE public.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_one UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_two UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(participant_one, participant_two)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  tip_reference UUID REFERENCES public.tips(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  related_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  related_tip_id UUID REFERENCES public.tips(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Countries are public read
CREATE POLICY "Countries are publicly readable"
ON public.countries FOR SELECT
TO authenticated
USING (true);

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can view public profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (privacy_setting = 'public');

CREATE POLICY "Users can view friends profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.friendships
    WHERE status = 'accepted'
    AND (
      (requester_id = auth.uid() AND addressee_id = profiles.id)
      OR (addressee_id = auth.uid() AND requester_id = profiles.id)
    )
  )
);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid());

-- Tips policies
CREATE POLICY "Anyone can view tips"
ON public.tips FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create their own tips"
ON public.tips FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own tips"
ON public.tips FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own tips"
ON public.tips FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Friendships policies
CREATE POLICY "Users can view their friendships"
ON public.friendships FOR SELECT
TO authenticated
USING (requester_id = auth.uid() OR addressee_id = auth.uid());

CREATE POLICY "Users can send friend requests"
ON public.friendships FOR INSERT
TO authenticated
WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can update friendships they're part of"
ON public.friendships FOR UPDATE
TO authenticated
USING (addressee_id = auth.uid() OR requester_id = auth.uid());

CREATE POLICY "Users can delete their friendships"
ON public.friendships FOR DELETE
TO authenticated
USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- Chats policies
CREATE POLICY "Users can view their chats"
ON public.chats FOR SELECT
TO authenticated
USING (participant_one = auth.uid() OR participant_two = auth.uid());

CREATE POLICY "Users can create chats"
ON public.chats FOR INSERT
TO authenticated
WITH CHECK (participant_one = auth.uid() OR participant_two = auth.uid());

-- Messages policies
CREATE POLICY "Users can view messages in their chats"
ON public.messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chats
    WHERE chats.id = messages.chat_id
    AND (chats.participant_one = auth.uid() OR chats.participant_two = auth.uid())
  )
);

CREATE POLICY "Users can send messages in their chats"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.chats
    WHERE chats.id = messages.chat_id
    AND (chats.participant_one = auth.uid() OR chats.participant_two = auth.uid())
  )
);

-- Notifications policies
CREATE POLICY "Users can view their notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tips_updated_at
  BEFORE UPDATE ON public.tips
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_friendships_updated_at
  BEFORE UPDATE ON public.friendships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial countries data
INSERT INTO public.countries (code, name, latitude, longitude) VALUES
('SE', 'Sweden', 62.0, 15.0),
('NO', 'Norway', 62.0, 10.0),
('DK', 'Denmark', 56.0, 10.0),
('FI', 'Finland', 64.0, 26.0),
('IS', 'Iceland', 65.0, -18.0),
('US', 'United States', 38.0, -97.0),
('CA', 'Canada', 56.0, -106.0),
('MX', 'Mexico', 23.0, -102.0),
('GB', 'United Kingdom', 54.0, -2.0),
('FR', 'France', 46.0, 2.0),
('DE', 'Germany', 51.0, 9.0),
('IT', 'Italy', 42.8, 12.8),
('ES', 'Spain', 40.0, -4.0),
('PT', 'Portugal', 39.5, -8.0),
('NL', 'Netherlands', 52.5, 5.75),
('BE', 'Belgium', 50.8, 4.0),
('CH', 'Switzerland', 47.0, 8.0),
('AT', 'Austria', 47.3, 13.3),
('GR', 'Greece', 39.0, 22.0),
('TR', 'Turkey', 39.0, 35.0),
('JP', 'Japan', 36.0, 138.0),
('CN', 'China', 35.0, 105.0),
('KR', 'South Korea', 36.5, 127.5),
('TH', 'Thailand', 15.0, 100.0),
('VN', 'Vietnam', 16.0, 106.0),
('ID', 'Indonesia', -5.0, 120.0),
('MY', 'Malaysia', 4.0, 109.5),
('SG', 'Singapore', 1.35, 103.8),
('PH', 'Philippines', 12.0, 122.0),
('AU', 'Australia', -25.0, 135.0),
('NZ', 'New Zealand', -41.0, 174.0),
('BR', 'Brazil', -10.0, -55.0),
('AR', 'Argentina', -34.0, -64.0),
('CL', 'Chile', -33.0, -70.0),
('CO', 'Colombia', 4.0, -72.0),
('PE', 'Peru', -10.0, -76.0),
('ZA', 'South Africa', -29.0, 24.0),
('EG', 'Egypt', 27.0, 30.0),
('MA', 'Morocco', 32.0, -5.0),
('KE', 'Kenya', 1.0, 38.0),
('AE', 'United Arab Emirates', 24.0, 54.0),
('IN', 'India', 20.0, 77.0),
('RU', 'Russia', 60.0, 100.0),
('PL', 'Poland', 52.0, 20.0),
('CZ', 'Czech Republic', 49.75, 15.5),
('HR', 'Croatia', 45.1, 15.2),
('HU', 'Hungary', 47.0, 20.0),
('IE', 'Ireland', 53.0, -8.0),
('RO', 'Romania', 46.0, 25.0),
('UA', 'Ukraine', 49.0, 32.0);