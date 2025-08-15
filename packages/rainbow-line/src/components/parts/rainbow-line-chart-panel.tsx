import { useEffect, useState } from "react";
import { RangeSelector } from "@fukui-kanko/shared/components/parts";
import { ChartConfig, ChartContainer } from "@fukui-kanko/shared/components/ui";
import { AggregatedData, ATTRIBUTES } from "@fukui-kanko/shared/types";
import { cn, getMaxDate } from "@fukui-kanko/shared/utils";
import { CartesianGrid, ComposedChart, XAxis, YAxis } from "recharts";
import { createStackedBarChartData } from "../../utils/utils";
import RainbowLineStackedBarChart, { StackedBarChartData } from "./rainbow-line-stacked-bar-chart";

export function RainbowLineChartPanel({
  data,
  className,
}: {
  data: AggregatedData[];
  className?: string;
}) {
  const [chartConfig] = useState<ChartConfig>({
    "total count": {
      label: "ナンバープレート検出回数",
    },
  });

  const [graphRange, setGraphRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date("2025-08-01"),
    to: getMaxDate(),
  });
  const [dataInRange, setDataInRange] = useState<AggregatedData[]>([]);
  const [stackedBarChartData, setStackedBarChartData] = useState<StackedBarChartData[]>([]);
  const [prefectureStackedBarChartData, setPrefectureStackedBarChartData] = useState<
    StackedBarChartData[]
  >([]);

  useEffect(() => {
    const filteredData = data.filter((row) => {
      const aggregatedFrom = new Date(row["aggregate from"]);
      return (
        aggregatedFrom >= (graphRange.from || new Date(0)) &&
        aggregatedFrom < (graphRange.to || new Date())
      );
    });

    setDataInRange(filteredData);

    // 積み上げ棒グラフ用のデータを作成（車種カテゴリー別）
    const chartData = createStackedBarChartData(filteredData, "carCategories");
    setStackedBarChartData(chartData);

    // 積み上げ棒グラフ用のデータを作成（都道府県別）
    const prefectureChartData = createStackedBarChartData(filteredData, "prefectures");
    setPrefectureStackedBarChartData(prefectureChartData);
  }, [data, graphRange]);

  return (
    <div
      className={cn(
        "flex flex-col items-center grow w-full h-full max-h-full overflow-hidden",
        className,
      )}
    >
      <RangeSelector
        type={"date"}
        start={graphRange.from}
        end={graphRange.to}
        setStart={(d) => setGraphRange({ ...graphRange, from: d })}
        setEnd={(d) => setGraphRange({ ...graphRange, to: d })}
      ></RangeSelector>

      <div className="flex gap-x-4 w-full min-w-full grow overflow-auto">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2 text-center">全体の推移</h3>
          <ChartContainer config={chartConfig}>
            <ComposedChart>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="aggregate from"
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
                tick={{ fontSize: 12 }}
                height={50}
                interval={0}
                tickCount={dataInRange.length > 10 ? 10 : dataInRange.length}
              />
              <YAxis dataKey={"total count"} tickLine={true} allowDecimals={false} />
            </ComposedChart>
          </ChartContainer>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2 text-center">車両分類</h3>
          <RainbowLineStackedBarChart
            data={stackedBarChartData}
            keys={Object.values(ATTRIBUTES.carCategories)}
            colors={["#8884d8", "#82ca9d", "#ffc658", "#ff8042"]}
          />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2 text-center">都道府県</h3>
          <RainbowLineStackedBarChart
            data={prefectureStackedBarChartData}
            keys={Object.values(ATTRIBUTES.prefectures)}
            colors={[
              "#FF6B6B",
              "#4ECDC4",
              "#45B7D1",
              "#96CEB4",
              "#FFEAA7",
              "#DDA0DD",
              "#98D8C8",
              "#F7DC6F",
              "#BB8FCE",
              "#85C1E9",
              "#F8C471",
              "#82E0AA",
              "#F1948A",
              "#85C1E9",
              "#D7BDE2",
              "#A9DFBF",
              "#F9E79F",
              "#D5A6BD",
              "#AED6F1",
              "#A9CCE3",
              "#FAD7A0",
              "#ABEBC6",
              "#F5B7B1",
              "#A3E4D7",
              "#D2B4DE",
              "#A9DFBF",
              "#FCF3CF",
              "#FADBD8",
              "#D4E6F1",
              "#D1F2EB",
              "#E8DAEF",
              "#EBDEF0",
              "#EAF2F8",
              "#E8F8F5",
              "#FEF9E7",
              "#FDEDEC",
              "#EBF5FB",
              "#E9F7EF",
              "#FDF2E9",
              "#EAEDED",
              "#F4F6F6",
              "#FDEAA7",
              "#D5DBDB",
              "#F8F9FA",
              "#E5E7E9",
            ]}
          />
        </div>
      </div>
    </div>
  );
}
