import { Graph } from "@/components/parts/graph";
import { LoadingSpinner } from "@/components/parts/loading-spinner";
import { MonthRangePicker } from "@/components/parts/month-range-picker";
import { RangeSelector } from "@/components/parts/range-selector";
import { AggregatedData } from "@/interfaces/aggregated-data.interface";

type Props = {
  theme: "month" | "week" | "day" | "hour";
  startMonth?: Date;
  endMonth?: Date;
  setStartMonth?: (date?: Date) => void;
  setEndMonth?: (date?: Date) => void;
  startWeekRange?: { from: Date; to: Date };
  endWeekRange?: { from: Date; to: Date };
  setStartWeekRange?: (range?: { from: Date; to: Date }) => void;
  setEndWeekRange?: (range?: { from: Date; to: Date }) => void;
  startDate?: Date;
  endDate?: Date;
  setStartDate?: (date?: Date) => void;
  setEndDate?: (date?: Date) => void;
  isLoading: boolean;
  filteredData: AggregatedData[];
  filteredDailyData: AggregatedData[];
};

export function PeriodGraphPanel(props: Props) {
  const {
    theme,
    startMonth,
    endMonth,
    setStartMonth,
    setEndMonth,
    startWeekRange,
    endWeekRange,
    setStartWeekRange,
    setEndWeekRange,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    isLoading,
    filteredData,
    filteredDailyData,
  } = props;

  return (
    <div>
      {theme === "month" && setStartMonth && setEndMonth && (
        <MonthRangePicker
          startMonth={startMonth}
          endMonth={endMonth}
          onChange={(start, end) => {
            setStartMonth(start);
            setEndMonth(end);
          }}
        />
      )}

      {theme === "week" && setStartWeekRange && setEndWeekRange && (
        <RangeSelector
          type="week"
          start={startWeekRange}
          end={endWeekRange}
          setStart={setStartWeekRange}
          setEnd={setEndWeekRange}
        />
      )}

      {(theme === "day" || theme === "hour") && setStartDate && setEndDate && (
        <RangeSelector
          type="date"
          start={startDate}
          end={endDate}
          setStart={setStartDate}
          setEnd={setEndDate}
        />
      )}

      <div style={{ margin: "2rem 0" }}>
        {isLoading && theme === "hour" ? (
          <LoadingSpinner />
        ) : (startMonth && endMonth) ||
          (startWeekRange && endWeekRange) ||
          (startDate && endDate) ? (
          <Graph theme={theme} data={theme === "hour" ? filteredDailyData : filteredData} />
        ) : (
          <p>範囲を選択してください。</p>
        )}
      </div>
    </div>
  );
}
