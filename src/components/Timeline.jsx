import { MISSED_CUT_SCORE } from "../data/golfers";

const ROUNDS = [
  { key: "round1", label: "Thu Apr 9", short: "R1" },
  { key: "round2", label: "Fri Apr 10", short: "R2" },
  { key: "round3", label: "Sat Apr 11", short: "R3" },
  { key: "round4", label: "Sun Apr 12", short: "R4" },
];

const COLORS = [
  "#FFD700", // gold
  "#60A5FA", // blue
  "#F87171", // red
  "#34D399", // green
  "#C084FC", // purple
  "#FB923C", // orange
  "#2DD4BF", // teal
  "#F472B6", // pink
];

function getPositions(participants, golferScores) {
  const ranked = participants
    .map((p) => {
      const total = p.golfers.reduce((sum, g) => {
        const data = golferScores[g] || { score: 0, missedCut: false };
        return sum + (data.missedCut ? MISSED_CUT_SCORE : data.score);
      }, 0);
      return { id: p.id, name: p.name, total };
    })
    .sort((a, b) => a.total - b.total);

  let pos = 1;
  return ranked.map((entry, i) => {
    if (i > 0 && entry.total !== ranked[i - 1].total) pos = i + 1;
    return { ...entry, position: pos };
  });
}

function formatTotal(total) {
  if (total === 0) return "E";
  return total > 0 ? `+${total}` : `${total}`;
}

export default function Timeline({ participants, golferScores, history }) {
  if (participants.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <p className="font-serif text-2xl text-masters-gold mb-4">No participants yet</p>
      </div>
    );
  }

  const numParticipants = participants.length;

  // Always show all 4 rounds — use saved data or current scores as fallback for the latest
  const roundData = ROUNDS.map((round) => {
    const scores = history?.[round.key];
    if (scores) {
      return { ...round, positions: getPositions(participants, scores), saved: true };
    }
    return null;
  });

  // Find last saved round index
  const lastSavedIdx = roundData.reduce(
    (acc, r, i) => (r ? i : acc),
    -1
  );

  // Add current live data as the next unsaved round (or as a "Live" overlay on the latest)
  const currentPositions = getPositions(participants, golferScores);

  // Fill in current data for the next unsaved round
  if (lastSavedIdx < 3) {
    const nextIdx = lastSavedIdx + 1;
    roundData[nextIdx] = {
      ...ROUNDS[nextIdx],
      positions: currentPositions,
      saved: false,
      live: true,
    };
  }

  // Filter to only rounds that have data
  const activeRounds = roundData.filter(Boolean);

  if (activeRounds.length === 0) {
    activeRounds.push({
      ...ROUNDS[0],
      positions: currentPositions,
      saved: false,
      live: true,
    });
  }

  const numRounds = 4; // Always lay out for 4 columns

  // Chart dimensions
  const chartWidth = 700;
  const chartHeight = Math.max(280, numParticipants * 65 + 100);
  const padLeft = 50;
  const padRight = 100; // room for name labels
  const padTop = 40;
  const padBottom = 60;
  const plotW = chartWidth - padLeft - padRight;
  const plotH = chartHeight - padTop - padBottom;

  const xStep = plotW / (numRounds - 1);
  const yStep = numParticipants > 1 ? plotH / (numParticipants - 1) : 0;

  // Map participant id -> color
  const colorMap = {};
  participants.forEach((p, i) => {
    colorMap[p.id] = COLORS[i % COLORS.length];
  });

  // Build lines per participant — only across rounds that have data
  const lines = participants.map((p) => {
    const points = [];
    for (let ri = 0; ri < 4; ri++) {
      const round = roundData[ri];
      if (!round) continue;
      const entry = round.positions.find((e) => e.id === p.id);
      const pos = entry ? entry.position : numParticipants;
      const x = padLeft + ri * xStep;
      const y = padTop + (pos - 1) * yStep;
      points.push({ x, y, pos, total: entry?.total ?? 0, ri, live: round.live });
    }
    return { id: p.id, name: p.name, color: colorMap[p.id], points };
  });

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="font-serif text-2xl text-masters-gold font-bold mb-2 text-center">
        Timeline
      </h2>
      <p className="text-masters-cream/40 text-sm text-center mb-6">
        Position changes across the tournament
      </p>

      <div className="bg-masters-dark rounded-xl p-5 shadow-xl overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto"
          style={{ minWidth: 450 }}
        >
          {/* Background vertical lines for each round */}
          {ROUNDS.map((_, ri) => (
            <line
              key={`vgrid-${ri}`}
              x1={padLeft + ri * xStep}
              x2={padLeft + ri * xStep}
              y1={padTop - 10}
              y2={padTop + plotH + 10}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={1}
            />
          ))}

          {/* Horizontal grid lines for each position */}
          {Array.from({ length: numParticipants }, (_, i) => (
            <line
              key={`hgrid-${i}`}
              x1={padLeft - 10}
              x2={padLeft + plotW + 10}
              y1={padTop + i * yStep}
              y2={padTop + i * yStep}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={1}
            />
          ))}

          {/* Y-axis label */}
          <text
            x={15}
            y={padTop + plotH / 2}
            textAnchor="middle"
            fill="rgba(255,215,0,0.35)"
            fontSize={11}
            transform={`rotate(-90, 15, ${padTop + plotH / 2})`}
          >
            POSITION
          </text>

          {/* Y-axis position numbers */}
          {Array.from({ length: numParticipants }, (_, i) => (
            <text
              key={`y-${i}`}
              x={padLeft - 16}
              y={padTop + i * yStep + 5}
              textAnchor="end"
              fill="rgba(255,215,0,0.5)"
              fontSize={14}
              fontWeight="bold"
            >
              {i + 1}
            </text>
          ))}

          {/* X-axis labels — always show all 4 days */}
          {ROUNDS.map((round, ri) => {
            const hasData = roundData[ri] !== null;
            return (
              <g key={`x-${ri}`}>
                <text
                  x={padLeft + ri * xStep}
                  y={chartHeight - 30}
                  textAnchor="middle"
                  fill={hasData ? "rgba(255,215,0,0.8)" : "rgba(255,215,0,0.25)"}
                  fontSize={13}
                  fontWeight="bold"
                >
                  {round.label}
                </text>
                <text
                  x={padLeft + ri * xStep}
                  y={chartHeight - 14}
                  textAnchor="middle"
                  fill={hasData ? "rgba(255,215,0,0.5)" : "rgba(255,215,0,0.15)"}
                  fontSize={11}
                >
                  {round.short}
                  {roundData[ri]?.live ? " (Live)" : ""}
                </text>
              </g>
            );
          })}

          {/* Lines connecting positions */}
          {lines.map((line) => (
            <polyline
              key={line.id}
              points={line.points.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke={line.color}
              strokeWidth={3}
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity={0.9}
            />
          ))}

          {/* Dots with score labels */}
          {lines.map((line) =>
            line.points.map((pt, pi) => (
              <g key={`${line.id}-${pi}`}>
                {/* Outer ring for live data */}
                {pt.live && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={7}
                    fill="none"
                    stroke={line.color}
                    strokeWidth={1.5}
                    opacity={0.4}
                  />
                )}
                <circle cx={pt.x} cy={pt.y} r={5} fill={line.color} />
                {/* Score label above dot */}
                <text
                  x={pt.x}
                  y={pt.y - 10}
                  textAnchor="middle"
                  fill={line.color}
                  fontSize={10}
                  fontWeight="bold"
                  opacity={0.8}
                >
                  {formatTotal(pt.total)}
                </text>
              </g>
            ))
          )}

          {/* Name labels at the last data point */}
          {lines.map((line) => {
            const last = line.points[line.points.length - 1];
            return (
              <text
                key={`label-${line.id}`}
                x={last.x + 12}
                y={last.y + 5}
                fill={line.color}
                fontSize={13}
                fontWeight="bold"
              >
                {line.name}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-5 mt-5">
        {lines.map((line) => {
          const last = line.points[line.points.length - 1];
          return (
            <div key={line.id} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: line.color }}
              />
              <span className="text-masters-cream/80 text-sm font-medium">
                {line.name}
              </span>
              <span
                className="text-xs font-mono"
                style={{ color: line.color }}
              >
                ({formatTotal(last.total)})
              </span>
            </div>
          );
        })}
      </div>

      {activeRounds.every((r) => r.live) && (
        <p className="text-center text-masters-cream/40 text-sm mt-4">
          Save round snapshots from the Admin Panel to track position changes across days.
        </p>
      )}
    </div>
  );
}
