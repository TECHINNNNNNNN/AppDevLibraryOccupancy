import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface FilterOption {
  id: string;
  label: string;
}

interface SeatFilterProps {
  selectedFilters: string[];
  onFilterChange: (filters: string[]) => void;
}

const SeatFilter: React.FC<SeatFilterProps> = ({ 
  selectedFilters, 
  onFilterChange 
}) => {
  const filterOptions: FilterOption[] = [
    { id: 'quiet', label: 'Quiet Zone' },
    { id: 'group', label: 'Group Study' },
    { id: 'computer', label: 'Computer Stations' },
    { id: 'power', label: 'Power Outlets' },
    { id: 'window', label: 'Window Seats' }
  ];
  
  const toggleFilter = (filterId: string) => {
    if (selectedFilters.includes(filterId)) {
      onFilterChange(selectedFilters.filter(id => id !== filterId));
    } else {
      onFilterChange([...selectedFilters, filterId]);
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Filter by Features</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {filterOptions.map(option => (
            <div key={option.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`filter-${option.id}`} 
                checked={selectedFilters.includes(option.id)}
                onCheckedChange={() => toggleFilter(option.id)}
              />
              <label
                htmlFor={`filter-${option.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SeatFilter;
