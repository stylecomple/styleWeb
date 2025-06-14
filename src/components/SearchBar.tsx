
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

const SearchBar = ({ searchQuery, onSearchChange, onFocus, onBlur }: SearchBarProps) => {
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Only call onBlur if the blur is not caused by clicking on the input itself
    // This prevents the focus loss issue in admin panel
    const relatedTarget = e.relatedTarget;
    if (relatedTarget && relatedTarget !== e.currentTarget) {
      onBlur?.();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="ابحث عن المنتجات..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={onFocus}
          onBlur={handleBlur}
          className="w-full pr-12 pl-4 py-3 text-right rounded-full border-2 border-gray-200 focus:border-pink-500 focus:ring-pink-500 text-lg"
        />
      </div>
    </div>
  );
};

export default SearchBar;
