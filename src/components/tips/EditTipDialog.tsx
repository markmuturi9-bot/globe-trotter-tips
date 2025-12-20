import { useState, useMemo } from 'react';
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
import { useCountries, useUpdateTip } from '@/hooks/useTips';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from './ImageUpload';
import { AddressAutocomplete } from './AddressAutocomplete';
import type { Tip, TipCategory } from '@/types';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/types';

interface EditTipDialogProps {
  tip: Tip;
  onClose: () => void;
  onSuccess?: () => void;
}

const categories: TipCategory[] = ['general', 'food', 'attractions', 'activities', 'accommodation', 'other'];

export function EditTipDialog({ tip, onClose, onSuccess }: EditTipDialogProps) {
  const { data: countries } = useCountries();
  const updateTip = useUpdateTip();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    country_id: tip.country_id,
    category: tip.category,
    title: tip.title,
    description: tip.description,
    address: tip.address || '',
    latitude: tip.latitude,
    longitude: tip.longitude,
  });
  const [images, setImages] = useState<string[]>(tip.images || []);

  const selectedCountryCode = useMemo(() => {
    if (!countries || !formData.country_id) return undefined;
    const country = countries.find(c => c.id === formData.country_id);
    return country?.code;
  }, [countries, formData.country_id]);
  
  const handleAddressSelect = (result: { address: string; position: { lat: number; lng: number } }) => {
    setFormData(prev => ({
      ...prev,
      address: result.address,
      latitude: result.position.lat,
      longitude: result.position.lng,
    }));
  };

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
      await updateTip.mutateAsync({
        id: tip.id,
        country_id: formData.country_id,
        category: formData.category,
        title: formData.title,
        description: formData.description,
        address: formData.address || null,
        latitude: formData.latitude,
        longitude: formData.longitude,
        images: images.length > 0 ? images : undefined,
      });
      
      toast({
        title: 'Tip updated!',
        description: 'Your changes have been saved.',
      });
      
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Update tip error:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update tip. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-x-4 top-[5%] bottom-[5%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg bg-card rounded-xl shadow-strong overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-serif text-xl font-semibold">Edit Tip</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(100%-4rem)] space-y-5">
          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <Select
              value={formData.country_id}
              onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                country_id: value,
                address: '',
                latitude: null,
                longitude: null,
              }))}
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
            {formData.country_id ? (
              <AddressAutocomplete
                value={formData.address}
                onChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  address: value,
                  latitude: null,
                  longitude: null,
                }))}
                onSelect={handleAddressSelect}
                countryCode={selectedCountryCode}
                placeholder="Search for an address..."
              />
            ) : (
              <Input
                disabled
                placeholder="Select a country first"
              />
            )}
            {formData.latitude && formData.longitude && (
              <p className="text-xs text-muted-foreground">
                📍 Location saved ({formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)})
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Photos (optional)</Label>
            <ImageUpload images={images} onImagesChange={setImages} maxImages={5} />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={updateTip.isPending}>
              {updateTip.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
