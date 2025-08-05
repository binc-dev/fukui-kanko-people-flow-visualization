import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AggregatedData } from "@/interfaces/aggregated-data.interface";
import React from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

const chartConfig = {
  totalCount: { label: "人物検出回数" },
};

type GraphProps = {
  data: AggregatedData[];
  xKey?: string;
  yKey?: string;
  type: "month" | "week" | "day" | "hour";
  width?: number;
  height?: number;
};

type XAxisTickProps = {
  x: number;
  y: number;
  payload: { value: string };
  index?: number;
};

const lineColors = [
  "#E05B53",
  "#E063AA",
  "#E59562",
  "#E5C930",
  "#61C558",
  "#50AC6E",
  "#57CBD4",
  "#456DE1",
  "#3248A9",
  "#7E55E1",
];

function renderTick(props: XAxisTickProps, data: AggregatedData[], xKey: string) {
  const d = data.find((row) => row[xKey] === props.payload.value);
  return <CustomizedXAxisTick {...props} dayOfWeek={d?.dayOfWeek} holidayName={d?.holidayName} />;
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

const Graph: React.FC<GraphProps> = ({
  data,
  xKey = "aggregateFrom",
  yKey = "totalCount",
  type,
}) => {
  if (type === "hour") {
    // 日付ごとにグループ化し、xKeyを時間のみに変換
    const grouped: { [date: string]: AggregatedData[] } = {};
    data.forEach((row) => {
      const value = String(row[xKey]);
      const [date, hour] = value.split(" ");
      if (!grouped[date]) grouped[date] = [];
      // 新しいオブジェクトでxKeyを時間のみに
      grouped[date].push({
        ...row,
        [xKey]: hour, // "HH:00" のみ
        [`${date}_${yKey}`]: row[yKey],
      });
    });

    return (
      <ChartContainer config={chartConfig}>
        <LineChart margin={{ top: 10, right: 40 }}>
          {Object.entries(grouped).map(([date, rows], idx) => (
            <Line
              key={date}
              data={rows}
              dataKey={`${date}_${yKey}`}
              name={date}
              stroke={lineColors[idx % lineColors.length]}
              strokeWidth={2}
            />
          ))}
          <CartesianGrid />
          <XAxis dataKey={xKey} tickMargin={8} allowDuplicatedCategory={false} />
          <YAxis />
          <ChartTooltip
            cursor={{ fillOpacity: 0.4, stroke: "hsl(var(--primary))" }}
            content={<ChartTooltipContent className="bg-white" />}
          />
          <ChartLegend
            wrapperStyle={{
              width: "100%",
            }}
            content={<ChartLegendContent />}
          />
        </LineChart>
      </ChartContainer>
    );
  }

  if (type === "month" || type === "week" || type === "day") {
    return (
      <ChartContainer config={chartConfig}>
        <LineChart data={data} margin={{ top: 10, right: 40 }}>
          <Line dataKey={yKey} strokeWidth={3} stroke="#2563eb" />
          <CartesianGrid />
          <XAxis
            dataKey={xKey}
            tick={type === "day" ? (props) => renderTick(props, data, xKey) : undefined}
            tickMargin={8}
          />
          <YAxis />
          <ChartTooltip
            cursor={{ fillOpacity: 0.4, stroke: "hsl(var(--primary))" }}
            content={<ChartTooltipContent className="bg-white" />}
          />
          <ChartLegend
            wrapperStyle={{
              width: "100%",
            }}
            content={<ChartLegendContent />}
          />
        </LineChart>
      </ChartContainer>
    );
  }

  return (
    <div>
      <p>このタイプ（{type}）のグラフは開発中です。</p>
    </div>
  );
};

export { Graph };
