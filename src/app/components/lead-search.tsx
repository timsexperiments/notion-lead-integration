'use client';

import { Combobox, ComboboxOption } from '@/components/ui/combobox';
import { fetchLeadRecords } from '@/lib/notion/lead';
import { useEffect, useState } from 'react';

export const LeadSearch = () => {
  const [options, setOptions] = useState<ComboboxOption[]>([]);
  useEffect(() => {
    const updateOptions = async () => {
      const newOptions = (await fetchLeadRecords()).map(
        ({ id, name, address }) => ({
          key: id,
          displayName: `${name} - ${address}`,
          value: address,
        })
      );
      setOptions(newOptions);
    };

    updateOptions();
  }, []);

  return (
    <Combobox
      id="address"
      name="address"
      className="flex w-full justify-between text-left"
      placeholder="Select an address..."
      options={options}
      required
    />
  );
};
