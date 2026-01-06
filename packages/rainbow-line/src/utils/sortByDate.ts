import { AggregatedDataBase } from "@fukui-kanko/shared";

/**
 * Sorts an array of aggregated data by date in ascending order
 * @param data - Array of data with "aggregate from" date field
 * @returns New array sorted by date in ascending order
 */
export function sortByDate<T extends AggregatedDataBase>(data: T[]): T[] {
  return [...data].sort(
    (a, b) => new Date(a["aggregate from"]).getTime() - new Date(b["aggregate from"]).getTime(),
  );
}
