import { useState } from "react";
import { MISSED_CUT_SCORE } from "../data/golfers";

function getEffectiveScore(golfer, golferScores) {
  const data = golferScores[golfer] || { score: 0, missedCut: false };
  return data.missedCut ? MISSED_CUT_SCORE : data.score;
}

function formatTotal(total) {
  if (total === 0) return "E";
  return total > 0 ? `+${total}` : `${total}`;
}

function formatGolferScore(golfer, golferScores) {
  const data = golferScores[golfer] || { score: 0, missedCut: false };
  if (data.missedCut) return "MC";
  if (data.score === 0) return "E";
  return data.score > 0 ? `+${data.score}` : `${data.score}`;
}

export default function Leaderboard({ participants, golferScores }) {
  const [expandedIds, setExpandedIds] = useState(new Set());

  const toggleExpanded = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const ranked = participants
    .map((p) => {
      const total = p.golfers.reduce(
        (sum, g) => sum + getEffectiveScore(g, golferScores),
        0
      );
      return { ...p, total };
    })
    .sort((a, b) => a.total - b.total);

  // Assign positions with ties
  let position = 1;
  const withPositions = ranked.map((entry, i) => {
    if (i > 0 && entry.total !== ranked[i - 1].total) {
      position = i + 1;
    }
    return { ...entry, position };
  });

  if (participants.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <p className="font-serif text-2xl text-masters-gold mb-4">
          No participants yet
        </p>
        <p className="text-masters-cream/60">
          Go to &ldquo;Manage Participants&rdquo; to add players and their golfer picks.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="font-serif text-2xl text-masters-gold font-bold mb-6 text-center">
        Standings
      </h2>

      <div className="bg-masters-dark rounded-xl overflow-hidden shadow-xl">
        {/* Header */}
        <div className="grid grid-cols-[3rem_1fr_5rem] gap-0 text-sm font-semibold text-masters-gold/80 border-b-2 border-masters-gold/30 px-4 py-3">
          <span className="text-center">Pos</span>
          <span>Player</span>
          <span className="text-center">Total</span>
        </div>

        {/* Rows */}
        {withPositions.map((entry, i) => {
          const isExpanded = expandedIds.has(entry.id);
          return (
            <div
              key={entry.id}
              className={`border-b border-masters-green/20 ${
                i === 0 ? "bg-masters-gold/10" : ""
              }`}
            >
              <div
                className="grid grid-cols-[3rem_1fr_5rem] gap-0 items-center px-4 py-3 cursor-pointer select-none"
                onClick={() => toggleExpanded(entry.id)}
              >
                <span
                  className={`text-center font-bold text-lg ${
                    entry.position === 1
                      ? "text-masters-gold"
                      : entry.position <= 3
                      ? "text-masters-cream"
                      : "text-masters-cream/60"
                  }`}
                >
                  {entry.position <= 3 && entry.position === 1
                    ? "🏆"
                    : entry.position}
                </span>
                <span className="text-white font-semibold flex items-center gap-2">
                  {entry.name}
                  <span
                    className={`text-masters-cream/40 text-xs transition-transform duration-200 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </span>
                <span
                  className={`text-center font-mono font-bold text-lg ${
                    entry.total < 0
                      ? "text-red-400"
                      : entry.total > 0
                      ? "text-green-300"
                      : "text-white"
                  }`}
                >
                  {formatTotal(entry.total)}
                </span>
              </div>
              {isExpanded && (
                <div className="px-4 pb-3 flex flex-wrap gap-2">
                  {entry.golfers.map((golfer) => {
                    const data = golferScores[golfer] || {
                      score: 0,
                      missedCut: false,
                    };
                    return (
                      <span
                        key={golfer}
                        className={`text-xs px-2 py-1 rounded-full ${
                          data.missedCut
                            ? "bg-red-900/50 text-red-300"
                            : "bg-masters-green/40 text-masters-cream/70"
                        }`}
                      >
                        {golfer}{" "}
                        <span className="font-mono font-bold">
                          ({formatGolferScore(golfer, golferScores)})
                        </span>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
