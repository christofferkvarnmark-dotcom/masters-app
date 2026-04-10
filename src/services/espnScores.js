import { GOLFERS_2026 } from "../data/golfers";

// Masters 2026 event ID on ESPN
const MASTERS_EVENT_ID = "401811941";
const ESPN_SCOREBOARD_URL = `https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard?event=${MASTERS_EVENT_ID}`;

// Normalize name for matching (remove accents, lowercase)
function normalize(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z ]/g, "")
    .trim();
}

// Build a lookup map from our golfer list
const golferNormalizedMap = {};
GOLFERS_2026.forEach((name) => {
  golferNormalizedMap[normalize(name)] = name;
});

function matchGolferName(espnName) {
  const norm = normalize(espnName);
  // Exact match
  if (golferNormalizedMap[norm]) return golferNormalizedMap[norm];
  // Partial match
  for (const [key, original] of Object.entries(golferNormalizedMap)) {
    if (key.includes(norm) || norm.includes(key)) return original;
  }
  return null;
}

function parseScoreToPar(scoreStr) {
  if (!scoreStr || scoreStr === "E") return 0;
  const parsed = parseInt(scoreStr, 10);
  return isNaN(parsed) ? 0 : parsed;
}

export async function fetchESPNScores() {
  const response = await fetch(ESPN_SCOREBOARD_URL);
  if (!response.ok) throw new Error(`ESPN API error: ${response.status}`);

  const data = await response.json();

  const events = data.events;
  if (!events || events.length === 0) {
    return { scores: {}, tournamentName: null, status: "no_event" };
  }

  const event = events[0];
  const tournamentName = event.name || "PGA Tournament";
  const competitions = event.competitions;
  if (!competitions || competitions.length === 0) {
    return { scores: {}, tournamentName, status: "no_data" };
  }

  const competitors = competitions[0].competitors || [];
  if (competitors.length === 0) {
    return { scores: {}, tournamentName, status: "no_data" };
  }

  const scores = {};
  const leaderboard = [];

  for (const competitor of competitors) {
    const name = competitor.athlete?.displayName || competitor.athlete?.fullName;
    if (!name) continue;

    const scoreToPar = parseScoreToPar(competitor.score);

    // Check if player missed the cut
    const statusName = competitor.status?.type?.name || "";
    const missedCut = statusName === "STATUS_CUT" || statusName === "STATUS_WITHDRAWN";

    // Match to our golfer list for pool scores
    const matchedGolfer = matchGolferName(name);
    if (matchedGolfer) {
      scores[matchedGolfer] = { score: scoreToPar, missedCut };
    }

    // Build full tournament leaderboard entry
    const pos = competitor.status?.position?.displayName
      || competitor.sortOrder?.toString()
      || competitor.order?.toString()
      || "";

    // Extract per-round scores from linescores
    const rounds = (competitor.linescores || []).map((ls) => {
      const val = ls.displayValue || ls.value;
      return val != null ? String(val) : "-";
    });

    // Thru info
    const thru = competitor.status?.thru
      ?? (statusName === "STATUS_FINISH" ? "F" : competitor.status?.displayValue || "-");

    leaderboard.push({
      position: missedCut ? "MC" : pos,
      name,
      rounds,
      thru: String(thru),
      total: scoreToPar,
      missedCut,
      sortOrder: competitor.sortOrder ?? 999,
    });
  }

  // Sort by sortOrder (ESPN's ranking)
  leaderboard.sort((a, b) => a.sortOrder - b.sortOrder);

  return { scores, leaderboard, tournamentName, status: "ok" };
}
