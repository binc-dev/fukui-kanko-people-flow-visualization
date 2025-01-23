"use client";

import { SeriesConfigCard } from "@/components/parts/series-config-card.component";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  ChartContainer,
  type ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import {
  AGE_RANGES,
  AggregatedData,
  attributeValueText,
  CAR_CATEGORIES,
  GENDERS,
  PREFECTURES,
} from "@/interfaces/aggregated-data.interface";
import { defaultSeriesName, GraphSeries } from "@/interfaces/graph-series.interface";
import { PartiallyRequired } from "@/lib/utils";
import { GraphIcon, PlusIcon, StarIcon } from "@primer/octicons-react";
import Papa from "papaparse";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

function isSeriesValid(
  series: GraphSeries,
): series is PartiallyRequired<GraphSeries, "placement" | "objectClass"> {
  return (
    series.placement !== undefined &&
    series.objectClass !== undefined &&
    (series.graphType === "simple" ? true : series.focusedAttribute !== undefined)
  );
}

function getDefaultDateRange(): DateRange {
  return {
    from: (() => {
      const from = new Date();
      from.setMilliseconds(0);
      from.setSeconds(0);
      from.setMinutes(0);
      from.setHours(0);
      from.setDate(from.getDate() - 14);
      return from;
    })(),
    to: (() => {
      const to = new Date();
      to.setMilliseconds(0);
      to.setSeconds(0);
      to.setMinutes(0);
      to.setHours(0);
      to.setDate(to.getDate() - 1);
      return to;
    })(),
  };
}

export default function Home() {
  const [dirty, setDirty] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [seriesAll, setSeriesAll] = useState<GraphSeries[] | undefined>(undefined);
  const [isSeriesAllValid, setIsSeriesAllValid] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>(getDefaultDateRange());
  const [data, setData] = useState<Record<string, string | number>[] | undefined>(undefined);

  const getChartConfig = (): ChartConfig => {
    if (seriesAll && data && Object.keys(data[0]).length > 1) {
      const config: ChartConfig = {};
      Object.keys(data[0]).forEach((k) => {
        if (k === "date") return;
        const [id, attributeKey] = k.split("#");
        const series = seriesAll.find((v) => v.id === id);
        if (series === undefined) return id;
        let label = series.name ?? defaultSeriesName(series);
        if (attributeKey !== undefined && attributeKey !== "" && series.focusedAttribute)
          label += attributeValueText(series.focusedAttribute, attributeKey);
        config[k] = {
          label,
        };
      });
      return config;
    } else return {};
  };

  const setSeries = (series: GraphSeries) => {
    if (seriesAll === undefined || seriesAll.length === 0)
      throw new Error("cannot find update target series");
    const newSeriesAll = [...seriesAll];
    const targetIndex = newSeriesAll.findIndex((newSeries) => newSeries.id === series.id);
    newSeriesAll[targetIndex] = series;
    setDirty(true);
    setSeriesAll(newSeriesAll);
    setIsSeriesAllValid(newSeriesAll.every(isSeriesValid));
  };
  const onClickAddSeries = () => {
    const newSeriesAll = seriesAll ? [...seriesAll] : [];
    newSeriesAll.push({ id: crypto.randomUUID(), graphType: "simple", show: true });
    setSeriesAll(newSeriesAll);
    setIsSeriesAllValid(newSeriesAll.every(isSeriesValid));
  };
  const onClickRemoveSeries = (id: string) => {
    const newSeriesAll = seriesAll ? [...seriesAll.filter((series) => series.id !== id)] : [];
    const newData = data
      ? [
          ...data.map((row) => {
            const newRow = { ...row };
            Object.keys(newRow).forEach((key) => {
              if (key.includes(id)) delete newRow[key];
            });
            return newRow;
          }),
        ]
      : [];
    setSeriesAll(newSeriesAll);
    setIsSeriesAllValid(newSeriesAll.every(isSeriesValid));
    setData(newData);
  };

  const onClickApply = async () => {
    setDirty(false);
    if (!date || !date.from || !date.to || !seriesAll) {
      setData(undefined);
      return;
    }
    let newData: (Record<string, string | number> & { date: string })[] = [];
    for (const i = new Date(date.from); i <= date.to; i.setDate(i.getDate() + 1))
      newData.push({
        date: `${i.getFullYear()}-${(i.getMonth() + 1).toString().padStart(2, "0")}-${i.getDate().toString().padStart(2, "0")}`,
      });

    for await (const series of seriesAll.filter((v) => v.show)) {
      if (!series.placement && !series.objectClass) return;
      const csvStr = await (
        await fetch(`${window.location.origin}/${series.placement}/${series.objectClass}.csv`)
      ).text();

      const rawData = Papa.parse<AggregatedData>(csvStr, { header: true }).data.map(
        (rawDataRow) => {
          if (series.exclude === undefined) return rawDataRow;

          const filteredRow = { ...rawDataRow };
          Object.keys(filteredRow).forEach((key) => {
            const isKeyMatch = key
              .split(" ")
              .some((keyPart) =>
                series.exclude
                  ? Object.values(series.exclude).some((exclude) =>
                      exclude.some((excludeItem) => keyPart === excludeItem),
                    )
                  : false,
              );
            if (isKeyMatch) delete filteredRow[key];
          });
          filteredRow["total count"] = Object.entries(filteredRow)
            .filter(
              ([k]) =>
                ![
                  "placement",
                  "object class",
                  "aggregate from",
                  "aggregate to",
                  "total count",
                ].includes(k),
            )
            .reduce((sum, current) => (sum += Number(current[1])), 0);
          return filteredRow;
        },
      );

      if (series.graphType === "simple") {
        newData = newData.map((newDataRow) => ({
          ...newDataRow,
          [series.id]:
            Number(
              rawData.find(
                (rawDataRow) =>
                  String(rawDataRow["aggregate from"]).slice(0, 10) === newDataRow.date,
              )?.["total count"],
            ) ?? 0,
        }));
      } else if (series.focusedAttribute) {
        const orientedData: (Record<string, string | number> & { "aggregate from": string })[] =
          rawData.map((rawDataRow) => {
            let list;
            switch (series.focusedAttribute) {
              case "ageRanges":
                list = AGE_RANGES;
                break;
              case "genders":
                list = GENDERS;
                break;
              case "prefectures":
                list = PREFECTURES;
                break;
              case "carCategories":
                list = CAR_CATEGORIES;
                break;
              default:
                throw new Error("invalid focuced attribute");
            }
            const data: Record<string, string | number> & { "aggregate from": string } = {
              "aggregate from": rawDataRow["aggregate from"],
            };
            Object.keys(list)
              .map((listitem) => ({
                [`${series.id}#${listitem}`]: Object.keys(rawDataRow)
                  // TODO: 厳密でないフィルタなので、もっと壊れづらいものを考える
                  .filter((key) => key.startsWith(listitem) || key.endsWith(listitem))
                  .map((key) => Number(rawDataRow[key]))
                  .reduce((sum, current) => (sum += current), 0),
              }))
              .forEach((obj) => Object.entries(obj).forEach(([k, v]) => (data[k] = v)));
            return data;
          });
        newData = newData.map((newDataRow) => ({
          ...newDataRow,
          ...(() => {
            const orientedDataItem = {
              ...(orientedData.find(
                (orientedDataRow) =>
                  orientedDataRow["aggregate from"].slice(0, 10) === newDataRow.date,
              ) as Record<string, string | number>),
            };
            delete orientedDataItem?.["aggregate from"];
            return orientedDataItem;
          })(),
        }));
      }
    }
    setData(newData);
  };

  return (
    <>
      <aside className="relative flex h-[calc(100svh_-_96px)] min-h-[calc(100svh_-_96px)] w-72 flex-col items-center gap-y-4 overflow-y-auto border-r-2 px-2">
        <section className="w-full">
          <h2 className="mb-2 text-lg font-bold">📅 期間</h2>
          <Calendar
            mode="range"
            selected={date}
            onSelect={(v) => {
              setDate(v);
              setDirty(true);
            }}
            disabled={{
              before: new Date("2024-10-17"),
              after: (() => {
                const from = new Date();
                from.setDate(from.getDate() - 1);
                return from;
              })(),
            }}
            className="mx-auto w-fit rounded-md border"
          />
        </section>
        <section className="w-full flex-grow">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-bold">📈 系統</h2>
            <Button variant="outline" size="icon" onClick={onClickAddSeries}>
              <PlusIcon size="medium" />
            </Button>
          </div>
          <div className="flex w-full flex-col gap-y-2 px-1">
            {seriesAll?.map((series) => (
              <SeriesConfigCard
                key={series.id}
                series={series}
                notify={setSeries}
                onRemoveClick={() => onClickRemoveSeries(series.id)}
              />
            ))}
          </div>
        </section>
        <section className="sticky bottom-0 flex w-full justify-center bg-[rgb(from_hsl(var(--background))_r_g_b_/_0.8)] py-4 backdrop-blur-sm">
          <Button
            onClick={() => onClickApply()}
            className="mx-auto"
            disabled={!(dirty && isSeriesAllValid)}
          >
            <GraphIcon size="medium" />
            グラフに反映
          </Button>
        </section>
      </aside>
      <article className="flex-glow flex h-[calc(100svh_-_96px)] min-h-[calc(100svh_-_96px)] w-[calc(100%_-_288px)] flex-col items-center justify-center">
        <div className="flex h-12 w-full gap-x-2 pl-4">
          <Input
            placeholder="グラフタイトル"
            onChange={(ev) => setTitle(!!ev.target.value ? ev.target.value : undefined)}
            disabled={!seriesAll || seriesAll.length === 0}
          />
          <Button
            variant="outline"
            size="icon"
            disabled={!seriesAll || seriesAll.length === 0 || dirty}
          >
            <StarIcon size="medium" />
          </Button>
        </div>
        {!dirty && data && Object.keys(data[0]).length > 1 ? (
          <ChartContainer
            config={getChartConfig()}
            className="h-[calc(100svh_-_96px)] min-h-[calc(100svh_-_96px_-_48px)] w-full flex-grow"
          >
            <BarChart
              data={data}
              stackOffset={
                seriesAll && seriesAll.every((item) => item.graphType === "ratio")
                  ? "expand"
                  : "none"
              }
            >
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" tickLine={false} tickMargin={7} axisLine={false} />
              <YAxis
                type="number"
                tickLine={true}
                tickCount={10}
                domain={[0, (dataMax: number) => Math.floor(dataMax)]}
              />
              {Object.keys(data[0])
                .filter((key) => key !== "date")
                .map((key) => [key, ...key.split("#")])
                .map(([key, id, attributeKey], i) => (
                  <Bar
                    type="linear"
                    key={key}
                    dataKey={key}
                    stackId={id}
                    name={
                      (seriesAll
                        ? (() => {
                            const series = seriesAll.find((item) => item.id === id);
                            return series ? (series.name ?? defaultSeriesName(series)) : undefined;
                          })()
                        : undefined) ?? id + (attributeKey ? `#${attributeKey}` : "")
                    }
                    fill={`hsl(var(--chart-${(i % 5) + 1}))`}
                    radius={id.split("#")[1] === "" ? 2 : 0}
                  />
                ))}
              <ChartTooltip cursor={false} content={<ChartTooltipContent className="bg-white" />} />
              {Object.keys(data[0]).length <= 10 ? (
                <ChartLegend content={<ChartLegendContent />} />
              ) : undefined}
            </BarChart>
          </ChartContainer>
        ) : (
          <p className="flex-glow my-auto">グラフに表示するデータをサイドバーで設定して下さい</p>
        )}
      </article>
    </>
  );
}
