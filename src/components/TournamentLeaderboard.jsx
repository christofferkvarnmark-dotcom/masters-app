function formatScore(score) {
  if (score === 0) return "E";
  return score > 0 ? `+${score}` : `${score}`;
}

export default function TournamentLeaderboard({ leaderboard }) {
  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <p className="font-serif text-2xl text-masters-gold mb-4">
          Tournament Leaderboard
        </p>
        <p className="text-masters-cream/60">
          No leaderboard data available yet. Scores will appear once the
          tournament begins.
        </p>
      </div>
    );
  }

  // Figure out how many rounds have data
  const maxRounds = leaderboard.reduce(
    (max, p) => Math.max(max, p.rounds.length),
    0
  );
  const roundLabels = Array.from({ length: maxRounds }, (_, i) => `R${i + 1}`);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="font-serif text-2xl text-masters-gold font-bold mb-6 text-center">
        Leaderboard
      </h2>

      <div className="bg-masters-dark rounded-xl overflow-hidden shadow-xl">
        {/* Header */}
        <div
          className="grid gap-0 text-sm font-semibold text-masters-gold/80 border-b-2 border-masters-gold/30 px-4 py-3"
          style={{
            gridTemplateColumns: `3.5rem 1fr ${roundLabels
              .map(() => "3.5rem")
              .join(" ")} 3.5rem 4rem`,
          }}
        >
          <span className="text-center">Pos</span>
          <span>Player</span>
          {roundLabels.map((label) => (
            <span key={label} className="text-center">
              {label}
            </span>
          ))}
          <span className="text-center">Thru</span>
          <span className="text-center">Total</span>
        </div>

        {/* Rows */}
        {leaderboard.map((entry, i) => (
          <div
            key={`${entry.name}-${i}`}
            className={`grid gap-0 items-center px-4 py-2.5 border-b border-masters-green/20 ${
              i === 0 ? "bg-masters-gold/10" : ""
            } ${entry.missedCut ? "opacity-50" : ""}`}
            style={{
              gridTemplateColumns: `3.5rem 1fr ${roundLabels
                .map(() => "3.5rem")
                .join(" ")} 3.5rem 4rem`,
            }}
          >
            <span
              className={`text-center font-bold ${
                entry.position === "1"
                  ? "text-masters-gold"
                  : "text-masters-cream/70"
              }`}
            >
              {entry.position}
            </span>
            <span className="text-white font-semibold text-sm truncate">
              {entry.name}
            </span>
            {roundLabels.map((label, ri) => (
              <span
                key={label}
                className="text-center text-masters-cream/60 font-mono text-sm"
              >
                {entry.rounds[ri] ?? "-"}
              </span>
            ))}
            <span className="text-center text-masters-cream/60 text-sm">
              {entry.thru}
            </span>
            <span
              className={`text-center font-mono font-bold ${
                entry.total < 0
                  ? "text-red-400"
                  : entry.total > 0
                  ? "text-green-300"
                  : "text-white"
              }`}
            >
              {entry.missedCut ? "MC" : formatScore(entry.total)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
