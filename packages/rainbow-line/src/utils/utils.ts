import {
  AggregatedData,
  ATTRIBUTES,
  ObjectClassAttribute,
} from "@fukui-kanko/shared/types";
import { StackedBarChartData } from "../components/parts/rainbow-line-stacked-bar-chart";

/**
 * 積み上げ棒グラフ用のデータを作成する関数
 * @param filteredData フィルタリングされた集計データ
 * @param focusedAttribute 焦点を当てる属性（例: "carCategories", "prefectures"など）
 * @returns 積み上げ棒グラフ用のデータ配列
 */
export function createStackedBarChartData(
  filteredData: AggregatedData[],
  focusedAttribute: ObjectClassAttribute = "carCategories",
): StackedBarChartData[] {
  const list = ATTRIBUTES[focusedAttribute];

  const chartData = filteredData.map((row) => {
    const data: StackedBarChartData = {
      name: new Date(row["aggregate from"]).toLocaleDateString(),
    };

    Object.keys(list).forEach((listitem) => {
      data[list[listitem as keyof typeof list]] = Object.keys(row)
        // TODO: 厳密でないフィルタなので、もっと壊れづらいものを考える
        .filter((key) => key.startsWith(listitem) || key.endsWith(listitem))
        .map((key) => Number(row[key]))
        .reduce((sum, current) => (sum += current), 0);
    });

    return data;
  });

  return chartData;
}
