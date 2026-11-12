// One continuous heating cable laid in the serpentine pattern used under floors and ramps.
// It is drawn cold (cyan) and then energised once from the supply end (orange).
const ROWS = 9;
const GAP = 52;
const R = GAP / 2;
const LEFT = 70;
const RIGHT = 530;

function loopPath() {
  let d = `M${RIGHT + 60},40 H${LEFT}`;
  for (let i = 1; i < ROWS; i++) {
    const goingRight = i % 2 === 1;
    d += goingRight ? ` a${R},${R} 0 0 0 0,${GAP} H${RIGHT}` : ` a${R},${R} 0 0 1 0,${GAP} H${LEFT}`;
  }
  return d;
}

export function HeatLoop({ className = "" }: { className?: string }) {
  const d = loopPath();
  return (
    <svg viewBox={`0 0 620 ${80 + (ROWS - 1) * GAP}`} className={className} role="img"
      aria-label="طرح چیدمان کابل حرارتی که با عبور جریان برق گرم می‌شود" fill="none" strokeLinecap="round">
      <defs>
        <linearGradient id="warm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffb089" />
          <stop offset="1" stopColor="#ff6b35" />
        </linearGradient>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9" /></filter>
      </defs>
      <path d={d} stroke="#36c5d8" strokeOpacity="0.35" strokeWidth="3" />
      <path d={d} stroke="#ff6b35" strokeWidth="16" filter="url(#soft)" className="loop-glow" />
      <path d={d} stroke="url(#warm)" strokeWidth="3.5" pathLength={1} className="loop-warm" />
      <path d={d} stroke="#fff3e6" strokeWidth="5" pathLength={1} className="loop-pulse" />
      <circle cx={RIGHT + 60} cy="40" r="6" fill="#36c5d8" />
    </svg>
  );
}
