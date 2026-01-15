import { useMemo } from 'react';

interface SparklineChartProps {
  data: number[];
  positive: boolean;
}

export const SparklineChart = ({ data, positive }: SparklineChartProps) => {
  const path = useMemo(() => {
    if (!data || data.length === 0) return '';
    
    const width = 100;
    const height = 32;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    });
    
    return `M${points.join(' L')}`;
  }, [data]);

  const strokeColor = positive ? '#10b981' : '#ef4444';

  return (
    <svg viewBox="0 0 100 32" className="h-8 w-full">
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
