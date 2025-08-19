import React, { useCallback, useMemo } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@fukui-kanko/shared/components/ui";
import { GRAPH_VIEW_TYPES } from "@fukui-kanko/shared/types";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

// データ型は必要に応じて調整してください
export type StackedBarChartData = {
  name: string;
  dayOfWeek?: string;
  holidayName?: string;
  [key: string]: number | string | undefined;
};

export type RainbowLineStackedBarChartProps = {
  data: StackedBarChartData[];
  keys: string[]; // 積み上げるキー
  colors?: string[]; // 各キーの色
  type: keyof typeof GRAPH_VIEW_TYPES; // グラフの種類
};

// chartConfigの定義
const chartConfig = {
  totalCount: { label: "検出回数" },
};

type XAxisTickProps = {
  x: number;
  y: number;
  payload: { value: string };
  index?: number;
};

function renderTick(props: XAxisTickProps, data: StackedBarChartData[]) {
  const d = data.find((row) => row.name === props.payload.value);
  return (
    <CustomizedXAxisTick
      {...props}
      dayOfWeek={d?.dayOfWeek !== undefined ? String(d.dayOfWeek) : undefined}
      holidayName={d?.holidayName !== undefined ? String(d.holidayName) : undefined}
    />
  );
}

const CustomizedXAxisTick = ({
  x,
  y,
  payload,
  dayOfWeek,
  holidayName,
}: {
  x: number;
  y: number;
  payload: { value: string };
  dayOfWeek?: string;
  holidayName?: string;
}) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={0} textAnchor="middle" fill="#666" fontSize={12}>
        <tspan x={0} dy={5}>
          {payload.value}
        </tspan>
        {holidayName ? (
          <tspan x={0} dy={16} fill="red" fontSize={10}>
            {holidayName}
          </tspan>
        ) : (
          dayOfWeek && (
            <tspan
              x={0}
              dy={16}
              fill={dayOfWeek === "土" ? "blue" : dayOfWeek === "日" ? "red" : undefined}
              fontSize={10}
            >
              {dayOfWeek}
            </tspan>
          )
        )}
      </text>
    </g>
  );
};

export const RainbowLineStackedBarChart: React.FC<RainbowLineStackedBarChartProps> = ({
  data,
  keys,
  colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"],
  type,
}) => {
  const tickRenderer = useCallback((props: XAxisTickProps) => renderTick(props, data), [data]);

  // 15日より多いデータ数の場合、日曜基準の目盛りを表示
  const sundayTicks = useMemo(() => {
    if (type !== "day") return undefined;
    const uniqueDays = new Set(data.map((row) => String(row["aggregateFrom"]))).size;
    if (uniqueDays <= 15) return undefined;
    const ticks = data
      .filter((row) => row.dayOfWeek !== undefined && row.dayOfWeek === "日")
      .map((row) => String(row["aggregateFrom"]));
    return ticks;
  }, [data, type, "aggregateFrom"]);

  return (
    <ChartContainer config={chartConfig} className="h-80 w-full">
      <BarChart data={data} margin={{ top: 10, right: 40, left: 20, bottom: 10 }}>
        {keys.map((key, idx) => {
          return (
            <Bar
              key={key}
              dataKey={key}
              stackId="a"
              fill={colors[idx % colors.length]}
              stroke={colors[idx % colors.length]}
              strokeWidth={0}
            />
          );
        })}
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          tick={type === "day" ? tickRenderer : undefined}
          tickMargin={8}
          ticks={sundayTicks}
        />
        <YAxis />
        <ChartTooltip
          cursor={{ fillOpacity: 0.4, stroke: "hsl(var(--primary))" }}
          content={<ChartTooltipContent className="bg-white" />}
        />
      </BarChart>
    </ChartContainer>
  );
};

export default RainbowLineStackedBarChart;
