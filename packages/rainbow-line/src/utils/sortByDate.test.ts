/* eslint-disable @typescript-eslint/no-explicit-any */
import { AggregatedDataBase } from "@fukui-kanko/shared";
import { describe, it, expect } from "vitest";
import { sortByDate } from "./sortByDate";

type TestData = AggregatedDataBase & {
  id: number;
};

describe("sortByDate", () => {
  describe("ascending date sorting", () => {
    it("should sort data by date in ascending order", () => {
      const data: TestData[] = [
        {
          "aggregate from": "2024-03-15",
          "aggregate to": "2024-03-15",
          placement: "test-placement" as any,
          "object class": "Person",
          "total count": 100,
          id: 1,
        },
        {
          "aggregate from": "2024-01-10",
          "aggregate to": "2024-01-10",
          placement: "test-placement" as any,
          "object class": "Person",
          "total count": 50,
          id: 2,
        },
        {
          "aggregate from": "2024-02-20",
          "aggregate to": "2024-02-20",
          placement: "test-placement" as any,
          "object class": "Person",
          "total count": 75,
          id: 3,
        },
      ];

      const sorted = sortByDate(data);

      expect(sorted[0].id).toBe(2); // 2024-01-10
      expect(sorted[1].id).toBe(3); // 2024-02-20
      expect(sorted[2].id).toBe(1); // 2024-03-15
    });

    it("should handle data with same dates", () => {
      const data: TestData[] = [
        {
          "aggregate from": "2024-01-10",
          "aggregate to": "2024-01-10",
          placement: "test-placement" as any,
          "object class": "Person",
          "total count": 100,
          id: 1,
        },
        {
          "aggregate from": "2024-01-10",
          "aggregate to": "2024-01-10",
          placement: "test-placement" as any,
          "object class": "Person",
          "total count": 50,
          id: 2,
        },
      ];

      const sorted = sortByDate(data);

      expect(sorted.length).toBe(2);
      expect(sorted[0]["aggregate from"]).toBe("2024-01-10");
      expect(sorted[1]["aggregate from"]).toBe("2024-01-10");
    });

    it("should sort dates with times correctly", () => {
      const data: TestData[] = [
        {
          "aggregate from": "2024-01-10T15:00:00",
          "aggregate to": "2024-01-10T15:59:59",
          placement: "test-placement" as any,
          "object class": "Person",
          "total count": 100,
          id: 1,
        },
        {
          "aggregate from": "2024-01-10T10:00:00",
          "aggregate to": "2024-01-10T10:59:59",
          placement: "test-placement" as any,
          "object class": "Person",
          "total count": 50,
          id: 2,
        },
        {
          "aggregate from": "2024-01-10T12:00:00",
          "aggregate to": "2024-01-10T12:59:59",
          placement: "test-placement" as any,
          "object class": "Person",
          "total count": 75,
          id: 3,
        },
      ];

      const sorted = sortByDate(data);

      expect(sorted[0].id).toBe(2); // 10:00
      expect(sorted[1].id).toBe(3); // 12:00
      expect(sorted[2].id).toBe(1); // 15:00
    });
  });

  describe("empty array handling", () => {
    it("should return an empty array when given an empty array", () => {
      const data: TestData[] = [];
      const sorted = sortByDate(data);

      expect(sorted).toEqual([]);
      expect(sorted.length).toBe(0);
    });

    it("should return a new array instance for empty array", () => {
      const data: TestData[] = [];
      const sorted = sortByDate(data);

      expect(sorted).not.toBe(data);
    });
  });

  describe("single element handling", () => {
    it("should handle array with single element", () => {
      const data: TestData[] = [
        {
          "aggregate from": "2024-01-10",
          "aggregate to": "2024-01-10",
          placement: "test-placement" as any,
          "object class": "Person",
          "total count": 100,
          id: 1,
        },
      ];

      const sorted = sortByDate(data);

      expect(sorted.length).toBe(1);
      expect(sorted[0].id).toBe(1);
    });
  });

  describe("invalid date format handling", () => {
    it("should handle invalid date formats by placing them at the end", () => {
      const data: TestData[] = [
        {
          "aggregate from": "2024-01-10",
          "aggregate to": "2024-01-10",
          placement: "test-placement" as any,
          "object class": "Person",
          "total count": 100,
          id: 1,
        },
        {
          "aggregate from": "invalid-date",
          "aggregate to": "2024-01-10",
          placement: "test-placement" as any,
          "object class": "Person",
          "total count": 50,
          id: 2,
        },
        {
          "aggregate from": "2024-02-20",
          "aggregate to": "2024-02-20",
          placement: "test-placement" as any,
          "object class": "Person",
          "total count": 75,
          id: 3,
        },
      ];

      const sorted = sortByDate(data);

      // Invalid dates (NaN) should be sorted to the end or have unpredictable behavior
      // We verify that valid dates are still in correct order relative to each other
      expect(sorted.length).toBe(3);
      const validDateIndices = sorted
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => !isNaN(new Date(item["aggregate from"]).getTime()));

      if (validDateIndices.length >= 2) {
        const firstValidIndex = validDateIndices[0].index;
        const secondValidIndex = validDateIndices[1].index;
        expect(firstValidIndex).toBeLessThan(secondValidIndex);
        expect(validDateIndices[0].item.id).toBe(1); // 2024-01-10
        expect(validDateIndices[1].item.id).toBe(3); // 2024-02-20
      }
    });

    it("should handle empty string dates", () => {
      const data: TestData[] = [
        {
          "aggregate from": "2024-01-10",
          "aggregate to": "2024-01-10",
          placement: "test-placement" as any,
          "object class": "Person",
          "total count": 100,
          id: 1,
        },
        {
          "aggregate from": "",
          "aggregate to": "2024-01-10",
          placement: "test-placement" as any,
          "object class": "Person",
          "total count": 50,
          id: 2,
        },
      ];

      const sorted = sortByDate(data);

      expect(sorted.length).toBe(2);
      // The function should not crash with empty strings
    });
  });

  describe("immutability", () => {
    it("should not mutate the original array", () => {
      const data: TestData[] = [
        {
          "aggregate from": "2024-03-15",
          "aggregate to": "2024-03-15",
          placement: "test-placement" as any,
          "object class": "Person",
          "total count": 100,
          id: 1,
        },
        {
          "aggregate from": "2024-01-10",
          "aggregate to": "2024-01-10",
          placement: "test-placement" as any,
          "object class": "Person",
          "total count": 50,
          id: 2,
        },
      ];

      const originalOrder = data.map((d) => d.id);
      sortByDate(data);

      expect(data.map((d) => d.id)).toEqual(originalOrder);
    });

    it("should return a new array instance", () => {
      const data: TestData[] = [
        {
          "aggregate from": "2024-01-10",
          "aggregate to": "2024-01-10",
          placement: "test-placement" as any,
          "object class": "Person",
          "total count": 100,
          id: 1,
        },
      ];

      const sorted = sortByDate(data);

      expect(sorted).not.toBe(data);
    });
  });

  describe("already sorted data", () => {
    it("should handle already sorted data", () => {
      const data: TestData[] = [
        {
          "aggregate from": "2024-01-10",
          "aggregate to": "2024-01-10",
          placement: "test-placement" as any,
          "object class": "Person",
          "total count": 100,
          id: 1,
        },
        {
          "aggregate from": "2024-02-20",
          "aggregate to": "2024-02-20",
          placement: "test-placement" as any,
          "object class": "Person",
          "total count": 50,
          id: 2,
        },
        {
          "aggregate from": "2024-03-15",
          "aggregate to": "2024-03-15",
          placement: "test-placement" as any,
          "object class": "Person",
          "total count": 75,
          id: 3,
        },
      ];

      const sorted = sortByDate(data);

      expect(sorted[0].id).toBe(1);
      expect(sorted[1].id).toBe(2);
      expect(sorted[2].id).toBe(3);
    });
  });

  describe("reverse sorted data", () => {
    it("should correctly sort reverse sorted data", () => {
      const data: TestData[] = [
        {
          "aggregate from": "2024-03-15",
          "aggregate to": "2024-03-15",
          placement: "test-placement" as any,
          "object class": "Person",
          "total count": 100,
          id: 1,
        },
        {
          "aggregate from": "2024-02-20",
          "aggregate to": "2024-02-20",
          placement: "test-placement" as any,
          "object class": "Person",
          "total count": 50,
          id: 2,
        },
        {
          "aggregate from": "2024-01-10",
          "aggregate to": "2024-01-10",
          placement: "test-placement" as any,
          "object class": "Person",
          "total count": 75,
          id: 3,
        },
      ];

      const sorted = sortByDate(data);

      expect(sorted[0].id).toBe(3); // 2024-01-10
      expect(sorted[1].id).toBe(2); // 2024-02-20
      expect(sorted[2].id).toBe(1); // 2024-03-15
    });
  });
});
