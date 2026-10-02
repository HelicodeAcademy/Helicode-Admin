"use client";

import { useState } from "react";
import { format, isValid, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { fieldClassName } from "@/components/admin/shell";

function parseDate(value: string) {
  if (!value) return undefined;
  const date = parse(value, "yyyy-MM-dd", new Date());
  return isValid(date) ? date : undefined;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = parseDate(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            fieldClassName("w-full justify-start px-3 text-left font-normal"),
            !selected && "text-[#98A2B3]",
          )}
        >
          <CalendarIcon className="mr-2 size-4" />
          {selected ? format(selected, "MMM dd, yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            onChange(date ? format(date, "yyyy-MM-dd") : "");
            setOpen(false);
          }}
          autoFocus
          captionLayout="dropdown-years"
        />
      </PopoverContent>
    </Popover>
  );
}
