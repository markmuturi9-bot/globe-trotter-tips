import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tip, TipCategory, Country } from '@/types';

export function useTips() {
  return useQuery({
    queryKey: ['tips'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tips')
        .select(`
          *,
          profiles:user_id(id, username),
          countries:country_id(id, code, name, latitude, longitude)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Tip[];
    },
  });
}

export function useTipsByCountry(countryId: string | null) {
  return useQuery({
    queryKey: ['tips', 'country', countryId],
    queryFn: async () => {
      if (!countryId) return [];
      
      const { data, error } = await supabase
        .from('tips')
        .select(`
          *,
          profiles:user_id(id, username),
          countries:country_id(id, code, name, latitude, longitude)
        `)
        .eq('country_id', countryId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Tip[];
    },
    enabled: !!countryId,
  });
}

export function useTipsByUser(userId: string | null) {
  return useQuery({
    queryKey: ['tips', 'user', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('tips')
        .select(`
          *,
          profiles:user_id(id, username),
          countries:country_id(id, code, name, latitude, longitude)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Tip[];
    },
    enabled: !!userId,
  });
}

export function useCountries() {
  return useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Country[];
    },
  });
}

export function useCountriesWithTips() {
  const { data: tips } = useTips();
  const { data: countries } = useCountries();
  
  if (!tips || !countries) return { data: [], isLoading: true };
  
  const countryIdsWithTips = new Set(tips.map(tip => tip.country_id));
  const countriesWithTips = countries.filter(country => countryIdsWithTips.has(country.id));
  
  const tipCountByCountry = tips.reduce((acc, tip) => {
    acc[tip.country_id] = (acc[tip.country_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    data: countriesWithTips.map(country => ({
      ...country,
      tipCount: tipCountByCountry[country.id] || 0,
    })),
    isLoading: false,
  };
}

interface CreateTipInput {
  country_id: string;
  category: TipCategory;
  title: string;
  description: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
}

export function useCreateTip() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateTipInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('tips')
        .insert({
          user_id: user.id,
          ...input,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tips'] });
    },
  });
}

export function useDeleteTip() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (tipId: string) => {
      const { error } = await supabase
        .from('tips')
        .delete()
        .eq('id', tipId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tips'] });
    },
  });
}
