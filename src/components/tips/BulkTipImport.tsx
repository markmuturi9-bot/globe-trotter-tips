import { useState, useRef } from 'react';
import { X, Sparkles, Mic, MicOff, Loader2, Check, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCountries, useCreateTip } from '@/hooks/useTips';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { TipCategory, Country } from '@/types';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInterface extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInterface;
    webkitSpeechRecognition?: new () => SpeechRecognitionInterface;
  }
}

interface BulkTipImportProps {
  onClose: () => void;
}

interface ParsedTip {
  id: string;
  title: string;
  description: string;
  category: TipCategory;
  country_id: string;
  address?: string;
  isEditing?: boolean;
}

const categories: TipCategory[] = ['general', 'food', 'attractions', 'activities', 'accommodation', 'other'];

export function BulkTipImport({ onClose }: BulkTipImportProps) {
  const { data: countries, isLoading: loadingCountries } = useCountries();
  const createTip = useCreateTip();
  const { toast } = useToast();
  
  const [inputText, setInputText] = useState('');
  const [parsedTips, setParsedTips] = useState<ParsedTip[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognitionInterface | null>(null);

  const handleParseTips = async () => {
    if (!inputText.trim()) {
      toast({
        title: 'No text provided',
        description: 'Please enter some text or use speech-to-text.',
        variant: 'destructive',
      });
      return;
    }

    setIsParsing(true);
    try {
      const { data, error } = await supabase.functions.invoke('parse-tips', {
        body: { 
          text: inputText,
          countries: countries?.map(c => ({ id: c.id, name: c.name })) || []
        },
      });

      if (error) throw error;

      if (data.tips && Array.isArray(data.tips)) {
        const tipsWithIds = data.tips.map((tip: Omit<ParsedTip, 'id'>, index: number) => ({
          ...tip,
          id: `parsed-${Date.now()}-${index}`,
          category: categories.includes(tip.category as TipCategory) ? tip.category : 'general',
        }));
        setParsedTips(tipsWithIds);
        toast({
          title: 'Tips parsed!',
          description: `Found ${tipsWithIds.length} tip(s). Review and approve them below.`,
        });
      } else {
        toast({
          title: 'No tips found',
          description: 'Could not extract any tips from the text.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Parse error:', error);
      toast({
        title: 'Error parsing tips',
        description: error?.message || 'Failed to parse tips. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleStartRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: 'Speech recognition not supported',
        description: 'Your browser does not support speech recognition.',
        variant: 'destructive',
      });
      return;
    }

    const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionConstructor) return;
    
    const recognition = new SpeechRecognitionConstructor();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US'; // Use English as default for speech recognition
    
    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      
      if (finalTranscript) {
        setInputText(prev => prev + finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      toast({
        title: 'Speech recognition error',
        description: `Error: ${event.error}`,
        variant: 'destructive',
      });
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleStopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleUpdateTip = (id: string, updates: Partial<ParsedTip>) => {
    setParsedTips(prev => 
      prev.map(tip => tip.id === id ? { ...tip, ...updates } : tip)
    );
  };

  const handleRemoveTip = (id: string) => {
    setParsedTips(prev => prev.filter(tip => tip.id !== id));
  };

  const handleSubmitAll = async () => {
    const validTips = parsedTips.filter(tip => 
      tip.title && tip.description && tip.country_id
    );

    if (validTips.length === 0) {
      toast({
        title: 'No valid tips',
        description: 'All tips must have a title, description, and country.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    let successCount = 0;
    let errorCount = 0;

    for (const tip of validTips) {
      try {
        await createTip.mutateAsync({
          country_id: tip.country_id,
          category: tip.category,
          title: tip.title,
          description: tip.description,
          address: tip.address,
        });
        successCount++;
      } catch (error) {
        console.error('Error creating tip:', error);
        errorCount++;
      }
    }

    setIsSubmitting(false);

    if (successCount > 0) {
      toast({
        title: 'Tips created!',
        description: `Successfully created ${successCount} tip(s).${errorCount > 0 ? ` ${errorCount} failed.` : ''}`,
      });
      
      if (errorCount === 0) {
        onClose();
      } else {
        // Remove successfully created tips
        setParsedTips(prev => prev.slice(successCount));
      }
    } else {
      toast({
        title: 'Error',
        description: 'Failed to create any tips.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-x-4 top-[5%] bottom-[5%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl bg-card rounded-xl shadow-strong overflow-hidden animate-scale-in flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-xl font-semibold">AI Tip Import</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-hidden flex flex-col p-6 gap-4">
          {parsedTips.length === 0 ? (
            <>
              <div className="space-y-2">
                <Label>Enter your tips as free text or use speech-to-text</Label>
                <div className="relative">
                  <Textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste or type your tips here. For example: 'When in Paris, try the croissants at Du Pain et des Idées. It's the best bakery in town! Also, the Musée d'Orsay is less crowded than the Louvre...'"
                    rows={8}
                    className="pr-12"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={isRecording ? "destructive" : "outline"}
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  className="flex-1"
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-4 h-4 mr-2" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      Start Recording
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleParseTips}
                  disabled={isParsing || !inputText.trim()}
                  className="flex-1"
                >
                  {isParsing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Parsing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Parse Tips with AI
                    </>
                  )}
                </Button>
              </div>

              {isRecording && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                  <div className="w-2 h-2 bg-destructive rounded-full" />
                  Recording... Speak your tips
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {parsedTips.length} tip(s) found. Review and edit before submitting.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setParsedTips([])}
                >
                  Start Over
                </Button>
              </div>

              <ScrollArea className="flex-1">
                <div className="space-y-4 pr-4">
                  {parsedTips.map((tip) => (
                    <TipPreviewCard
                      key={tip.id}
                      tip={tip}
                      countries={countries || []}
                      onUpdate={(updates) => handleUpdateTip(tip.id, updates)}
                      onRemove={() => handleRemoveTip(tip.id)}
                    />
                  ))}
                </div>
              </ScrollArea>

              <div className="flex gap-3 pt-4 border-t border-border">
                <Button variant="outline" className="flex-1" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handleSubmitAll}
                  disabled={isSubmitting || parsedTips.length === 0}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Create All Tips ({parsedTips.length})
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface TipPreviewCardProps {
  tip: ParsedTip;
  countries: Country[];
  onUpdate: (updates: Partial<ParsedTip>) => void;
  onRemove: () => void;
}

function TipPreviewCard({ tip, countries, onUpdate, onRemove }: TipPreviewCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <div className="p-4 border border-border rounded-lg space-y-3 bg-muted/50">
        <Input
          value={tip.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Title"
          className="font-medium"
        />
        
        <Textarea
          value={tip.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Description"
          rows={3}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            value={tip.country_id}
            onValueChange={(value) => onUpdate({ country_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.id} value={country.id}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={tip.category}
            onValueChange={(value) => onUpdate({ category: value as TipCategory })}
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

        <Input
          value={tip.address || ''}
          onChange={(e) => onUpdate({ address: e.target.value })}
          placeholder="Address (optional)"
        />

        <div className="flex justify-end">
          <Button size="sm" onClick={() => setIsEditing(false)}>
            Done Editing
          </Button>
        </div>
      </div>
    );
  }

  const country = countries.find(c => c.id === tip.country_id);
  const isValid = tip.title && tip.description && tip.country_id;

  return (
    <div className={`p-4 border rounded-lg ${isValid ? 'border-border' : 'border-destructive'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{CATEGORY_ICONS[tip.category]}</span>
            <h4 className="font-medium truncate">{tip.title || 'Untitled'}</h4>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {tip.description || 'No description'}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{country?.name || 'No country selected'}</span>
            {tip.address && <span>• {tip.address}</span>}
          </div>
          {!isValid && (
            <p className="text-xs text-destructive mt-2">
              Missing required fields
            </p>
          )}
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onRemove}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </div>
    </div>
  );
}
