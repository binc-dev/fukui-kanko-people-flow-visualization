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
import { getFilteredData } from "@/lib/aggregation";
import { getDailyData, getData } from "@/lib/data/csv";
import { useEffect, useState } from "react";
import { PeriodGraphPanel } from "./components/parts/period-graph-panel";

function App() {
  useEffect(() => {
    // bodyとhtmlのマージン・パディングをリセット
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.documentElement.style.margin = "0";
    document.documentElement.style.padding = "0";
  }, []);

  // 開発環境かどうかを判定
  const isDev = import.meta.env.DEV;
  // ローカル開発時はランディングページのポート、本番時は相対パス
  const homeUrl = isDev ? "http://localhost:3004" : "../";

  const containerStyle = {
    minHeight: "100vh",
    width: "100vw",
    background: "linear-gradient(to bottom right, #dbeafe, #e0e7ff)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Arial, sans-serif",
    margin: 0,
    padding: 0,
    boxSizing: "border-box" as const,
  };

  const contentStyle = {
    textAlign: "center" as const,
    padding: "2rem",
    maxWidth: "1600px", // 追加: コンテンツの最大幅を広げる
    width: "70%", // 追加: 幅いっぱいに広げる
  };

  const titleStyle = {
    fontSize: "2.5rem",
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: "1rem",
  };

  const buttonStyle = {
    display: "inline-block",
    backgroundColor: "#10b981",
    color: "white",
    padding: "0.75rem 1.5rem",
    borderRadius: "0.375rem",
    textDecoration: "none",
    transition: "background-color 0.2s",
    border: "none",
    cursor: "pointer",
  };

  const [theme, setTheme] = useState<"month" | "week" | "day" | "hour">("month");
  const [csvData, setCsvData] = useState<AggregatedData[]>([]);
  const [csvDailyData, setCsvDailyData] = useState<AggregatedData[]>([]);
  const [compareCsvDailyData, setCompareCsvDailyData] = useState<AggregatedData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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

  useEffect(() => {
    if (theme !== "hour") {
      setIsLoading(false);
      return;
    }
    let isCurrent = true;
    const fetchData = async () => {
      if (period.startDate && period.endDate) {
        setIsLoading(true);
        const rawData = await getDailyData("Person", period.startDate, period.endDate);
        if (isCurrent) {
          setCsvDailyData(rawData);
          setIsLoading(false);
        }
      }
    };
    fetchData();

    return () => {
      isCurrent = false;
    };
  }, [theme, period.startDate, period.endDate]);

  useEffect(() => {
    if (theme !== "hour") {
      setIsLoading(false);
      return;
    }
    let isCurrent = true;
    const fetchData = async () => {
      if (comparePeriod.startDate && comparePeriod.endDate) {
        setIsLoading(true);
        const rawData = await getDailyData(
          "Person",
          comparePeriod.startDate,
          comparePeriod.endDate,
        );
        if (isCurrent) {
          setCompareCsvDailyData(rawData);
          setIsLoading(false);
        }
      }
    };
    fetchData();

    return () => {
      isCurrent = false;
    };
  }, [theme, comparePeriod.startDate, comparePeriod.endDate]);

  // 本期間の集計データを期間・テーマ・データ変更時に再計算
  useEffect(() => {
    const { data, daily } = getFilteredData(theme, period, csvData, csvDailyData);
    if (data !== undefined) setFilteredData(data);
    if (daily !== undefined) setFilteredDailyData(daily);
  }, [
    theme,
    period.startMonth,
    period.endMonth,
    period.startWeekRange,
    period.endWeekRange,
    period.startDate,
    period.endDate,
    csvData,
    csvDailyData,
  ]);

  // 比較期間の集計データを期間・テーマ・データ変更時に再計算
  useEffect(() => {
    const { data, daily } = getFilteredData(theme, comparePeriod, csvData, compareCsvDailyData);
    if (data !== undefined) setCompareFilteredData(data);
    if (daily !== undefined) setCompareFilteredDailyData(daily);
  }, [
    theme,
    comparePeriod.startMonth,
    comparePeriod.endMonth,
    comparePeriod.startWeekRange,
    comparePeriod.endWeekRange,
    comparePeriod.startDate,
    comparePeriod.endDate,
    csvData,
    compareCsvDailyData,
  ]);

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <h1 style={titleStyle}>福井駅周辺データ可視化</h1>
        <div className="flex flex-col items-center gap-6 my-8">
          <div className="flex flex-row items-center gap-4">
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
              <SelectTrigger className="w-[180px] bg-white text-black">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">月別</SelectItem>
                <SelectItem value="week">週別</SelectItem>
                <SelectItem value="day">日別</SelectItem>
                <SelectItem value="hour">時間別</SelectItem>
              </SelectContent>
            </Select>
            <Checkbox
              checked={compareMode}
              onCheckedChange={(v) => setCompareMode(!!v)}
              className="bg-white"
            />
            <Label htmlFor="terms">2期間比較</Label>
          </div>
          <div className="flex flex-row gap-8 justify-center">
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
                isLoading={isLoading}
                filteredData={compareFilteredData}
                filteredDailyData={compareFilteredDailyData}
              />
            )}
          </div>
        </div>
        <a
          href={homeUrl}
          style={buttonStyle}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#059669")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#10b981")}
        >
          ← トップページに戻る
        </a>
      </div>
    </div>
  );
}

export default App;
