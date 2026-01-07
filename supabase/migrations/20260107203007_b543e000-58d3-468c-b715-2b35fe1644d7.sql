-- Add country_id field to profiles table for user's home country
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country_id uuid REFERENCES public.countries(id);

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_country_id ON public.profiles(country_id);