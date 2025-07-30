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
import {
  aggregateDaily,
  aggregateHourly,
  aggregateMonthly,
  aggregateWeekly,
} from "@/lib/aggregation";
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
  const [isLoading, setIsLoading] = useState(false);
  const [compareMode, setCompareMode] = useState(false);

  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [startMonth, setStartMonth] = useState<Date | undefined>(undefined);
  const [endMonth, setEndMonth] = useState<Date | undefined>(undefined);
  const [startWeekRange, setStartWeekRange] = useState<{ from: Date; to: Date } | undefined>(
    undefined,
  );
  const [endWeekRange, setEndWeekRange] = useState<{ from: Date; to: Date } | undefined>(undefined);
  const [filteredData, setFilteredData] = useState<AggregatedData[]>([]);
  const [filteredDailyData, setFilteredDailyData] = useState<AggregatedData[]>([]);

  const [compareStartDate, setCompareStartDate] = useState<Date | undefined>(undefined);
  const [compareEndDate, setCompareEndDate] = useState<Date | undefined>(undefined);
  const [compareStartMonth, setCompareStartMonth] = useState<Date | undefined>(undefined);
  const [compareEndMonth, setCompareEndMonth] = useState<Date | undefined>(undefined);
  const [compareStartWeekRange, setCompareStartWeekRange] = useState<
    { from: Date; to: Date } | undefined
  >(undefined);
  const [compareEndWeekRange, setCompareEndWeekRange] = useState<
    { from: Date; to: Date } | undefined
  >(undefined);
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
      if (startDate && endDate) {
        setIsLoading(true);
        const rawData = await getDailyData("Person", startDate, endDate);
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
  }, [theme, startDate, endDate]);

  useEffect(() => {
    const filtered = csvData;
    const filteredDaily = csvDailyData;

    if (theme === "month" && startMonth && endMonth) {
      // 月末を取得
      const end = new Date(endMonth.getFullYear(), endMonth.getMonth() + 1, 0);
      setFilteredData(aggregateMonthly(csvData, startMonth, end));
      return;
    }

    if (theme === "week" && startWeekRange && endWeekRange) {
      setFilteredData(aggregateWeekly(csvData, startWeekRange, endWeekRange));
      return;
    }

    if (theme === "day" && startDate && endDate) {
      setFilteredData(aggregateDaily(csvData, startDate, endDate));
      return;
    }

    if (theme === "hour" && startDate && endDate) {
      setFilteredDailyData(aggregateHourly(filteredDaily));
      return;
    }

    // 他のthemeの場合はそのまま
    setFilteredData(filtered);
    setFilteredDailyData(filteredDaily);
  }, [
    theme,
    startMonth,
    endMonth,
    startWeekRange,
    endWeekRange,
    startDate,
    endDate,
    csvData,
    csvDailyData,
  ]);

  useEffect(() => {
    if (theme === "month" && compareStartMonth && compareEndMonth) {
      const end = new Date(compareEndMonth.getFullYear(), compareEndMonth.getMonth() + 1, 0);
      setCompareFilteredData(aggregateMonthly(csvData, compareStartMonth, end));
      return;
    }
    if (theme === "week" && compareStartWeekRange && compareEndWeekRange) {
      setCompareFilteredData(aggregateWeekly(csvData, compareStartWeekRange, compareEndWeekRange));
      return;
    }
    if (theme === "day" && compareStartDate && compareEndDate) {
      setCompareFilteredData(aggregateDaily(csvData, compareStartDate, compareEndDate));
      return;
    }
    if (theme === "hour" && compareStartDate && compareEndDate) {
      setCompareFilteredDailyData(aggregateHourly(csvDailyData));
      return;
    }
    setCompareFilteredData(csvData);
    setCompareFilteredDailyData(csvDailyData);
  }, [
    theme,
    compareStartMonth,
    compareEndMonth,
    compareStartWeekRange,
    compareEndWeekRange,
    compareStartDate,
    compareEndDate,
    csvData,
    csvDailyData,
  ]);

  return (
    <>
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
                  setStartMonth(undefined);
                  setEndMonth(undefined);
                  setStartDate(undefined);
                  setEndDate(undefined);
                  setStartWeekRange(undefined);
                  setEndWeekRange(undefined);
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
              <Checkbox checked={compareMode} onCheckedChange={(v) => setCompareMode(!!v)} />
              <Label htmlFor="terms">2期間比較</Label>
            </div>
            <div className="flex flex-row gap-8 justify-center">
              <PeriodGraphPanel
                theme={theme}
                startMonth={startMonth}
                endMonth={endMonth}
                setStartMonth={setStartMonth}
                setEndMonth={setEndMonth}
                startWeekRange={startWeekRange}
                endWeekRange={endWeekRange}
                setStartWeekRange={setStartWeekRange}
                setEndWeekRange={setEndWeekRange}
                startDate={startDate}
                endDate={endDate}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
                isLoading={isLoading}
                filteredData={filteredData}
                filteredDailyData={filteredDailyData}
              />
              {compareMode && (
                <PeriodGraphPanel
                  theme={theme}
                  startMonth={compareStartMonth}
                  endMonth={compareEndMonth}
                  setStartMonth={setCompareStartMonth}
                  setEndMonth={setCompareEndMonth}
                  startWeekRange={compareStartWeekRange}
                  endWeekRange={compareEndWeekRange}
                  setStartWeekRange={setCompareStartWeekRange}
                  setEndWeekRange={setCompareEndWeekRange}
                  startDate={compareStartDate}
                  endDate={compareEndDate}
                  setStartDate={setCompareStartDate}
                  setEndDate={setCompareEndDate}
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
    </>
  );
}

export default App;
