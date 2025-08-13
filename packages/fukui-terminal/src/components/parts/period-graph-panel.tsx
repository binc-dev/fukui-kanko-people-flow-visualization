import { Graph } from "@/components/parts/graph";
import { LoadingSpinner } from "@/components/parts/loading-spinner";
import { StatsSummary } from "@/components/parts/stats-summary";
import { Period } from "@/interfaces/period.interface";
import { AggregatedData } from "@fukui-kanko/shared";
import { MonthRangePicker, RangeSelector } from "@fukui-kanko/shared/components/parts";

type PeriodGraphPanelProps = {
  type: "month" | "week" | "day" | "hour";
  period: Period;
  setPeriod: React.Dispatch<React.SetStateAction<Period>>;
  isCompareMode: boolean;
  isLoading: boolean;
  filteredData: AggregatedData[];
  filteredDailyData: AggregatedData[];
};

export function PeriodGraphPanel({
  type,
  period,
  setPeriod,
  isCompareMode,
  isLoading,
  filteredData,
  filteredDailyData,
}: PeriodGraphPanelProps) {
  return (
    <div className="w-full min-w-0 flex flex-col items-center">
      {type === "month" && (
        <MonthRangePicker
          startMonth={period.startMonth}
          endMonth={period.endMonth}
          onChange={(start, end) => {
            setPeriod((prev) => ({ ...prev, startMonth: start, endMonth: end }));
          }}
        />
      )}

      {type === "week" && (
        <RangeSelector
          type="week"
          start={period.startWeekRange}
          end={period.endWeekRange}
          setStart={(range) => setPeriod((prev) => ({ ...prev, startWeekRange: range }))}
          setEnd={(range) => setPeriod((prev) => ({ ...prev, endWeekRange: range }))}
        />
      )}

      {(type === "day" || type === "hour") && (
        <RangeSelector
          type="date"
          start={period.startDate}
          end={period.endDate}
          setStart={(date) => setPeriod((prev) => ({ ...prev, startDate: date }))}
          setEnd={(date) => setPeriod((prev) => ({ ...prev, endDate: date }))}
        />
      )}

      <div className="w-full flex flex-col items-center justify-end min-h-[40vh]">
        <div
          className={`${
            (period.startMonth && period.endMonth) ||
            (period.startWeekRange && period.endWeekRange) ||
            (period.startDate && period.endDate)
              ? "min-h-[60vh] pt-4 pb-0 mt-2"
              : "min-h-[20vh]"
          } w-full`}
        >
          {isLoading && type === "hour" ? (
            <LoadingSpinner />
          ) : (period.startMonth && period.endMonth) ||
            (period.startWeekRange && period.endWeekRange) ||
            (period.startDate && period.endDate) ? (
            <>
              <div className="rounded-lg w-full h-[60vh] overflow-hidden">
                <Graph type={type} data={type === "hour" ? filteredDailyData : filteredData} />
              </div>
              <div className={`${isCompareMode ? "w-full" : "w-2/3"} mx-auto px-4 mt-4`}>
                <StatsSummary
                  type={type}
                  data={type === "hour" ? filteredDailyData : filteredData}
                />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p className="text-lg">表示したい期間を設定してください。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
