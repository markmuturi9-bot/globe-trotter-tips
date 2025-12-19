import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, Filter, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { TipCard } from '@/components/tips/TipCard';
import { TipDetail } from '@/components/tips/TipDetail';
import { useTips, useCountries } from '@/hooks/useTips';
import type { Tip, TipCategory } from '@/types';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/types';

const allCategories: TipCategory[] = ['general', 'food', 'attractions', 'activities', 'accommodation', 'other'];

type SortOption = 'alphabetical' | 'most_tips';

export function ListView() {
  const { data: tips, isLoading } = useTips();
  const { data: countries } = useCountries();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<TipCategory>>(new Set(allCategories));
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set());
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('alphabetical');
  
  const countriesMap = useMemo(() => {
    if (!countries) return new Map();
    return new Map(countries.map(c => [c.id, c]));
  }, [countries]);
  
  const filteredAndGroupedTips = useMemo(() => {
    if (!tips) return new Map();
    
    const filtered = tips.filter(tip => {
      const matchesSearch = 
        tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tip.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tip.countries?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategories.has(tip.category);
      
      return matchesSearch && matchesCategory;
    });
    
    // Group by country
    const grouped = new Map<string, { countryName: string; tipCount: number; tips: Map<TipCategory, Tip[]> }>();
    
    filtered.forEach(tip => {
      const countryId = tip.country_id;
      const countryName = tip.countries?.name || countriesMap.get(countryId)?.name || 'Unknown';
      
      if (!grouped.has(countryId)) {
        grouped.set(countryId, { countryName, tipCount: 0, tips: new Map() });
      }
      
      const countryGroup = grouped.get(countryId)!;
      countryGroup.tipCount++;
      if (!countryGroup.tips.has(tip.category)) {
        countryGroup.tips.set(tip.category, []);
      }
      countryGroup.tips.get(tip.category)!.push(tip);
    });
    
    // Sort based on selected option
    const sortedEntries = [...grouped.entries()].sort((a, b) => {
      if (sortBy === 'most_tips') {
        return b[1].tipCount - a[1].tipCount; // Most tips first
      }
      return a[1].countryName.localeCompare(b[1].countryName); // Alphabetical
    });
    
    return new Map(sortedEntries);
  }, [tips, searchQuery, selectedCategories, countriesMap, sortBy]);
  
  const toggleCountry = (countryId: string) => {
    setExpandedCountries(prev => {
      const next = new Set(prev);
      if (next.has(countryId)) {
        next.delete(countryId);
      } else {
        next.add(countryId);
      }
      return next;
    });
  };
  
  const toggleCategory = (category: TipCategory) => {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Loading tips...</p>
      </div>
    );
  }
  
  return (
    <div className="flex-1 flex flex-col">
      {/* Search and Filter Bar */}
      <div className="p-4 border-b border-border bg-card sticky top-14 z-30">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search countries or tips..."
              className="pl-9"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Categories</DropdownMenuLabel>
              {allCategories.map(category => (
                <DropdownMenuCheckboxItem
                  key={category}
                  checked={selectedCategories.has(category)}
                  onCheckedChange={() => toggleCategory(category)}
                >
                  {CATEGORY_ICONS[category]} {CATEGORY_LABELS[category]}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <ArrowUpDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <DropdownMenuRadioItem value="alphabetical">
                  Alphabetical (A-Z)
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="most_tips">
                  Most tips first
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Tips List */}
      <div className="flex-1 overflow-y-auto">
        {filteredAndGroupedTips.size === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery || selectedCategories.size < allCategories.length 
                ? 'No tips match your filters.'
                : 'No tips have been shared yet.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {[...filteredAndGroupedTips.entries()].map(([countryId, { countryName, tips: categoryTips }]) => {
              const isExpanded = expandedCountries.has(countryId);
              const totalTips = [...categoryTips.values()].reduce((sum, arr) => sum + arr.length, 0);
              
              return (
                <div key={countryId} className="bg-card">
                  <button
                    onClick={() => toggleCountry(countryId)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="font-serif font-medium text-lg">{countryName}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{totalTips} tips</span>
                  </button>
                  
                  {isExpanded && (
                    <div className="pb-4 animate-fade-in">
                      {[...categoryTips.entries()].map(([category, tipList]) => (
                        <div key={category} className="px-4 mb-4 last:mb-0">
                          <h4 className="text-sm font-medium text-muted-foreground mb-2 ml-7 flex items-center gap-1.5">
                            <span>{CATEGORY_ICONS[category]}</span>
                            {CATEGORY_LABELS[category]}
                          </h4>
                          <div className="space-y-2 ml-7">
                            {tipList.map(tip => (
                              <TipCard key={tip.id} tip={tip} onClick={() => setSelectedTip(tip)} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {selectedTip && (
        <TipDetail tip={selectedTip} onClose={() => setSelectedTip(null)} />
      )}
    </div>
  );
}
