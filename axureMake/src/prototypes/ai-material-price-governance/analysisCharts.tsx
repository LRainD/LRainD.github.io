/**
 * 价格分析页的图表。全部手写 SVG / DOM —— 不引图表库。
 *
 * 原因：本原型走「单入口 iife」导出（见 MEMORY），任何动态 import 都会让导出失败，
 * 而图表库动辄几百 KB 又只在这里用；这四张图形态固定（柱+线双轴、条形排行），
 * 手写反而更可控，也能跟页面配色完全一致。
 */
import React, { useEffect, useId, useRef, useState } from 'react';

/** 容器实测宽度：SVG 按真实像素画，文字不会被 viewBox 拉伸变形 */
const useWidth = (fallback = 760) => {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(entries => {
      entries.forEach(entry => {
        const next = Math.round(entry.contentRect.width);
        if (next > 0) setWidth(next);
      });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, width };
};

/** 把轴上界取整到好看的刻度（1 / 2 / 2.5 / 5 / 10 倍数） */
const niceStep = (rough: number) => {
  if (!Number.isFinite(rough) || rough <= 0) return 1;
  const exponent = Math.floor(Math.log10(rough));
  const base = Math.pow(10, exponent);
  const value = rough / base;
  const nice = value <= 1 ? 1 : value <= 2 ? 2 : value <= 2.5 ? 2.5 : value <= 5 ? 5 : 10;
  return nice * base;
};

const zeroScale = (max: number, ticks = 4) => {
  const step = niceStep((max || 1) / ticks);
  return { min: 0, max: step * ticks, step };
};

const rangeScale = (min: number, max: number, ticks = 4) => {
  const span = max - min || Math.abs(max) * 0.1 || 1;
  const low = min - span * 0.3;
  const high = max + span * 0.3;
  const step = niceStep((high - low) / ticks);
  return { min: Math.floor(low / step) * step, max: Math.ceil(high / step) * step, step };
};

const formatNumber = (value: number) => {
  if (Math.abs(value) >= 10000) return `${Math.round(value).toLocaleString('zh-CN')}`;
  if (Math.abs(value) >= 100) return `${Math.round(value)}`;
  return `${Number(value.toFixed(1))}`;
};

/** 平滑曲线：Catmull-Rom 转三次贝塞尔，和截图的曲线观感一致 */
const smoothPath = (points: Array<[number, number]>) => {
  if (points.length < 2) return '';
  let path = `M ${points[0][0]} ${points[0][1]}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[index - 1] ?? points[index];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[index + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    path += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`;
  }
  return path;
};

export type ComboPoint = { label: string; bar: number; line: number; hint?: string };

export const ComboChart: React.FC<{
  data: ComboPoint[];
  barName: string;
  lineName: string;
  barUnit: string;
  lineUnit: string;
  barColor?: string;
  lineColor?: string;
  height?: number;
  /** 折线的纵轴是否从 0 起：价格曲线从 0 起会压成一条直线，故默认按区间取 */
  lineFromZero?: boolean;
  linePrecision?: number;
  emptyHint?: string;
}> = ({
  data,
  barName,
  lineName,
  barUnit,
  lineUnit,
  barColor = '#1f74b8',
  lineColor = '#f0a13a',
  height = 268,
  lineFromZero = false,
  linePrecision = 0,
  emptyHint = '当前筛选下没有合同数据'
}) => {
  const { ref, width } = useWidth();
  const gradientId = useId().replace(/:/g, '');
  const padding = { top: 34, right: 56, bottom: 42, left: 60 };
  const plotWidth = Math.max(80, width - padding.left - padding.right);
  const plotHeight = Math.max(80, height - padding.top - padding.bottom);

  const barScale = zeroScale(Math.max(...data.map(item => item.bar), 0));
  const lineValues = data.map(item => item.line).filter(value => value > 0);
  const lineScale = lineFromZero || !lineValues.length
    ? zeroScale(Math.max(...lineValues, 1))
    : rangeScale(Math.min(...lineValues), Math.max(...lineValues));

  const band = plotWidth / Math.max(1, data.length);
  // 柱少的时候给足宽度，否则 5 根柱在宽屏上会细成一条线
  const barWidth = Math.max(6, Math.min(46, band * 0.52));

  const xOf = (index: number) => padding.left + band * index + band / 2;
  const barY = (value: number) => padding.top + plotHeight - (value / barScale.max) * plotHeight;
  const lineY = (value: number) => {
    const span = lineScale.max - lineScale.min || 1;
    return padding.top + plotHeight - ((value - lineScale.min) / span) * plotHeight;
  };

  /**
   * 折线按「有值」分段。
   * 筛选后某些月份可能一份合同都没有（成交均价为 0），若把这些点也连进去，
   * 曲线会一头扎到底再弹回来，看起来像价格崩盘 —— 所以缺口处断开。
   */
  const segments: Array<Array<[number, number]>> = [];
  let segment: Array<[number, number]> = [];
  data.forEach((item, index) => {
    if (item.line > 0) {
      segment.push([xOf(index), lineY(item.line)]);
    } else if (segment.length) {
      segments.push(segment);
      segment = [];
    }
  });
  if (segment.length) segments.push(segment);

  const solidLine = data.every(item => item.line > 0);
  const barTicks = Array.from({ length: 5 }, (_, index) => (barScale.max / 4) * index);
  const lineTickCount = 4;
  const lineTicks = Array.from(
    { length: lineTickCount + 1 },
    (_, index) => lineScale.min + ((lineScale.max - lineScale.min) / lineTickCount) * index
  );

  // x 轴标签过长或过密时抽稀，避免叠字
  const longLabels = data.some(item => item.label.length > 5);
  const stride = Math.ceil(data.length / (longLabels ? 8 : 13));

  if (!data.length) return <div className="pa-chart-empty">{emptyHint}</div>;

  return (
    <div className="pa-chart" ref={ref}>
      <div className="pa-chart-legend">
        <span className="pa-legend-item"><i style={{ background: barColor }} />{barName}（{barUnit}）</span>
        <span className="pa-legend-item"><i className="is-line" style={{ background: lineColor }} />{lineName}（{lineUnit}）</span>
      </div>
      <svg width={width} height={height} role="img" aria-label={`${barName}与${lineName}`}>
        <defs>
          <linearGradient id={`pa-bar-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={barColor} stopOpacity="0.98" />
            <stop offset="100%" stopColor={barColor} stopOpacity="0.62" />
          </linearGradient>
          <linearGradient id={`pa-area-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.16" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 横向网格 + 左右两侧刻度 */}
        {barTicks.map((tick, index) => {
          const y = padding.top + plotHeight - (tick / (barScale.max || 1)) * plotHeight;
          return (
            <g key={`grid-${index}`}>
              <line
                x1={padding.left}
                y1={y}
                x2={padding.left + plotWidth}
                y2={y}
                stroke={index === 0 ? '#dfe3e8' : '#eef1f4'}
                strokeWidth={1}
              />
              <text x={padding.left - 8} y={y + 3.5} textAnchor="end" className="pa-axis-text">
                {formatNumber(tick)}
              </text>
            </g>
          );
        })}

        {/* 右轴：折线单位 */}
        {lineTicks.map((tick, index) => {
          const y = padding.top + plotHeight - ((tick - lineScale.min) / (lineScale.max - lineScale.min || 1)) * plotHeight;
          return (
            <text key={`rt-${index}`} x={padding.left + plotWidth + 8} y={y + 3.5} className="pa-axis-text pa-axis-right">
              {Number(tick.toFixed(linePrecision))}
            </text>
          );
        })}

        {/* 柱 */}
        {data.map((item, index) => {
          const y = barY(item.bar);
          const barHeight = Math.max(0, padding.top + plotHeight - y);
          return (
            <g key={`bar-${index}`} className="pa-bar-group">
              <title>{`${item.label} · ${barName} ${item.bar.toLocaleString('zh-CN')} ${barUnit}`}</title>
              <rect
                x={xOf(index) - barWidth / 2}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={2}
                fill={`url(#pa-bar-${gradientId})`}
              />
            </g>
          );
        })}

        {/* 折线 + 面积（有缺口时只画线，避免面积被 0 值拉出假趋势） */}
        {segments.map((points, index) => (
          <g key={`line-${index}`}>
            {solidLine && points.length > 1 && index === 0 && (
              <path
                d={`${smoothPath(points)} L ${points[points.length - 1][0]} ${padding.top + plotHeight} L ${points[0][0]} ${padding.top + plotHeight} Z`}
                fill={`url(#pa-area-${gradientId})`}
              />
            )}
            {points.length > 1 && (
              <path d={smoothPath(points)} fill="none" stroke={lineColor} strokeWidth={2} strokeLinecap="round" />
            )}
          </g>
        ))}
        {data.map((item, index) =>
          item.line > 0 ? (
            <circle
              key={`dot-${index}`}
              cx={xOf(index)}
              cy={lineY(item.line)}
              r={3}
              fill="#fff"
              stroke={lineColor}
              strokeWidth={1.8}
            >
              <title>{`${item.label} · ${lineName} ${item.line} ${lineUnit}`}</title>
            </circle>
          ) : null
        )}

        {/* x 轴标签 */}
        {data.map((item, index) =>
          index % stride === 0 ? (
            <text
              key={`xl-${index}`}
              x={xOf(index)}
              y={padding.top + plotHeight + 18}
              textAnchor="middle"
              className="pa-axis-text"
              transform={
                longLabels
                  ? `rotate(-18 ${xOf(index)} ${padding.top + plotHeight + 18})`
                  : undefined
              }
            >
              {item.label}
            </text>
          ) : null
        )}
      </svg>
    </div>
  );
};

/** 横向排行条：区域分布用（不用地图，避免地理数据合规问题，信息量等价） */
export const BarRank: React.FC<{
  items: Array<{ label: string; amount: number; ratio: number; count: number }>;
  unit?: string;
  color?: string;
  emptyHint?: string;
}> = ({ items, unit = '万元', color = '#1f74b8', emptyHint = '当前筛选下没有合同数据' }) => {
  if (!items.length) return <div className="pa-chart-empty">{emptyHint}</div>;
  const max = Math.max(...items.map(item => item.ratio), 1);
  return (
    <div className="pa-rank">
      {items.map((item, index) => (
        <div className="pa-rank-row" key={item.label}>
          <span className="pa-rank-index">{index + 1}</span>
          <span className="pa-rank-label" title={item.label}>{item.label}</span>
          <span className="pa-rank-track">
            <i
              className={index === 0 ? 'is-top' : ''}
              style={{ width: `${Math.max(3, (item.ratio / max) * 100)}%`, background: index === 0 ? color : `${color}b8` }}
            />
          </span>
          <span className="pa-rank-value">{item.amount.toLocaleString('zh-CN')}</span>
          <span className="pa-rank-ratio">{item.ratio}%</span>
          <span className="pa-rank-count">{item.count} 份</span>
        </div>
      ))}
      <div className="pa-rank-foot">单位：{unit} · 按合同金额降序</div>
    </div>
  );
};
