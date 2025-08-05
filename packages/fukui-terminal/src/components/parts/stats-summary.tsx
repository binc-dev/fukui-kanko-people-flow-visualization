import { AverageBar } from "@/components/parts/average-bar";
import { AggregatedData } from "@/interfaces/aggregated-data.interface";
import React from "react";
import { PeopleIcon } from "@primer/octicons-react";

type StatsSummaryProps = {
  type: "month" | "week" | "day" | "hour";
  data?: AggregatedData[];
};

/**
 * 集計データ配列から合計値と平均値を計算
 */
function getStats(data: AggregatedData[]) {
  if (!data || data.length === 0) return { sum: 0, avg: 0 };
  const sum = data.reduce((acc, cur) => acc + Number(cur["totalCount"] ?? 0), 0);
  const avg = sum / data.length;
  return { sum, avg };
}

/**
 * 集計データ配列から平日・土日祝の平均値を計算
 */
function getWeekdayAverages(data: AggregatedData[], type: string) {
  if (!data) return { weekdayAvg: 0, weekendAvg: 0 };

  if (type === "month" || type === "week") {
    // 月・週集計はweekdayTotal, weekendTotalを使う
    const weekdaySum = data.reduce((acc, cur) => acc + Number(cur["weekdayTotal"] ?? 0), 0);
    const weekendSum = data.reduce((acc, cur) => acc + Number(cur["weekendTotal"] ?? 0), 0);
    const count = data.length;
    return {
      weekdayAvg: count > 0 ? weekdaySum / count : 0,
      weekendAvg: count > 0 ? weekendSum / count : 0,
    };
  }
  if (type === "day") {
    const weekdays = data.filter(
      (d) => d.dayOfWeek && !["土", "日"].includes(d.dayOfWeek) && !d.holidayName,
    );
    const weekends = data.filter(
      (d) => (d.dayOfWeek && ["土", "日"].includes(d.dayOfWeek)) || d.holidayName,
    );
    const weekdayAvg =
      weekdays.length > 0
        ? weekdays.reduce((acc, cur) => acc + Number(cur["total count"] ?? 0), 0) / weekdays.length
        : 0;
    const weekendAvg =
      weekends.length > 0
        ? weekends.reduce((acc, cur) => acc + Number(cur["total count"] ?? 0), 0) / weekends.length
        : 0;
    return { weekdayAvg, weekendAvg };
  }
  return { weekdayAvg: 0, weekendAvg: 0 };
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({ type, data }) => {
  const { sum, avg } = getStats(data ?? []);
  const { weekdayAvg, weekendAvg } = getWeekdayAverages(data ?? [], type);
  const statsData = {
    sum: Math.round(sum),
    avg: Math.round(avg),
    weekdayAvg: Math.round(weekdayAvg),
    weekendAvg: Math.round(weekendAvg),
  };

  // 最大値（グラフ幅用）
  const maxAvg = Math.max(statsData.avg, statsData.weekdayAvg, statsData.weekendAvg, 1);

  return (
    <div className="flex justify-center">
      <div
        className={`grid ${
          type === "hour" ? "md:grid-cols-[1fr_1fr]" : "md:grid-cols-[1fr_1.5fr]"
        } gap-3 mt-2 mb-4 w-full max-w-md`}
      >
        {/* 合計人数 */}
        <div className="bg-blue-50 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <PeopleIcon size={16} className="w-4 h-4 text-blue-600" />
            <p className=" text-blue-600">合計人数</p>
          </div>
          <p className="text-lg font-medium text-blue-800">{statsData.sum.toLocaleString()}人</p>
        </div>
        {/* 平均人数 */}
        <div className="bg-green-50 rounded-lg p-2 text-center">
          {type !== "hour" ? (
            <>
              <AverageBar
                color="bg-blue-500"
                label="全体平均"
                value={statsData.avg}
                max={maxAvg}
                valueColor="text-blue-700"
              />
              <AverageBar
                color="bg-green-500"
                label="平日平均"
                value={statsData.weekdayAvg}
                max={maxAvg}
                valueColor="text-green-700"
              />
              <AverageBar
                color="bg-orange-500"
                label="土日祝平均"
                value={statsData.weekendAvg}
                max={maxAvg}
                valueColor="text-orange-700"
              />
            </>
          ) : (
            <>
              <div className="flex items-center justify-center gap-1 mb-1">
                <PeopleIcon size={16} className="w-4 h-4 text-green-600" />
                <p className=" text-green-600">1時間平均人数</p>
              </div>
              <p className="text-lg font-medium text-green-800">
                {statsData.avg.toLocaleString()}人
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
