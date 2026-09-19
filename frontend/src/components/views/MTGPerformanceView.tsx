import React, { useState, useRef } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import type { MTGTrade, MTGSettings } from '../../types/journal';

interface MTGPerformanceViewProps {
  mtgTrades: MTGTrade[];
  mtgSettings: MTGSettings;
}

type TimeframeFilter = 'all' | 'today' | '7days' | 'month' | '3months' | 'year';

interface EquityPoint {
  id: string;
  label: string;
  date: string;
  time: string;
  balance: number;
  profit: number;
  result: 'WIN' | 'LOSS' | 'START';
  tradeAmount: number;
}

export const MTGPerformanceView: React.FC<MTGPerformanceViewProps> = ({
  mtgTrades,
  mtgSettings,
}) => {
  const [timeframe, setTimeframe] = useState<TimeframeFilter>('all');
  const [hoveredPoint, setHoveredPoint] = useState<EquityPoint | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const currencySymbol = mtgSettings.currencySymbol || '$';

  // Filter trades based on selected timeframe
  const filteredTrades = [...mtgTrades].filter((t) => {
    if (timeframe === 'all') return true;
    const now = new Date();
    const tradeDate = new Date(t.date);

    if (timeframe === 'today') {
      const todayStr = now.toISOString().split('T')[0];
      return t.date === todayStr;
    }
    if (timeframe === '7days') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return tradeDate >= sevenDaysAgo;
    }
    if (timeframe === 'month') {
      return (
        tradeDate.getMonth() === now.getMonth() &&
        tradeDate.getFullYear() === now.getFullYear()
      );
    }
    if (timeframe === '3months') {
      const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      return tradeDate >= threeMonthsAgo;
    }
    if (timeframe === 'year') {
      return tradeDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const totalTrades = filteredTrades.length;
  const wins = filteredTrades.filter((t) => t.result === 'WIN').length;
  const losses = filteredTrades.filter((t) => t.result === 'LOSS').length;
  const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 1000) / 10 : 0;
  const totalNetPL = filteredTrades.reduce((acc, t) => acc + t.profit, 0);

  // Compute Equity Points (Chronological)
  const chronologicalTrades = [...filteredTrades].sort(
    (a, b) => a.timestamp - b.timestamp
  );

  let runningBalance = mtgSettings.startingBalance;
  const equityPoints: EquityPoint[] = [
    {
      id: 'start',
      label: 'Start Capital',
      date: 'Initial',
      time: '00:00',
      balance: mtgSettings.startingBalance,
      profit: 0,
      result: 'START',
      tradeAmount: 0,
    },
  ];

  chronologicalTrades.forEach((t) => {
    runningBalance += t.profit;
    equityPoints.push({
      id: t.id,
      label: `${t.date} ${t.time}`,
      date: t.date,
      time: t.time,
      balance: Math.round(runningBalance * 100) / 100,
      profit: t.profit,
      result: t.result,
      tradeAmount: t.tradeAmount,
    });
  });

  // Graph Bounds
  const balances = equityPoints.map((p) => p.balance);
  const rawMin = Math.min(...balances, mtgSettings.startingBalance);
  const rawMax = Math.max(...balances, mtgSettings.startingBalance);

  const minBalance = Math.floor(rawMin * 0.98);
  const maxBalance = Math.ceil(rawMax * 1.02);
  const midBalance = Math.round(((minBalance + maxBalance) / 2) * 100) / 100;
  const range = maxBalance - minBalance || 1;

  const svgWidth = 800;
  const svgHeight = 220;

  const coordinates = equityPoints.map((p, idx) => {
    const x = (idx / (equityPoints.length - 1 || 1)) * svgWidth;
    const y = svgHeight - ((p.balance - minBalance) / range) * svgHeight;
    return { x, y, point: p };
  });

  const pointsString = coordinates.map((c) => `${c.x},${c.y}`).join(' ');

  // Smooth mouse move handler over line graph (no flickering dots)
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!svgRef.current || coordinates.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseXRatio = Math.max(0, Math.min(1, mouseX / rect.width));
    const targetSvgX = mouseXRatio * svgWidth;

    // Find nearest coordinate along the curve
    let closestIndex = 0;
    let minDistance = Infinity;

    coordinates.forEach((c, idx) => {
      const dist = Math.abs(c.x - targetSvgX);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = idx;
      }
    });

    const targetCoord = coordinates[closestIndex];
    setHoveredPoint(targetCoord.point);
    setHoverPos({ x: targetCoord.x, y: targetCoord.y });
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
    setHoverPos(null);
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto font-sans">
      {/* Header & Filter Controls */}
      <div className="desk-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#f0f1f4] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            MTG Analytics & Equity Progression
          </h2>
          <p className="text-xs text-[#8a8f9d] mt-0.5">
            Performance breakdown and capital growth curve
          </p>
        </div>

        {/* Timeframe Filter Buttons */}
        <div className="flex items-center gap-1 bg-[#13161C] p-1 rounded-lg border border-[#2A2F3A] flex-wrap">
          {(
            [
              { id: 'all', label: 'All Time' },
              { id: 'today', label: 'Today' },
              { id: '7days', label: 'Last 7 Days' },
              { id: 'month', label: 'This Month' },
              { id: '3months', label: 'Last 3 Months' },
              { id: 'year', label: 'Last Year' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setTimeframe(item.id)}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                timeframe === item.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-[#8a8f9d] hover:text-[#f0f1f4] hover:bg-[#181B22]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="desk-card p-4 space-y-1">
          <span className="text-xs text-[#8a8f9d]">Filtered Trades</span>
          <div className="text-xl font-bold font-mono text-[#f0f1f4]">{totalTrades}</div>
          <span className="text-[10px] text-[#8a8f9d]">{wins} Wins / {losses} Losses</span>
        </div>

        <div className="desk-card p-4 space-y-1">
          <span className="text-xs text-[#8a8f9d]">Win Rate</span>
          <div className="text-xl font-bold font-mono text-[#f0f1f4]">{winRate}%</div>
          <div className="w-full bg-[#13161C] h-1.5 rounded-full overflow-hidden mt-1 border border-[#252930]">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${winRate}%` }} />
          </div>
        </div>

        <div className="desk-card p-4 space-y-1">
          <span className="text-xs text-[#8a8f9d]">Net P/L</span>
          <div className={`text-xl font-bold font-mono ${totalNetPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalNetPL >= 0 ? '+' : ''}{currencySymbol}{totalNetPL.toFixed(2)}
          </div>
          <span className="text-[10px] text-[#8a8f9d]">Filtered timeframe total</span>
        </div>

        <div className="desk-card p-4 space-y-1">
          <span className="text-xs text-[#8a8f9d]">Current Balance</span>
          <div className="text-xl font-bold font-mono text-blue-400">
            {currencySymbol}{(mtgSettings.startingBalance + totalNetPL).toFixed(2)}
          </div>
          <span className="text-[10px] text-[#8a8f9d]">Start: {currencySymbol}{mtgSettings.startingBalance.toFixed(2)}</span>
        </div>
      </div>

      {/* Interactive Clean Equity Curve Line Graph (No static green/red dots) */}
      <div className="desk-card p-5 sm:p-6 space-y-4 shadow-lg relative">
        <div className="flex items-center justify-between border-b border-[#252930] pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#f0f1f4] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            EQUITY CURVE PROGRESSION
          </h3>

          <div className="flex items-center gap-3 text-xs font-mono">
            {hoveredPoint ? (
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#13161C] border border-[#2A2F3A] text-[#f0f1f4] shadow-md animate-fade-in">
                <span>{hoveredPoint.label}:</span>
                <strong className={hoveredPoint.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {hoveredPoint.result === 'START' ? 'Initial Balance' : `${hoveredPoint.profit >= 0 ? '+' : ''}${currencySymbol}${hoveredPoint.profit.toFixed(2)}`}
                </strong>
                <span className="text-[#f0f1f4] font-bold">({currencySymbol}{hoveredPoint.balance.toFixed(2)})</span>
              </div>
            ) : (
              <span className="text-[#8a8f9d]">{equityPoints.length} data points</span>
            )}
          </div>
        </div>

        {equityPoints.length <= 1 ? (
          <div className="py-16 text-center text-[#8a8f9d] text-xs font-mono">
            Log MTG trades to generate your dynamic equity growth curve!
          </div>
        ) : (
          <div className="flex items-stretch gap-3 pt-2">
            {/* Y-Axis Balance Labels */}
            <div className="flex flex-col justify-between text-[11px] font-mono text-[#8a8f9d] py-1 text-right select-none min-w-[65px] shrink-0">
              <div>{currencySymbol}{maxBalance.toFixed(2)}</div>
              <div>{currencySymbol}{midBalance.toFixed(2)}</div>
              <div>{currencySymbol}{minBalance.toFixed(2)}</div>
            </div>

            {/* Clean SVG Line Chart */}
            <div className="relative flex-1 h-60 pt-2">
              <svg
                ref={svgRef}
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-full overflow-visible cursor-crosshair"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                {/* Gridlines */}
                <line x1="0" y1="0" x2={svgWidth} y2="0" stroke="#252930" strokeDasharray="3 3" className="pointer-events-none" />
                <line x1="0" y1={svgHeight / 2} x2={svgWidth} y2={svgHeight / 2} stroke="#252930" strokeDasharray="3 3" className="pointer-events-none" />
                <line x1="0" y1={svgHeight} x2={svgWidth} y2={svgHeight} stroke="#252930" strokeDasharray="3 3" className="pointer-events-none" />

                {/* Smooth Gradient Fill */}
                <defs className="pointer-events-none">
                  <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <polygon
                  points={`0,${svgHeight} ${pointsString} ${svgWidth},${svgHeight}`}
                  fill="url(#equityGradient)"
                  className="pointer-events-none"
                />

                {/* Clean Solid Line (NO static green/red dots) */}
                <polyline
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={pointsString}
                  className="pointer-events-none"
                />

                {/* Single Vertical Hover Line & Highlight Circle when hovering over curve */}
                {hoverPos && (
                  <g className="pointer-events-none">
                    <line
                      x1={hoverPos.x}
                      y1="0"
                      x2={hoverPos.x}
                      y2={svgHeight}
                      stroke="#3b82f6"
                      strokeDasharray="3 3"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx={hoverPos.x}
                      cy={hoverPos.y}
                      r="6"
                      fill="#3b82f6"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  </g>
                )}
              </svg>

              {/* X-Axis Timeline Labels */}
              <div className="flex justify-between text-[10px] font-mono text-[#8a8f9d] pt-2 border-t border-[#252930]">
                <span>{equityPoints[0].label}</span>
                {equityPoints.length > 2 && (
                  <span>{equityPoints[Math.floor(equityPoints.length / 2)].label}</span>
                )}
                <span>{equityPoints[equityPoints.length - 1].label}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
