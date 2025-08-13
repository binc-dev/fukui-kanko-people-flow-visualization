import { Period } from "@/interfaces/period.interface";
import { getFilteredData } from "@/lib/aggregation";
import { useEffect } from "react";
import { AggregatedData, getRawData } from "@fukui-kanko/shared";

/**
 * テーマ・期間ごとに適切な集計データを返すカスタムフック
 */
export function useFilteredData(
  theme: "month" | "week" | "day" | "hour",
  period: Period,
  csvData: AggregatedData[],
  csvDailyData: AggregatedData[],
  setFilteredData: (data: AggregatedData[]) => void,
  setFilteredDailyData: (data: AggregatedData[]) => void,
) {
  useEffect(() => {
    const { data, daily } = getFilteredData(theme, period, csvData, csvDailyData);
    if (data !== undefined) setFilteredData(data);
    if (daily !== undefined) setFilteredDailyData(daily);
  }, [
    theme,
    period.startMonth,
    period.endMonth,
    period.startWeekRange,
    period.endWeekRange,
    period.startDate,
    period.endDate,
    csvData,
    csvDailyData,
  ]);
}

/**
 * 時間別データを取得・更新するフック
 */
export function useDailyDataEffect(
  theme: "month" | "week" | "day" | "hour",
  period: Period,
  setDailyData: (data: AggregatedData[]) => void,
  setIsLoading: (loading: boolean) => void,
) {
  useEffect(() => {
    if (theme !== "hour") {
      setIsLoading(false);
      return;
    }
    let isCurrent = true;
    const fetchData = async () => {
      if (period.startDate && period.endDate) {
        setIsLoading(true);
        const results: AggregatedData[] = [];
        const current = new Date(period.startDate);
        const end = new Date(period.endDate);

        while (current <= end) {
          // 1時間ごとに取得
          const rawData = await getRawData({
            objectClass: "Person",
            placement: "fukui-station-east-entrance",
            aggregateRange: "daily",
            date: new Date(current),
          });
          results.push(...rawData);
          current.setHours(current.getHours() + 1);
        }

        if (isCurrent) {
          setDailyData(results);
          setIsLoading(false);
        }
      }
    };
    fetchData();
    return () => {
      isCurrent = false;
    };
  }, [theme, period.startDate, period.endDate]);
}
