import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
// import "react-day-picker/style.css";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined
  onDateChange: (date: DateRange | undefined) => void
}

export function DateRangePicker({
  date,
  onDateChange,
  className,
}: DateRangePickerProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal  hover:bg-accent hover:text-accent-foreground",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, yyyy")} -{" "}
                  {format(date.to, "LLL dd, yyyy")}
                </>
              ) : (
                format(date.from, "LLL dd, yyyy")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0" 
          align="start"
          side="bottom"
          sideOffset={8}
        >
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onDateChange}
            numberOfMonths={1}
            className="flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
