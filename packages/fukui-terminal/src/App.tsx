import { Period } from "@/interfaces/period.interface";
import { useDailyDataEffect, useFilteredData } from "@/lib/hooks/period-data-effects";
import { useEffect, useState } from "react";
import { getRawData } from "@fukui-kanko/shared";
import { Checkbox, Label, Select } from "@fukui-kanko/shared/components/ui";
import { AggregatedData } from "@fukui-kanko/shared/types";
import { PeriodGraphPanel } from "./components/parts/period-graph-panel";

function App() {
  const [type, setType] = useState<"month" | "week" | "day" | "hour">("month");
  const [csvData, setCsvData] = useState<AggregatedData[]>([]);
  const [csvDailyData, setCsvDailyData] = useState<AggregatedData[]>([]);
  const [compareCsvDailyData, setCompareCsvDailyData] = useState<AggregatedData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [compareIsLoading, setCompareIsLoading] = useState(false);
  const [compareMode, setCompareMode] = useState(false);

  // 本期間の状態
  const [period, setPeriod] = useState<Period>({
    startDate: undefined,
    endDate: undefined,
    startMonth: undefined,
    endMonth: undefined,
    startWeekRange: undefined,
    endWeekRange: undefined,
  });
  const [filteredData, setFilteredData] = useState<AggregatedData[]>([]);
  const [filteredDailyData, setFilteredDailyData] = useState<AggregatedData[]>([]);

  // 比較期間の状態
  const [comparePeriod, setComparePeriod] = useState<Period>({
    startDate: undefined,
    endDate: undefined,
    startMonth: undefined,
    endMonth: undefined,
    startWeekRange: undefined,
    endWeekRange: undefined,
  });
  const [compareFilteredData, setCompareFilteredData] = useState<AggregatedData[]>([]);
  const [compareFilteredDailyData, setCompareFilteredDailyData] = useState<AggregatedData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rawData = await getRawData({
          objectClass: "Person",
          placement: "fukui-station-east-entrance",
          aggregateRange: "full",
        });
        setCsvData(rawData);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("データの取得に失敗しました:", error);
        setCsvData([]);
      }
    };
    fetchData();
  }, []);

  // 本期間の集計データを期間・テーマ・データ変更時に再計算
  useFilteredData(type, period, csvData, csvDailyData, setFilteredData, setFilteredDailyData);

  // 比較期間の集計データを期間・テーマ・データ変更時に再計算
  useFilteredData(
    type,
    comparePeriod,
    csvData,
    compareCsvDailyData,
    setCompareFilteredData,
    setCompareFilteredDailyData,
  );

  // 本期間の時間別データを取得・更新
  useDailyDataEffect(type, period, setCsvDailyData, setIsLoading);

  // 比較期間の時間別データを取得・更新
  useDailyDataEffect(type, comparePeriod, setCompareCsvDailyData, setCompareIsLoading);

  return (
    <div className="h-full w-full max-w-full text-center flex flex-col items-center gap-2 mt-3">
      <div className="flex flex-row items-center gap-17 mr-24">
        <div className="flex flex-row items-center gap-2">
          <p>表示単位</p>
          <Select
            value={type}
            onValueChange={(v) => {
              const newType = v as "month" | "week" | "day" | "hour";
              setType(newType);
              // テーマ変更時に値をリセット
              setPeriod({
                startDate: undefined,
                endDate: undefined,
                startMonth: undefined,
                endMonth: undefined,
                startWeekRange: undefined,
                endWeekRange: undefined,
              });
              setComparePeriod({
                startDate: undefined,
                endDate: undefined,
                startMonth: undefined,
                endMonth: undefined,
                startWeekRange: undefined,
                endWeekRange: undefined,
              });
            }}
          ></Select>
        </div>
        <div className="flex flex-row items-center gap-2">
          <Checkbox
            checked={compareMode}
            onCheckedChange={(v) => setCompareMode(!!v)}
            className="bg-white border-black hover:bg-gray-100"
          />
          <Label htmlFor="terms" className="text-base">
            2期間比較
          </Label>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row w-full gap-8 justify-center">
        <PeriodGraphPanel
          theme={type}
          period={period}
          setPeriod={setPeriod}
          isCompareMode={compareMode}
          isLoading={isLoading}
          filteredData={filteredData}
          filteredDailyData={filteredDailyData}
        />
        {compareMode && (
          <PeriodGraphPanel
            theme={type}
            period={comparePeriod}
            setPeriod={setComparePeriod}
            isCompareMode={compareMode}
            isLoading={compareIsLoading}
            filteredData={compareFilteredData}
            filteredDailyData={compareFilteredDailyData}
          />
        )}
      </div>
    </div>
  );
}

export default App;
