import React, { useState } from "react";
import Slider from '@mui/material/Slider';

export interface DateRangeSelectorProps {
  onChange: (start: string, end: string) => void;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ onChange }) => {
    // 移动选区整体一年
    function moveRange(offset: number) {
      let [start, end] = range;
      const newStart = Math.max(0, Math.min(start + offset, totalMonths - 1));
      const newEnd = Math.max(0, Math.min(end + offset, totalMonths - 1));
      // 保证区间长度不变，且不越界
      if (newEnd - newStart !== end - start) return;
      setRange([newStart, newEnd]);
      triggerChange(newStart, newEnd);
    }
  const minYear = 2014;
  const maxYear = 2025;
  const totalMonths = (maxYear - minYear + 1) * 12;
  const [range, setRange] = useState<[number, number]>([0, totalMonths - 1]);

  function pad(n: number) {
    return n < 10 ? `0${n}` : `${n}`;
  }

  function monthIndexToString(idx: number) {
    const year = minYear + Math.floor(idx / 12);
    const month = (idx % 12) + 1;
    return `${year}-${pad(month)}`;
  }

  function handleSliderChange(_: any, newValue: number | number[]) {
    if (Array.isArray(newValue)) {
      setRange([newValue[0], newValue[1]]);
    }
  }

  function handleSliderCommit(_: any, newValue: number | number[]) {
    if (Array.isArray(newValue)) {
      triggerChange(newValue[0], newValue[1]);
    }
  }

  function triggerChange(startIdx: number, endIdx: number) {
    const startStr = monthIndexToString(startIdx);
    const endStr = monthIndexToString(endIdx);
    // Auto-complete day to first and last day of month
    const startDate = `${startStr}-01`;
    const [endYear, endMonthNum] = endStr.split("-").map(Number);
    const lastDay = new Date(endYear, endMonthNum, 0).getDate();
    const endDate = `${endStr}-${pad(lastDay)}`;
    onChange(startDate, endDate);
  }

  return (
    <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, padding: '32px 0 24px 0', background: 'transparent', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '80vw', maxWidth: 1200, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, height: 40 }}>
        <button
          style={{ width: 32, height: 40, background: 'none', border: 'none', padding: 0, cursor: range[0] === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginTop: '-24px' }}
          onClick={() => moveRange(-12)}
          disabled={range[0] === 0}
        >
          <svg width="18" height="40" viewBox="0 0 18 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
            <polygon points="12,10 6,20 12,30" fill={range[0] === 0 ? '#ffe0b2' : '#d97706'} />
          </svg>
        </button>
        <div style={{ flex: 1 }}>
          <Slider
            value={range}
            min={0}
            max={totalMonths - 1}
            onChange={handleSliderChange}
            onChangeCommitted={handleSliderCommit}
            valueLabelDisplay="off"
            sx={{
              width: '100%',
              height: 6,
              background: 'transparent',
              color: '#d97706',
              '& .MuiSlider-markLabel': { fontWeight: 700, fontSize: 18, color: '#d97706' },
              '& .MuiSlider-thumb': { backgroundColor: '#d97706' },
              '& .MuiSlider-track': { backgroundColor: '#d97706' },
              '& .MuiSlider-rail': { backgroundColor: '#ffe0b2' },
            }}
            marks={Array.from({length: 13}, (_, i) => ({
              value: i * 12,
              label: `${minYear + i}-01`
            }))}
          />
        </div>
        <button
          style={{ width: 32, height: 40, background: 'none', border: 'none', padding: 0, cursor: range[1] === totalMonths - 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginTop: '-24px' }}
          onClick={() => moveRange(12)}
          disabled={range[1] === totalMonths - 1}
        >
          <svg width="18" height="40" viewBox="0 0 18 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
            <polygon points="6,10 12,20 6,30" fill={range[1] === totalMonths - 1 ? '#ffe0b2' : '#d97706'} />
          </svg>
        </button>
      </div>
    </div>
  );
};
