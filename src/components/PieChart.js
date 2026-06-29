'use client';

import React from 'react';

/**
 * Pie chart simples em SVG (sem dependências externas).
 * @param {{ data: Array<{label: string, value: number, color: string}>, size?: number, unit?: string }} props
 */
export default function PieChart({ data, size = 220, unit = '' }) {
  const items = (data || []).filter(d => d.value > 0);
  const total = items.reduce((s, d) => s + d.value, 0);

  if (total === 0) {
    return (
      <div
        className="flex items-center justify-center text-sm text-stone-400 dark:text-[#8a7058]"
        style={{ height: size }}
      >
        Sem dados para exibir.
      </div>
    );
  }

  const radius = size / 2;
  const cx = radius;
  const cy = radius;

  // Converte um ângulo (graus, 0 = topo) em coordenadas na borda do círculo.
  const polar = (angle) => {
    const a = (angle - 90) * (Math.PI / 180);
    return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) };
  };

  // Soma acumulada antes de cada fatia (imutável — sem reatribuição no render).
  const offsets = items.map((_, i) =>
    items.slice(0, i).reduce((sum, x) => sum + x.value, 0)
  );

  const slices = items.map((d, i) => {
    const startAngle = (offsets[i] / total) * 360;
    const endAngle = ((offsets[i] + d.value) / total) * 360;
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    const start = polar(startAngle);
    const end = polar(endAngle);
    const path = `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
    return { ...d, path, pct: (d.value / total) * 100 };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="flex-shrink-0"
      >
        {items.length === 1 ? (
          <circle cx={cx} cy={cy} r={radius} fill={slices[0].color}>
            <title>{`${slices[0].label}: ${slices[0].value}${unit} (100%)`}</title>
          </circle>
        ) : (
          slices.map((s, i) => (
            <path
              key={i}
              d={s.path}
              fill={s.color}
              stroke="white"
              strokeWidth="2"
              className="dark:[stroke:#211307]"
            >
              <title>{`${s.label}: ${s.value}${unit} (${s.pct.toFixed(1)}%)`}</title>
            </path>
          ))
        )}
      </svg>

      <div className="flex flex-col gap-2 w-full sm:w-auto sm:min-w-[200px] max-w-sm">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: s.color }}
              />
              <span className="truncate text-stone-700 dark:text-[#c4b09a]">{s.label}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="font-bold text-ink dark:text-parchment">
                {s.value}{unit}
              </span>
              <span className="text-xs text-stone-400 dark:text-[#8a7058] w-12 text-right">
                {s.pct.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
