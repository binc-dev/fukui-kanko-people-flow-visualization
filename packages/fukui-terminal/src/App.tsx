import { MonthRangePicker } from "@/components/parts/month-range-picker";
import { RangeSelector } from "@/components/parts/range-selector";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

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
  };

  const emojiStyle = {
    fontSize: "6rem",
    marginBottom: "2rem",
  };

  const titleStyle = {
    fontSize: "2.5rem",
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: "1rem",
  };

  const messageStyle = {
    fontSize: "1.25rem",
    color: "#4b5563",
    marginBottom: "2rem",
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

  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [startMonth, setStartMonth] = useState<Date | undefined>(undefined);
  const [endMonth, setEndMonth] = useState<Date | undefined>(undefined);
  const [startWeekRange, setStartWeekRange] = useState<{ from: Date; to: Date } | undefined>(
    undefined,
  );
  const [endWeekRange, setEndWeekRange] = useState<{ from: Date; to: Date } | undefined>(undefined);
  const [theme, setTheme] = useState<"month" | "week" | "day" | "hour">("month");

  const [compare, setCompare] = useState(false);

  const [startMonth2, setStartMonth2] = useState<Date | undefined>(undefined);
  const [endMonth2, setEndMonth2] = useState<Date | undefined>(undefined);
  const [startWeekRange2, setStartWeekRange2] = useState<{ from: Date; to: Date } | undefined>(
    undefined,
  );
  const [endWeekRange2, setEndWeekRange2] = useState<{ from: Date; to: Date } | undefined>(
    undefined,
  );
  const [startDate2, setStartDate2] = useState<Date | undefined>(undefined);
  const [endDate2, setEndDate2] = useState<Date | undefined>(undefined);

  return (
    <>
      <div style={containerStyle}>
        <div style={contentStyle}>
          <div style={emojiStyle}>🚧</div>
          <h1 style={titleStyle}>福井駅周辺データ可視化</h1>
          <p style={messageStyle}>現在開発中です</p>
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
              setStartMonth2(undefined);
              setEndMonth2(undefined);
              setStartDate2(undefined);
              setEndDate2(undefined);
              setStartWeekRange2(undefined);
              setEndWeekRange2(undefined);
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
          <div className="flex items-center gap-3">
            <Checkbox
              id="terms"
              checked={compare}
              onCheckedChange={(checked) => setCompare(checked === true)}
            />
            <Label htmlFor="terms">２期間比較</Label>
          </div>
          {theme === "month" && (
            <>
              <MonthRangePicker
                startMonth={startMonth}
                endMonth={endMonth}
                onChange={(start, end) => {
                  setStartMonth(start);
                  setEndMonth(end);
                }}
              />
              {compare && (
                <MonthRangePicker
                  startMonth={startMonth2}
                  endMonth={endMonth2}
                  onChange={(start, end) => {
                    setStartMonth2(start);
                    setEndMonth2(end);
                  }}
                />
              )}
            </>
          )}

          {theme === "week" && (
            <>
              <RangeSelector
                type="week"
                start={startWeekRange}
                end={endWeekRange}
                setStart={setStartWeekRange}
                setEnd={setEndWeekRange}
              />
              {compare && (
                <RangeSelector
                  type="week"
                  start={startWeekRange2}
                  end={endWeekRange2}
                  setStart={setStartWeekRange2}
                  setEnd={setEndWeekRange2}
                />
              )}
            </>
          )}

          {(theme === "day" || theme === "hour") && (
            <>
              <RangeSelector
                type="date"
                start={startDate}
                end={endDate}
                setStart={setStartDate}
                setEnd={setEndDate}
              />
              {compare && (
                <RangeSelector
                  type="date"
                  start={startDate2}
                  end={endDate2}
                  setStart={setStartDate2}
                  setEnd={setEndDate2}
                />
              )}
            </>
          )}
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
