import { AggregatedData, TOTAL_COUNT_KEY } from "@/interfaces/aggregated-data.interface";
import { Period } from "@/interfaces/period.interface";
import * as holidayJP from "@holiday-jp/holiday_jp";

function filterByRange(data: AggregatedData[], from: Date, to: Date) {
  return data.filter((row) => {
    const date = new Date(row["aggregate from"]);
    return date >= from && date <= to;
  });
}

/**
 * 指定した期間内のデータを月単位で集計
 */
export function aggregateMonthly(data: AggregatedData[], start: Date, end: Date): AggregatedData[] {
  const filtered = filterByRange(data, start, end);
  const monthlyMap = new Map<
    string,
    AggregatedData & {
      weekdayTotal?: number;
      weekendTotal?: number;
    }
  >();
  filtered.forEach((row) => {
    const date = new Date(row["aggregate from"]);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = holidayJP.isHoliday(date);
    const isWeekendOrHoliday = isWeekend || isHoliday;
    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, {
        ...row,
        aggregateFrom: `${monthKey}`,
        aggregateTo: `${monthKey}`,
        totalCount: Number(row[TOTAL_COUNT_KEY]),
        weekdayTotal: !isWeekendOrHoliday ? Number(row[TOTAL_COUNT_KEY]) : 0,
        weekendTotal: isWeekendOrHoliday ? Number(row[TOTAL_COUNT_KEY]) : 0,
      });
    } else {
      const prev = monthlyMap.get(monthKey)!;
      monthlyMap.set(monthKey, {
        ...prev,
        totalCount: Number(prev.totalCount) + Number(row[TOTAL_COUNT_KEY]),
        weekdayTotal:
          (prev.weekdayTotal ?? 0) + (!isWeekendOrHoliday ? Number(row[TOTAL_COUNT_KEY]) : 0),
        weekendTotal:
          (prev.weekendTotal ?? 0) + (isWeekendOrHoliday ? Number(row[TOTAL_COUNT_KEY]) : 0),
      });
    }
  });
  return Array.from(monthlyMap.values());
}

/**
 * 指定した期間内のデータを週単位で集計
 */
export function aggregateWeekly(
  data: AggregatedData[],
  startWeekRange: { from: Date; to: Date },
  endWeekRange: { from: Date; to: Date },
): AggregatedData[] {
  const filtered = filterByRange(data, startWeekRange.from, endWeekRange.to);

  const weeklyAggregated: AggregatedData[] = [];
  let i = 0;
  while (i < filtered.length) {
    let weekRows;
    if (i === 0) {
      // 最初の週はstartWeekRange.from〜startWeekRange.toまで
      weekRows = filtered.filter((row) => {
        const d = new Date(row["aggregate from"]);
        return d >= startWeekRange.from && d <= startWeekRange.to;
      });
      i += weekRows.length;
    } else {
      // 以降は7日ごと
      weekRows = filtered.slice(i, i + 7);
      i += 7;
    }
    if (weekRows.length === 0) continue;
    const formatDate = (date: Date) =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const total = weekRows.reduce((sum, row) => sum + Number(row[TOTAL_COUNT_KEY]), 0);

    let weekdayTotal = 0;
    let weekendTotal = 0;
    weekRows.forEach((row) => {
      const date = new Date(row["aggregate from"]);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isHoliday = holidayJP.isHoliday(date);
      const isWeekendOrHoliday = isWeekend || isHoliday;
      if (isWeekendOrHoliday) {
        weekendTotal += Number(row[TOTAL_COUNT_KEY]);
      } else {
        weekdayTotal += Number(row[TOTAL_COUNT_KEY]);
      }
    });

    weeklyAggregated.push({
      ...weekRows[0],
      aggregateFrom: `${formatDate(new Date(weekRows[0]["aggregate from"]))}〜`,
      aggregateTo: `${formatDate(new Date(weekRows[weekRows.length - 1]["aggregate from"]))}`,
      totalCount: total,
      weekdayTotal,
      weekendTotal,
    });
  }
  return weeklyAggregated;
}

/**
 * 指定した期間内のデータを日単位で集計
 */
export function aggregateDaily(data: AggregatedData[], start: Date, end: Date): AggregatedData[] {
  const filtered = filterByRange(data, start, end);
  const dailyMap = new Map<string, AggregatedData>();
  filtered.forEach((row) => {
    const date = new Date(row["aggregate from"]);
    const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    if (!dailyMap.has(dayKey)) {
      const dayOfWeek = ["日", "月", "火", "水", "木", "金", "土"][date.getDay()];
      const holiday = holidayJP.isHoliday(date);
      let holidayName: string = "";
      if (holiday) {
        holidayName = holidayJP.between(date, date)[0].name;
      }
      dailyMap.set(dayKey, {
        ...row,
        aggregateFrom: `${dayKey}`,
        aggregateTo: `${dayKey}`,
        totalCount: Number(row[TOTAL_COUNT_KEY]),
        dayOfWeek,
        holidayName,
      });
    }
  });
  return Array.from(dailyMap.values());
}

/**
 * 指定した期間内のデータを時間単位で集計
 */
export function aggregateHourly(data: AggregatedData[]): AggregatedData[] {
  const hourlyMap = new Map<string, AggregatedData>();
  data.forEach((row) => {
    const date = new Date(row["aggregate from"]);
    const hourKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:00`;
    if (!hourlyMap.has(hourKey)) {
      hourlyMap.set(hourKey, {
        ...row,
        aggregateFrom: hourKey,
        aggregateTo: hourKey,
        totalCount: Number(row[TOTAL_COUNT_KEY]),
      });
    } else {
      const prev = hourlyMap.get(hourKey)!;
      hourlyMap.set(hourKey, {
        ...prev,
        ["total count"]: Number(prev["total count"]) + Number(row["total count"]),
      });
    }
  });
  return Array.from(hourlyMap.values());
}

/**
 * テーマ・期間ごとに適切な集計データを返す共通関数
 */
export function getFilteredData(
  theme: "month" | "week" | "day" | "hour",
  period: Period,
  csvData: AggregatedData[],
  csvDailyData: AggregatedData[],
) {
  if (theme === "month" && period.startMonth && period.endMonth) {
    const end = new Date(period.endMonth.getFullYear(), period.endMonth.getMonth() + 1, 0);
    return { data: aggregateMonthly(csvData, period.startMonth, end), daily: undefined };
  }
  if (theme === "week" && period.startWeekRange && period.endWeekRange) {
    return {
      data: aggregateWeekly(csvData, period.startWeekRange, period.endWeekRange),
      daily: undefined,
    };
  }
  if (theme === "day" && period.startDate && period.endDate) {
    return { data: aggregateDaily(csvData, period.startDate, period.endDate), daily: undefined };
  }
  if (theme === "hour" && period.startDate && period.endDate) {
    return { data: undefined, daily: aggregateHourly(csvDailyData) };
  }
  return { data: csvData, daily: csvDailyData };
}
