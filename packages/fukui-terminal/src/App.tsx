import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AggregatedData } from "@/interfaces/aggregated-data.interface";
import { Period } from "@/interfaces/period.interface";
import { getData } from "@/lib/data/csv";
import { useDailyDataEffect, useFilteredData } from "@/lib/hooks/period-data-effects";
import { useEffect, useState } from "react";
import { PeriodGraphPanel } from "./components/parts/period-graph-panel";

function App() {
  const [theme, setTheme] = useState<"month" | "week" | "day" | "hour">("month");
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
      const rawData = await getData("Person");
      setCsvData(rawData);
    };
    fetchData();
  }, []);

  // 本期間の集計データを期間・テーマ・データ変更時に再計算
  useFilteredData(theme, period, csvData, csvDailyData, setFilteredData, setFilteredDailyData);

  // 比較期間の集計データを期間・テーマ・データ変更時に再計算
  useFilteredData(
    theme,
    comparePeriod,
    csvData,
    compareCsvDailyData,
    setCompareFilteredData,
    setCompareFilteredDailyData,
  );

  // 本期間の時間別データを取得・更新
  useDailyDataEffect(theme, period, setCsvDailyData, setIsLoading);

  // 比較期間の時間別データを取得・更新
  useDailyDataEffect(theme, comparePeriod, setCompareCsvDailyData, setCompareIsLoading);

  return (
    <div className="h-full w-full max-w-full text-center flex flex-col items-center gap-2 mt-3">
      <div className="flex flex-row items-center gap-17 mr-24">
        <div className="flex flex-row items-center gap-2">
          <p>表示単位</p>
          <Select
            value={theme}
            onValueChange={(v) => {
              const newTheme = v as "month" | "week" | "day" | "hour";
              setTheme(newTheme);
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
          >
            <SelectTrigger className="w-[120px] bg-white text-black">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">月別</SelectItem>
              <SelectItem value="week">週別</SelectItem>
              <SelectItem value="day">日別</SelectItem>
              <SelectItem value="hour">時間別</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-row items-center gap-2">
          <Checkbox
            checked={compareMode}
            onCheckedChange={(v) => setCompareMode(!!v)}
            className="bg-white"
          />
          <Label htmlFor="terms" className="text-base">
            2期間比較
          </Label>
        </div>
      </div>
      <div className="flex flex-row w-full gap-8 justify-center">
        <PeriodGraphPanel
          theme={theme}
          period={period}
          setPeriod={setPeriod}
          isLoading={isLoading}
          filteredData={filteredData}
          filteredDailyData={filteredDailyData}
        />
        {compareMode && (
          <PeriodGraphPanel
            theme={theme}
            period={comparePeriod}
            setPeriod={setComparePeriod}
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
