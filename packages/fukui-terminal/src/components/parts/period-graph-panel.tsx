import { Graph } from "@/components/parts/graph";
import { LoadingSpinner } from "@/components/parts/loading-spinner";
import { MonthRangePicker } from "@/components/parts/month-range-picker";
import { RangeSelector } from "@/components/parts/range-selector";
import { AggregatedData } from "@/interfaces/aggregated-data.interface";
import { Period } from "@/interfaces/period.interface";

type PeriodGraphPanelProps = {
  theme: "month" | "week" | "day" | "hour";
  period: Period;
  setPeriod: React.Dispatch<React.SetStateAction<Period>>;
  isLoading: boolean;
  filteredData: AggregatedData[];
  filteredDailyData: AggregatedData[];
};

export function PeriodGraphPanel({
  theme,
  period,
  setPeriod,
  isLoading,
  filteredData,
  filteredDailyData,
}: PeriodGraphPanelProps) {
  return (
    <div className="w-full flex flex-col items-center">
      {theme === "month" && (
        <MonthRangePicker
          startMonth={period.startMonth}
          endMonth={period.endMonth}
          onChange={(start, end) => {
            setPeriod((prev) => ({ ...prev, startMonth: start, endMonth: end }));
          }}
        />
      )}

      {theme === "week" && (
        <RangeSelector
          type="week"
          start={period.startWeekRange}
          end={period.endWeekRange}
          setStart={(range) => setPeriod((prev) => ({ ...prev, startWeekRange: range }))}
          setEnd={(range) => setPeriod((prev) => ({ ...prev, endWeekRange: range }))}
        />
      )}

      {(theme === "day" || theme === "hour") && (
        <RangeSelector
          type="date"
          start={period.startDate}
          end={period.endDate}
          setStart={(date) => setPeriod((prev) => ({ ...prev, startDate: date }))}
          setEnd={(date) => setPeriod((prev) => ({ ...prev, endDate: date }))}
        />
      )}

      <div className="w-2/3">
        {isLoading && theme === "hour" ? (
          <LoadingSpinner />
        ) : (period.startMonth && period.endMonth) ||
          (period.startWeekRange && period.endWeekRange) ||
          (period.startDate && period.endDate) ? (
          <Graph theme={theme} data={theme === "hour" ? filteredDailyData : filteredData} />
        ) : (
          <p>範囲を選択してください。</p>
        )}
      </div>
    </div>
  );
}
