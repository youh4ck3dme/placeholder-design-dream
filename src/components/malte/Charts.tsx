export function DonutChart({
  incomeRatio = 0.62,
  size = 108,
}: {
  incomeRatio?: number;
  size?: number;
}) {
  const stroke = 16;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Pomer príjmov a výdavkov">
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--expense)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--income)"
          strokeWidth={stroke}
          strokeDasharray={`${c * incomeRatio} ${c}`}
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

export function BalanceChart({ data }: { data: number[] }) {
  const w = 320;
  const h = 120;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 12) - 6;
    return [x, y] as const;
  });
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${line} L${w} ${h} L0 ${h} Z`;
  const peak = pts[pts.length - 4]!;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-32 w-full"
      preserveAspectRatio="none"
      role="img"
      aria-label="Vývoj zostatku"
    >
      <defs>
        <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((g) => (
        <line
          key={g}
          x1="0"
          x2={w}
          y1={h * g}
          y2={h * g}
          stroke="var(--border)"
          strokeWidth="1"
          strokeDasharray="3 5"
        />
      ))}
      <path d={area} fill="url(#balanceFill)" />
      <path d={line} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx={peak[0]} cy={peak[1]} r="4" fill="var(--primary)" stroke="var(--card)" strokeWidth="2" />
    </svg>
  );
}