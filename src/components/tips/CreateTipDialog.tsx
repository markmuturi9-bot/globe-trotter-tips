import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCountries, useCreateTip } from '@/hooks/useTips';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from './ImageUpload';
import type { TipCategory } from '@/types';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/types';

interface CreateTipDialogProps {
  onClose: () => void;
}

const categories: TipCategory[] = ['general', 'food', 'attractions', 'activities', 'accommodation', 'other'];

export function CreateTipDialog({ onClose }: CreateTipDialogProps) {
  const { data: countries, isLoading: loadingCountries } = useCountries();
  const createTip = useCreateTip();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    country_id: '',
    category: 'general' as TipCategory,
    title: '',
    description: '',
    address: '',
  });
  const [images, setImages] = useState<string[]>([]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.country_id || !formData.title || !formData.description) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await createTip.mutateAsync({
        country_id: formData.country_id,
        category: formData.category,
        title: formData.title,
        description: formData.description,
        address: formData.address || undefined,
        images: images.length > 0 ? images : undefined,
      });
      
      toast({
        title: 'Tip created!',
        description: 'Your travel tip has been shared.',
      });
      
      onClose();
    } catch (error: any) {
      console.error('Create tip error:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create tip. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-x-4 top-[5%] bottom-[5%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg bg-card rounded-xl shadow-strong overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-serif text-xl font-semibold">Share a Tip</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(100%-4rem)] space-y-5">
          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <Select
              value={formData.country_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, country_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {countries?.map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as TipCategory }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="A short, catchy title"
              maxLength={100}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Share your experience and tips..."
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Address (optional)</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Street address or location name"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Photos (optional)</Label>
            <ImageUpload images={images} onImagesChange={setImages} maxImages={5} />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={createTip.isPending}>
              {createTip.isPending ? 'Creating...' : 'Share Tip'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
