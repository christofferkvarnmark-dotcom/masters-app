import { useState } from "react";
import { GOLFERS_2026, MISSED_CUT_PENALTY } from "../data/golfers";

function formatScore(score, missedCut) {
  if (missedCut) return `MC (${score >= 0 ? "+" : ""}${score} +${MISSED_CUT_PENALTY} pen)`;
  if (score === 0) return "E";
  return score > 0 ? `+${score}` : `${score}`;
}

export default function AdminPanel({ golferScores, setGolferScores, missedCuts, setMissedCuts, history, setHistory }) {
  const [search, setSearch] = useState("");

  const filtered = GOLFERS_2026.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  const updateScore = (golfer, newScore) => {
    const parsed = parseInt(newScore, 10);
    if (isNaN(parsed)) return;
    setGolferScores((prev) => ({
      ...prev,
      [golfer]: { ...prev[golfer], score: parsed },
    }));
  };

  const toggleMissedCut = (golfer) => {
    const current = missedCuts[golfer] || false;
    setMissedCuts((prev) => ({
      ...prev,
      [golfer]: !current,
    }));
  };

  const resetAll = () => {
    if (!window.confirm("Reset all golfer scores to Even (E)?")) return;
    const reset = {};
    GOLFERS_2026.forEach((g) => {
      reset[g] = { score: 0, missedCut: false };
    });
    setGolferScores(reset);
  };

  const saveRound = () => {
    const existing = history || {};
    const savedRounds = ["round1", "round2", "round3", "round4"].filter(
      (k) => existing[k]
    );
    const nextRound = `round${savedRounds.length + 1}`;
    if (savedRounds.length >= 4) {
      alert("All 4 rounds have already been saved.");
      return;
    }
    if (
      !window.confirm(
        `Save current scores as ${nextRound.replace("round", "Round ")}?`
      )
    )
      return;
    setHistory({ ...existing, [nextRound]: { ...golferScores } });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <h2 className="font-serif text-2xl text-masters-gold font-bold">
          Admin &mdash; Update Scores
        </h2>
        <div className="flex gap-2">
          <button
            onClick={saveRound}
            className="px-4 py-2 bg-masters-green hover:bg-masters-gold hover:text-masters-darker text-masters-cream rounded-lg text-sm font-semibold transition cursor-pointer"
          >
            Save Round ({["round1", "round2", "round3", "round4"].filter((k) => history?.[k]).length}/4)
          </button>
          <button
            onClick={resetAll}
            className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition cursor-pointer"
          >
            Reset All Scores
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search golfers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 px-4 py-3 rounded-lg bg-masters-dark border border-masters-green text-white placeholder-masters-cream/40 focus:outline-none focus:ring-2 focus:ring-masters-gold"
      />

      <div className="bg-masters-dark rounded-xl overflow-hidden shadow-xl">
        <div className="grid grid-cols-[1fr_auto_auto] gap-0 text-sm font-semibold text-masters-gold/80 border-b border-masters-green px-4 py-3">
          <span>Golfer</span>
          <span className="w-32 text-center">Score to Par</span>
          <span className="w-28 text-center">Missed Cut</span>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {filtered.map((golfer) => {
            const data = golferScores[golfer] || { score: 0, missedCut: false };
            return (
              <div
                key={golfer}
                className="grid grid-cols-[1fr_auto_auto] gap-0 items-center px-4 py-2.5 border-b border-masters-green/30 hover:bg-masters-green/20 transition"
              >
                <span className="text-white font-medium truncate pr-2">
                  {golfer}
                </span>
                <div className="w-32 flex items-center justify-center gap-1">
                  <button
                    onClick={() => updateScore(golfer, data.score - 1)}
                    disabled={data.missedCut}
                    className="w-8 h-8 rounded bg-masters-green hover:bg-masters-gold hover:text-masters-darker text-white font-bold text-lg transition disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span
                    className={`w-14 text-center font-mono font-bold text-sm ${
                      data.missedCut
                        ? "text-red-400"
                        : data.score < 0
                        ? "text-red-400"
                        : data.score > 0
                        ? "text-green-300"
                        : "text-white"
                    }`}
                  >
                    {formatScore(data.score, data.missedCut)}
                  </span>
                  <button
                    onClick={() => updateScore(golfer, data.score + 1)}
                    disabled={data.missedCut}
                    className="w-8 h-8 rounded bg-masters-green hover:bg-masters-gold hover:text-masters-darker text-white font-bold text-lg transition disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
                <div className="w-28 flex justify-center">
                  <button
                    onClick={() => toggleMissedCut(golfer)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                      data.missedCut
                        ? "bg-red-600 text-white"
                        : "bg-masters-green/50 text-masters-cream/50 hover:bg-red-800 hover:text-white"
                    }`}
                  >
                    {data.missedCut ? "MISSED CUT" : "MC"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
