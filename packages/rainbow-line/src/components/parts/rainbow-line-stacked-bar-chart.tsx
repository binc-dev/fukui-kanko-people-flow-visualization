import React from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@fukui-kanko/shared/components/ui";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

// データ型は必要に応じて調整してください
export type StackedBarChartData = {
  name: string;
  [key: string]: number | string;
};

export type RainbowLineStackedBarChartProps = {
  data: StackedBarChartData[];
  keys: string[]; // 積み上げるキー
  colors?: string[]; // 各キーの色
};

// chartConfigの定義
const chartConfig = {
  totalCount: { label: "検出回数" },
};

// カスタムツールチップコンポーネント（値がゼロのものは表示しない）
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // 値がゼロでない項目のみをフィルタリング
    const filteredPayload = payload.filter((entry: any) => {
      const value = Number(entry.value);
      return value > 0;
    });

    if (filteredPayload.length === 0) {
      return null; // すべての値がゼロの場合はツールチップを表示しない
    }

    return <ChartTooltipContent className="bg-white" payload={filteredPayload} label={label} />;
  }

  return null;
};

export const RainbowLineStackedBarChart: React.FC<RainbowLineStackedBarChartProps> = ({
  data,
  keys,
  colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"],
}) => {
  return (
    <ChartContainer config={chartConfig} className="h-80 w-full">
      <BarChart data={data} margin={{ top: 10, right: 40, left: 20, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tickMargin={8} tick={{ fontSize: 12 }} />
        <YAxis tickMargin={8} tick={{ fontSize: 12 }} />
        <ChartTooltip
          cursor={{ fillOpacity: 0.4, stroke: "hsl(var(--primary))" }}
          content={<CustomTooltip />}
        />
        {keys.map((key, idx) => (
          <Bar
            key={key}
            dataKey={key}
            stackId="a"
            fill={colors[idx % colors.length]}
            stroke={colors[idx % colors.length]}
            strokeWidth={0}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
};

export default RainbowLineStackedBarChart;
