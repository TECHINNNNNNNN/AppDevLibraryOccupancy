import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangePickerProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  className?: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  dateRange,
  onDateRangeChange,
  className
}) => {
  const [date, setDate] = useState<DateRange>({
    from: dateRange.from,
    to: dateRange.to,
  });
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectPreset = (preset: string) => {
    const now = new Date();
    let from = new Date();
    let to = now;

    switch (preset) {
      case "last7days":
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
        break;
      case "last30days":
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
        break;
      case "thisMonth":
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "lastMonth":
        from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        to = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case "thisYear":
        from = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
    }

    setDate({ from, to });
    onDateRangeChange({ from, to });
    setIsOpen(false);
  };

  const handleSelect = (selectedDate: any) => {
    const { from, to } = selectedDate;
    if (from && to) {
      setDate({ from, to });
      onDateRangeChange({ from, to });
      setIsOpen(false);
    } else {
      setDate(selectedDate);
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-auto justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="px-4 pt-4 pb-2">
            <div className="flex justify-between">
              <h4 className="font-medium text-sm">Date Range</h4>
              <Select
                onValueChange={handleSelectPreset}
                defaultValue="custom"
              >
                <SelectTrigger className="h-8 w-[120px]">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last7days">Last 7 days</SelectItem>
                  <SelectItem value="last30days">Last 30 days</SelectItem>
                  <SelectItem value="thisMonth">This month</SelectItem>
                  <SelectItem value="lastMonth">Last month</SelectItem>
                  <SelectItem value="thisYear">This year</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateRangePicker;
