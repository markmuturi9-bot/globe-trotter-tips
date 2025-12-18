export type TipCategory = 'general' | 'food' | 'attractions' | 'activities' | 'accommodation' | 'other';

export type PrivacySetting = 'friends_only' | 'public';

export interface Profile {
  id: string;
  username: string;
  email: string;
  privacy_setting: PrivacySetting;
  created_at: string;
  updated_at: string;
}

export interface Country {
  id: string;
  code: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
}

export interface Tip {
  id: string;
  user_id: string;
  country_id: string;
  category: TipCategory;
  title: string;
  description: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  images: string[];
  created_at: string;
  updated_at: string;
  // Joined data
  profiles?: Profile;
  countries?: Country;
}

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
}

export interface Chat {
  id: string;
  participant_one: string;
  participant_two: string;
  created_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  tip_reference: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  read: boolean;
  related_user_id: string | null;
  related_tip_id: string | null;
  created_at: string;
}

export type ViewType = 'map' | 'list' | 'profile';

export const CATEGORY_LABELS: Record<TipCategory, string> = {
  general: 'General',
  food: 'Food',
  attractions: 'Attractions',
  activities: 'Activities',
  accommodation: 'Accommodation',
  other: 'Other',
};

export const CATEGORY_ICONS: Record<TipCategory, string> = {
  general: '📌',
  food: '🍽️',
  attractions: '🏛️',
  activities: '🎯',
  accommodation: '🏨',
  other: '✨',
};
