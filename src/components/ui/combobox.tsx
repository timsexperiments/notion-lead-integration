'use client';

import { Button } from '@/components/ui/button';
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
import { useForwardRef } from '@/hooks/use-forward-ref';
import { cn } from '@/lib/utils';
import { faCaretDown, faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect } from 'react';

export type ComboboxOption = {
  key?: string;
  displayName: string;
  value: string;
};

export type ComboboxProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'onChange'
> & {
  options?: ComboboxOption[];
  empty?: React.ReactNode;
  onSearch?: (search: string) => void;
  onChange?: (value: string, target: HTMLInputElement) => void;
};

const ComboboxComponent = (
  {
    options = [],
    className,
    value: initialValue = '',
    placeholder = 'Select an item...',
    empty = 'No items found.',
    onChange,
    onSearch,
    ...props
  }: ComboboxProps,
  forwardedRef: React.ForwardedRef<HTMLInputElement>
) => {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(initialValue);
  const [displayName, setDisplayName] = React.useState('Select property...');
  const ref = useForwardRef(forwardedRef);

  useEffect(() => {
    if (ref.current && onChange && typeof value === 'string') {
      onChange(value, ref.current);
    }
  }, [value, ref, onChange]);

  return (
    <>
      <input ref={ref} type="hidden" value={value} {...props} />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'w-[200px] justify-between border-zinc-300',
              className
            )}>
            {displayName || 'Select property...'}
            <FontAwesomeIcon
              className="ml-2 h-4 w-4 shrink-0 opacity-50"
              icon={faCaretDown}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="popover-content-width-same-as-its-trigger p-0">
          <Command className="w-full">
            <CommandInput placeholder={placeholder} onValueChange={onSearch} />
            <CommandList>
              <CommandEmpty>{empty}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.key ?? option.value}
                    value={option.value}
                    onSelect={(currentValue) => {
                      console.log('The value was changed');
                      setValue(currentValue === value ? '' : currentValue);
                      setDisplayName(option.displayName);
                      setOpen(false);
                    }}>
                    <FontAwesomeIcon
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === option.value ? 'opacity-100' : 'opacity-0'
                      )}
                      icon={faCheck}
                    />
                    {option.displayName}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
};

export const Combobox = React.forwardRef(ComboboxComponent);

Combobox.displayName = 'Combobox';

export default Combobox;
