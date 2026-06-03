import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatChartAxisValue, type ChartPoint } from "../../lib/chartData.js";

type EnvPerformanceAreaChartProps = {
  data: ChartPoint[];
  strokeColor: string;
  fillColorTop: string;
  unit: string;
};

type TooltipProps = {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  unit: string;
};

function PerformanceTooltip({ active, payload, unit }: TooltipProps) {
  if (!active || !payload?.length || payload[0].value == null) {
    return null;
  }

  const formatted = Number.isInteger(payload[0].value)
    ? payload[0].value.toLocaleString()
    : payload[0].value.toLocaleString(undefined, { maximumFractionDigits: 2 });

  return (
    <div className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-sm font-semibold text-[var(--primary-foreground)] shadow-lg">
      {formatted} {unit}
    </div>
  );
}

export function EnvPerformanceAreaChart({
  data,
  strokeColor,
  fillColorTop,
  unit,
}: EnvPerformanceAreaChartProps) {
  const gradientId = "env-performance-gradient";
  const maxValue = Math.max(...data.map((point) => point.value), 0);
  const yMax = maxValue > 0 ? Math.ceil(maxValue * 1.12) : 100;

  return (
    <div className="mt-6 h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 16, left: 4, bottom: 4 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={fillColorTop} stopOpacity={0.45} />
              <stop offset="95%" stopColor={fillColorTop} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            horizontal
            vertical={false}
            stroke="var(--chart-grid)"
            strokeWidth={1}
          />

          <XAxis
            dataKey="label"
            tick={{ fill: "var(--chart-axis)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={28}
          />

          <YAxis
            width={52}
            domain={[0, yMax]}
            tick={{ fill: "var(--chart-axis)", fontSize: 11 }}
            tickFormatter={formatChartAxisValue}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            content={<PerformanceTooltip unit={unit} />}
            cursor={{ stroke: "var(--chart-grid)", strokeWidth: 1 }}
          />

          <Area
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={{ r: 3, fill: strokeColor, strokeWidth: 0 }}
            activeDot={{
              r: 5,
              fill: strokeColor,
              stroke: "var(--surface)",
              strokeWidth: 2,
            }}
            isAnimationActive
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
