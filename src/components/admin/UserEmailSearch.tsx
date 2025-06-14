
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserEmailSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const UserEmailSearch = ({ value, onChange, placeholder = "البحث عن البريد الإلكتروني..." }: UserEmailSearchProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch users based on search term
  const { data: users, isLoading } = useQuery({
    queryKey: ['user-search', searchTerm],
    queryFn: async () => {
      console.log('Searching for users with term:', searchTerm);
      
      if (!searchTerm || searchTerm.length < 1) {
        // Show all users if no search term
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .order('email')
          .limit(50);
        
        console.log('All users query result:', { data, error });
        
        if (error) {
          console.error('Error fetching all users:', error);
          return [];
        }
        
        return data || [];
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
        .order('email')
        .limit(20);
      
      console.log('Search query result:', { data, error, searchTerm });
      
      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: true, // Always enabled to show initial results
  });

  const handleSelect = (userEmail: string) => {
    onChange(userEmail);
    setOpen(false);
    setSearchTerm('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="ابحث عن البريد الإلكتروني أو الاسم..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading 
                ? "جاري البحث..." 
                : "لم يتم العثور على مستخدمين"}
            </CommandEmpty>
            {users && users.length > 0 && (
              <CommandGroup>
                {users.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={user.email}
                    onSelect={() => handleSelect(user.email)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === user.email ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{user.email}</span>
                      {user.full_name && (
                        <span className="text-sm text-muted-foreground">
                          {user.full_name}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default UserEmailSearch;
