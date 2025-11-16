import React, { useState } from "react";
import Slider from '@mui/material/Slider';

export interface DateRangeSelectorProps {
  onChange: (start: string, end: string) => void;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ onChange }) => {
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
      <div style={{ width: '80vw', maxWidth: 1200, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
    </div>
  );
};
