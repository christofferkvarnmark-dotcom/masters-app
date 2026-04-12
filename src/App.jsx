import { useState, useEffect, useCallback, useRef } from "react";
import { useFirebaseData } from "./hooks/useFirebaseData";
import { GOLFERS_2026 } from "./data/golfers";
import { fetchESPNScores } from "./services/espnScores";
import Header from "./components/Header";
import AdminPanel from "./components/AdminPanel";
import AdminLogin from "./components/AdminLogin";
import Leaderboard from "./components/Leaderboard";
import TournamentLeaderboard from "./components/TournamentLeaderboard";
import ParticipantManager from "./components/ParticipantManager";
import Timeline from "./components/Timeline";

function buildInitialScores() {
  const scores = {};
  GOLFERS_2026.forEach((g) => {
    scores[g] = { score: 0, missedCut: false };
  });
  return scores;
}

const SAMPLE_PARTICIPANTS = [
  {
    id: "sample1",
    name: "Christoffer",
    golfers: ["Scottie Scheffler", "Rory McIlroy", "Jon Rahm", "Tiger Woods", "Jordan Spieth"],
  },
  {
    id: "sample2",
    name: "Magnus",
    golfers: ["Xander Schauffele", "Ludvig Åberg", "Collin Morikawa", "Tommy Fleetwood", "Justin Thomas"],
  },
  {
    id: "sample3",
    name: "Erik",
    golfers: ["Bryson DeChambeau", "Brooks Koepka", "Viktor Hovland", "Patrick Cantlay", "Hideki Matsuyama"],
  },
  {
    id: "sample4",
    name: "Sofia",
    golfers: ["Shane Lowry", "Sahith Theegala", "Sam Burns", "Cameron Young", "Tom Kim"],
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("standings");
  const [isAdmin, setIsAdmin] = useState(
    () => sessionStorage.getItem("adminUnlocked") === "true"
  );
  const [golferScores, setGolferScores, scoresLoading] = useFirebaseData(
    "scores",
    buildInitialScores()
  );
  const [participants, setParticipants, participantsLoading] = useFirebaseData(
    "participants",
    SAMPLE_PARTICIPANTS
  );
  const [history, setHistory, historyLoading] = useFirebaseData("history", {});
  const [lastSync, setLastSync] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const [tournamentName, setTournamentName] = useState(null);
  const [autoSync, setAutoSync] = useState(true);
  const [tournamentLeaderboard, setTournamentLeaderboard] = useState([]);

  const syncScoresRef = useRef(null);
  syncScoresRef.current = setGolferScores;

  const syncScores = useCallback(async () => {
    setSyncing(true);
    try {
      const { scores, leaderboard, tournamentName: name, status } = await fetchESPNScores();
      if (status === "ok" && Object.keys(scores).length > 0) {
        syncScoresRef.current((prev) => {
          const merged = { ...prev };
          for (const [golfer, data] of Object.entries(scores)) {
            // Update score from ESPN, but preserve existing missedCut unless ESPN explicitly sets it
            const prevMissedCut = prev[golfer]?.missedCut || false;
            merged[golfer] = {
              ...data,
              missedCut: data.missedCut || prevMissedCut,
            };
          }
          return merged;
        });
        if (leaderboard && leaderboard.length > 0) {
          setTournamentLeaderboard(leaderboard);
        }
        setTournamentName(name);
        setLastSync(new Date());
        setSyncError(null);
      } else if (status === "no_event") {
        setSyncError("No active tournament found on ESPN");
      } else {
        setSyncError("No leaderboard data available yet");
      }
    } catch (err) {
      setSyncError(err.message);
    } finally {
      setSyncing(false);
    }
  }, []);

  // Auto-sync every 2 minutes
  useEffect(() => {
    if (!autoSync) return;
    syncScores();
    const interval = setInterval(syncScores, 120_000);
    return () => clearInterval(interval);
  }, [autoSync, syncScores]);

  const loading = scoresLoading || participantsLoading || historyLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-masters-darker flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-4xl text-masters-gold mb-4">The Masters</h1>
          <p className="text-masters-cream/60 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  // Ensure participants is always an array
  const participantsList = Array.isArray(participants)
    ? participants
    : Object.values(participants || {});

  return (
    <div className="min-h-screen bg-masters-darker">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} isAdmin={isAdmin} />

      {/* Sync status — small fixed bar, never shifts layout */}
      <div className="relative h-8">
        <div className="absolute inset-0 flex items-center justify-center gap-3 text-xs">
          {tournamentName && (
            <span className="text-masters-gold font-semibold">{tournamentName}</span>
          )}
          <button
            onClick={syncScores}
            disabled={syncing}
            className="px-3 py-0.5 bg-masters-green/60 text-masters-cream/70 rounded-full hover:bg-masters-gold hover:text-masters-darker transition text-xs font-medium cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {syncing && (
              <span className="w-1.5 h-1.5 rounded-full bg-masters-gold animate-pulse" />
            )}
            {syncing ? "Syncing" : "Refresh"}
          </button>
          <label className="flex items-center gap-1 text-masters-cream/40 cursor-pointer">
            <input
              type="checkbox"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
              className="accent-masters-gold w-3 h-3"
            />
            Auto
          </label>
          {lastSync && (
            <span className="text-masters-cream/30">
              {lastSync.toLocaleTimeString()}
            </span>
          )}
          {syncError && (
            <span className="text-red-400/70">{syncError}</span>
          )}
        </div>
      </div>

      <main className="px-4 py-6">
        {activeTab === "standings" && (
          <Leaderboard
            participants={participantsList}
            golferScores={golferScores}
          />
        )}
        {activeTab === "leaderboard" && (
          <TournamentLeaderboard leaderboard={tournamentLeaderboard} />
        )}
        {activeTab === "timeline" && (
          <Timeline
            participants={participantsList}
            golferScores={golferScores}
            history={history}
          />
        )}
        {activeTab === "admin" &&
          (isAdmin ? (
            <AdminPanel
              golferScores={golferScores}
              setGolferScores={setGolferScores}
              history={history}
              setHistory={setHistory}
            />
          ) : (
            <AdminLogin onSuccess={() => setIsAdmin(true)} />
          ))}
        {activeTab === "participants" &&
          (isAdmin ? (
            <ParticipantManager
              participants={participantsList}
              setParticipants={setParticipants}
              golferScores={golferScores}
            />
          ) : (
            <AdminLogin onSuccess={() => setIsAdmin(true)} />
          ))}
      </main>
      <footer className="text-center py-6 text-masters-cream/30 text-xs border-t border-masters-green/30">
        Masters 2026 Pool &middot; Live scores via ESPN &middot; Score to Par System
      </footer>
    </div>
  );
}
