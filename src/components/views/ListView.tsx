import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, Filter, ArrowUpDown, Users, User, Globe2 } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TipCard } from '@/components/tips/TipCard';
import { TipDetail } from '@/components/tips/TipDetail';
import { useTips, useCountries } from '@/hooks/useTips';
import { useFriendships } from '@/hooks/useFriendships';
import { useAuth } from '@/hooks/useAuth';
import type { Tip, TipCategory, Profile } from '@/types';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/types';

const allCategories: TipCategory[] = ['general', 'food', 'attractions', 'activities', 'accommodation', 'other'];

type SortOption = 'alphabetical' | 'most_tips';
type UserFilterType = 'all' | 'friends' | 'me' | string;

export function ListView() {
  const { user } = useAuth();
  const { data: tips, isLoading } = useTips();
  const { data: countries } = useCountries();
  const { data: friendships } = useFriendships();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<TipCategory>>(new Set(allCategories));
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set());
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('alphabetical');
  const [userFilter, setUserFilter] = useState<UserFilterType>('all');

  // Get accepted friends
  const acceptedFriends = useMemo(() => {
    if (!user || !friendships) return [];
    return friendships
      .filter(f => f.status === 'accepted')
      .map(f => {
        const friend = f.requester_id === user.id ? f.addressee : f.requester;
        return friend;
      })
      .filter(Boolean) as Profile[];
  }, [user, friendships]);

  const friendIds = useMemo(() => acceptedFriends.map(f => f.id), [acceptedFriends]);
  
  const countriesMap = useMemo(() => {
    if (!countries) return new Map();
    return new Map(countries.map(c => [c.id, c]));
  }, [countries]);

  // Filter tips based on user filter
  const userFilteredTips = useMemo(() => {
    if (!tips) return [];
    
    switch (userFilter) {
      case 'all':
        return tips;
      case 'friends':
        return tips.filter(tip => friendIds.includes(tip.user_id));
      case 'me':
        return user ? tips.filter(tip => tip.user_id === user.id) : [];
      default:
        // Specific friend ID
        return tips.filter(tip => tip.user_id === userFilter);
    }
  }, [tips, userFilter, friendIds, user]);
  
  const filteredAndGroupedTips = useMemo(() => {
    if (!userFilteredTips) return new Map();
    
    const filtered = userFilteredTips.filter(tip => {
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
  }, [userFilteredTips, searchQuery, selectedCategories, countriesMap, sortBy]);

  const getUserFilterLabel = () => {
    switch (userFilter) {
      case 'all': return 'All';
      case 'friends': return 'Friends';
      case 'me': return 'My tips';
      default:
        const friend = acceptedFriends.find(f => f.id === userFilter);
        return friend?.username || 'Friend';
    }
  };
  
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
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Search Bar - on top - NOT scrollable */}
      <div className="flex-shrink-0 p-4 pb-2 border-b border-border bg-card z-30">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search countries or tips..."
            className="pl-9"
          />
        </div>
      </div>
      
      {/* Filter Bar - below search - NOT scrollable */}
      <div className="flex-shrink-0 px-4 py-2 border-b border-border bg-card z-30">
        <div className="flex gap-2">
          {/* User filter */}
          <Select value={userFilter} onValueChange={(value) => setUserFilter(value)}>
            <SelectTrigger className="flex-1 min-w-[120px]">
              <Users className="w-4 h-4 mr-2" />
              <SelectValue>{getUserFilterLabel()}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <Globe2 className="w-4 h-4" />
                  All users
                </div>
              </SelectItem>
              {user && (
                <>
                  <SelectItem value="me">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      My tips
                    </div>
                  </SelectItem>
                  <SelectItem value="friends">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      All friends
                    </div>
                  </SelectItem>
                  {acceptedFriends.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        Specific friend
                      </div>
                      {acceptedFriends.map(friend => (
                        <SelectItem key={friend.id} value={friend.id}>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-medium">
                              {friend.username.substring(0, 1).toUpperCase()}
                            </div>
                            {friend.username}
                          </div>
                        </SelectItem>
                      ))}
                    </>
                  )}
                </>
              )}
            </SelectContent>
          </Select>
          
          <DropdownMenu modal={false}>
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
                  onSelect={(e) => e.preventDefault()}
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
      
      {/* Tips List - only this area scrolls */}
      <div className="flex-1 overflow-y-auto app-scroll-container" style={{ overscrollBehavior: 'contain' }}>
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
