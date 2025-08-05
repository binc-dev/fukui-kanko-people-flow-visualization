import { Graph } from "@/components/parts/graph";
import { LoadingSpinner } from "@/components/parts/loading-spinner";
import { MonthRangePicker } from "@/components/parts/month-range-picker";
import { RangeSelector } from "@/components/parts/range-selector";
import { StatsSummary } from "@/components/parts/stats-summary";
import { Card, CardContent } from "@/components/ui/card";
import { AggregatedData } from "@/interfaces/aggregated-data.interface";
import { Period } from "@/interfaces/period.interface";
import { DownloadIcon } from "@primer/octicons-react";
import { saveAs } from "file-saver";

type PeriodGraphPanelProps = {
  theme: "month" | "week" | "day" | "hour";
  period: Period;
  setPeriod: React.Dispatch<React.SetStateAction<Period>>;
  isCompareMode: boolean;
  isLoading: boolean;
  filteredData: AggregatedData[];
  filteredDailyData: AggregatedData[];
};

function convertToCSV(data: AggregatedData[]): string {
  if (data.length === 0) return "";
  const headers = Object.keys(data[0]);
  const rows = data.map((row) => headers.map((h) => `"${row[h] ?? ""}"`).join(","));
  return [headers.join(","), ...rows].join("\n");
}

export function PeriodGraphPanel({
  theme,
  period,
  setPeriod,
  isCompareMode,
  isLoading,
  filteredData,
  filteredDailyData,
}: PeriodGraphPanelProps) {
  const handleDownloadCSV = (data: AggregatedData[]) => {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "fukui-terminal-data.csv");
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div
        className={`flex gap-2 w-full items-end justify-center ${
          !isCompareMode ? "sm:pl-[88px]" : ""
        }`}
      >
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

        <button
          className="h-9 px-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
          onClick={() => handleDownloadCSV(theme === "hour" ? filteredDailyData : filteredData)}
          disabled={
            !(
              (period.startMonth && period.endMonth) ||
              (period.startWeekRange && period.endWeekRange) ||
              (period.startDate && period.endDate)
            )
          }
        >
          <span className="flex items-center gap-1">
            <DownloadIcon size={16} />
            {!isCompareMode && <span className="hidden sm:inline">CSV</span>}
          </span>
        </button>
      </div>

      <div className="w-full flex flex-col items-center justify-end min-h-[40vh]">
        <Card
          className={`${
            (period.startMonth && period.endMonth) ||
            (period.startWeekRange && period.endWeekRange) ||
            (period.startDate && period.endDate)
              ? "min-h-[60vh] pt-4 pb-0 mt-2"
              : "min-h-[20vh]"
          } ${isCompareMode ? "w-full" : "w-2/3"}`}
        >
          {isLoading && theme === "hour" ? (
            <LoadingSpinner />
          ) : (period.startMonth && period.endMonth) ||
            (period.startWeekRange && period.endWeekRange) ||
            (period.startDate && period.endDate) ? (
            <CardContent className="px-4">
              <div className="bg-gray-50 rounded-lg pr-4">
                <Graph theme={theme} data={theme === "hour" ? filteredDailyData : filteredData} />
              </div>
              <StatsSummary
                theme={theme}
                data={theme === "hour" ? filteredDailyData : filteredData}
              />
            </CardContent>
          ) : (
            <CardContent className="flex items-center justify-center h-full text-gray-500">
              <p className="text-lg">表示したい期間を設定してください。</p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
