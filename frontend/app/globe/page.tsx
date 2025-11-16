"use client";

import Earth from "../../components/Earth";
import { DateRangeSelector } from "../../components/DateRangeSelector";
import { useState } from "react";

export default function GlobeWebGPUPage() {
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "2014-01-01",
    end: "2025-12-31",
  });

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <DateRangeSelector
        onChange={(start, end) => setDateRange({ start, end })}
      />
      <Earth startDate={dateRange.start} endDate={dateRange.end} />
    </div>
  );
}
