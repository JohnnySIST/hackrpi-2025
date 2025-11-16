"use client";

import Earth from "../../components/Earth";
import { DateRangeSelector } from "../../components/DateRangeSelector";
import { useState } from "react";

export default function GlobeWebGPUPage() {
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "2014-01-01",
    end: "2025-12-31",
  });
  const [mode, setMode] = useState<'day' | 'night'>('day');

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <div style={{ position: 'absolute', top: 144, right: 32, zIndex: 100 }}>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            fontWeight: 600,
            fontSize: 18,
            background: 'rgba(255,255,255,0.3)',
            borderRadius: 16,
            padding: '8px 20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            color: '#ff9800',
            border: '2px solid #ff9800',
            backdropFilter: 'blur(4px)',
          }}
        >
          <span style={{ marginRight: 12 }}>Night Mode</span>
          <span
            style={{
              display: 'inline-block',
              width: 44,
              height: 24,
              borderRadius: 12,
              background: mode === 'night' ? '#ff9800' : 'rgba(255,255,255,0.5)',
              position: 'relative',
              cursor: 'pointer',
              transition: 'background 0.2s',
              border: '1.5px solid #ff9800',
            }}
            onClick={() => setMode(mode === 'night' ? 'day' : 'night')}
          >
            <span
              style={{
                position: 'absolute',
                top: 2,
                left: mode === 'night' ? 24 : 2,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#fff',
                boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                transition: 'left 0.2s',
                border: '1.5px solid #ff9800',
              }}
            />
          </span>
        </label>
      </div>
      <DateRangeSelector
        onChange={(start, end) => setDateRange({ start, end })}
      />
      <Earth startDate={dateRange.start} endDate={dateRange.end} mode={mode} />
    </div>
  );
}
