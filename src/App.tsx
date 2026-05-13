import { useState, useEffect, useRef } from "react";

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface SkillTier {
  basePrice: number;
  color: string;
  badge: string;
}

interface Player {
  id: number;
  name: string;
  role: string;
  tier: string;
  country: string;
  img: string;
  basePrice: number;
  soldTo: number | null;
  soldPrice: number | null;
}

interface SquadPlayer extends Player {
  soldPrice: number;
  isMarquee: boolean;
}

interface Team {
  id: number;
  name: string;
  short: string;
  color: string;
  accent: string;
  captain: string;
  purse: number;
  squad: SquadPlayer[];
  marqueeCount: number;
}

interface LogItem {
  icon: string;
  text: string;
  time: string;
}

// ─── DATA ────────────────────────────────────────────────────────────────────
const PURSE = 1000;
const MIN_BID_INCREMENT = 5;
const MAX_MARQUEE = 8;
const MAX_SQUAD = 15;

const SKILL_TIERS: Record<string, SkillTier> = {
  "World Class":   { basePrice: 200, color: "#FFD700", badge: "★★★" },
  "International": { basePrice: 100, color: "#C0C0C0", badge: "★★" },
  "Domestic Star": { basePrice: 50,  color: "#CD7F32", badge: "★" },
  "Emerging":      { basePrice: 20,  color: "#4fc3f7", badge: "◆" },
};

const RAW_PLAYERS = [
  { id: 1,  name: "Virat Kohli",       role: "Batsman",     tier: "World Class",   country: "IND", img: "VK"  },
  { id: 2,  name: "Rohit Sharma",      role: "Batsman",     tier: "World Class",   country: "IND", img: "RS"  },
  { id: 3,  name: "Jasprit Bumrah",    role: "Bowler",      tier: "World Class",   country: "IND", img: "JB"  },
  { id: 4,  name: "Jos Buttler",       role: "WK-Batsman",  tier: "World Class",   country: "ENG", img: "JBu" },
  { id: 5,  name: "Pat Cummins",       role: "All-Rounder", tier: "World Class",   country: "AUS", img: "PC"  },
  { id: 6,  name: "Babar Azam",        role: "Batsman",     tier: "World Class",   country: "PAK", img: "BA"  },
  { id: 7,  name: "Ben Stokes",        role: "All-Rounder", tier: "World Class",   country: "ENG", img: "BS"  },
  { id: 8,  name: "Kane Williamson",   role: "Batsman",     tier: "World Class",   country: "NZ",  img: "KW"  },
  { id: 9,  name: "Shreyas Iyer",      role: "Batsman",     tier: "International", country: "IND", img: "SI"  },
  { id: 10, name: "Suryakumar Yadav",  role: "Batsman",     tier: "International", country: "IND", img: "SKY" },
  { id: 11, name: "Ravindra Jadeja",   role: "All-Rounder", tier: "International", country: "IND", img: "RJ"  },
  { id: 12, name: "Mohammed Shami",    role: "Bowler",      tier: "International", country: "IND", img: "MS"  },
  { id: 13, name: "Glenn Maxwell",     role: "All-Rounder", tier: "International", country: "AUS", img: "GM"  },
  { id: 14, name: "Quinton de Kock",   role: "WK-Batsman",  tier: "International", country: "SA",  img: "QDK" },
  { id: 15, name: "Trent Boult",       role: "Bowler",      tier: "International", country: "NZ",  img: "TB"  },
  { id: 16, name: "Rashid Khan",       role: "Bowler",      tier: "International", country: "AFG", img: "RK"  },
  { id: 17, name: "David Warner",      role: "Batsman",     tier: "International", country: "AUS", img: "DW"  },
  { id: 18, name: "Shubman Gill",      role: "Batsman",     tier: "International", country: "IND", img: "SG"  },
  { id: 19, name: "Prithvi Shaw",      role: "Batsman",     tier: "Domestic Star", country: "IND", img: "PS"  },
  { id: 20, name: "Ishan Kishan",      role: "WK-Batsman",  tier: "Domestic Star", country: "IND", img: "IK"  },
  { id: 21, name: "Shardul Thakur",    role: "All-Rounder", tier: "Domestic Star", country: "IND", img: "ST"  },
  { id: 22, name: "Axar Patel",        role: "All-Rounder", tier: "Domestic Star", country: "IND", img: "AP"  },
  { id: 23, name: "Arshdeep Singh",    role: "Bowler",      tier: "Domestic Star", country: "IND", img: "AS"  },
  { id: 24, name: "Deepak Hooda",      role: "All-Rounder", tier: "Domestic Star", country: "IND", img: "DH"  },
  { id: 25, name: "Rinku Singh",       role: "Batsman",     tier: "Domestic Star", country: "IND", img: "RSi" },
  { id: 26, name: "Tilak Varma",       role: "Batsman",     tier: "Domestic Star", country: "IND", img: "TV"  },
  { id: 27, name: "Yashasvi Jaiswal",  role: "Batsman",     tier: "Emerging",      country: "IND", img: "YJ"  },
  { id: 28, name: "Riyan Parag",       role: "All-Rounder", tier: "Emerging",      country: "IND", img: "RP"  },
  { id: 29, name: "Nitish Rana",       role: "Batsman",     tier: "Emerging",      country: "IND", img: "NR"  },
  { id: 30, name: "Mukesh Kumar",      role: "Bowler",      tier: "Emerging",      country: "IND", img: "MK"  },
  { id: 31, name: "Abhishek Sharma",   role: "All-Rounder", tier: "Emerging",      country: "IND", img: "AbS" },
  { id: 32, name: "Rajat Patidar",     role: "Batsman",     tier: "Emerging",      country: "IND", img: "RPa" },
];

const INITIAL_PLAYERS: Player[] = RAW_PLAYERS.map((p) => ({
  ...p,
  basePrice: SKILL_TIERS[p.tier].basePrice,
  soldTo: null,
  soldPrice: null,
}));

const DEFAULT_TEAMS: Team[] = [
  { id: 1, name: "Parstriker Blue Indians",      short: "BI",  color: "#004BA0", accent: "#D1AB3E", captain: "", purse: PURSE, squad: [], marqueeCount: 0 },
  { id: 2, name: "Parstriker Red Knight", short: "RK", color: "#F5A623", accent: "#0081C9", captain: "", purse: PURSE, squad: [], marqueeCount: 0 },
  { id: 3, name: "Parstriker White Wolves",   short: "WW", color: "#D10000", accent: "#FFD700", captain: "", purse: PURSE, squad: [], marqueeCount: 0 },
];

// ─── UTILS ───────────────────────────────────────────────────────────────────
function fmt(val: number): string {
  if (val >= 100) return `₹${(val / 100).toFixed(1)} Cr`;
  return `₹${val} L`;
}

function avatarBg(tier: string): string {
  const map: Record<string, string> = {
    "World Class": "#FFD700",
    "International": "#C0C0C0",
    "Domestic Star": "#CD7F32",
    "Emerging": "#4fc3f7",
  };
  return map[tier] ?? "#888";
}

// ─── CSS ─────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=Bebas+Neue&family=Inter:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0a0a0f; --surface: #12121a; --card: #1a1a26; --border: #2a2a3d;
    --gold: #FFD700; --text: #f0f0f8; --muted: #7070a0;
    --danger: #ff4757; --success: #2ed573;
  }
  body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; min-height: 100vh; overflow-x: hidden; }
  .header { background: linear-gradient(135deg,#0a0a0f,#1a0a2e,#0a0a1a); border-bottom: 1px solid var(--border); padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; backdrop-filter: blur(20px); }
  .header-logo { font-family:'Bebas Neue',sans-serif; font-size:28px; letter-spacing:3px; color:var(--gold); display:flex; align-items:center; gap:10px; }
  .header-logo span { color:var(--text); }
  .nav-tabs { display:flex; gap:4px; }
  .nav-tab { background:transparent; border:1px solid transparent; color:var(--muted); padding:8px 16px; border-radius:8px; cursor:pointer; font-family:'Rajdhani',sans-serif; font-size:14px; font-weight:600; letter-spacing:1px; transition:all .2s; }
  .nav-tab:hover { color:var(--text); border-color:var(--border); }
  .nav-tab.active { background:var(--card); border-color:var(--gold); color:var(--gold); }

  /* SETUP */
  .setup-screen { max-width:900px; margin:0 auto; padding:40px 24px; }
  .setup-title { font-family:'Bebas Neue',sans-serif; font-size:52px; letter-spacing:4px; text-align:center; margin-bottom:8px; }
  .setup-title span { color:var(--gold); }
  .setup-sub { text-align:center; color:var(--muted); margin-bottom:48px; font-size:15px; }
  .team-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:16px; margin-bottom:32px; }
  .team-setup-card { background:var(--card); border:1px solid var(--border); border-radius:16px; padding:20px; transition:border-color .2s; }
  .team-setup-card:hover { border-color:var(--gold); }
  .team-color-bar { height:4px; border-radius:2px; margin-bottom:16px; }
  .team-setup-name { font-family:'Rajdhani',sans-serif; font-weight:700; font-size:18px; margin-bottom:4px; }
  .team-short { font-size:12px; color:var(--muted); margin-bottom:12px; }
  .input-label { font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:6px; }
  .input-field { width:100%; background:var(--surface); border:1px solid var(--border); border-radius:8px; padding:10px 14px; color:var(--text); font-size:14px; outline:none; transition:border-color .2s; }
  .input-field:focus { border-color:var(--gold); }
  .start-btn { width:100%; padding:18px; background:linear-gradient(135deg,#FFD700,#FFA500); border:none; border-radius:12px; color:#000; font-family:'Bebas Neue',sans-serif; font-size:22px; letter-spacing:3px; cursor:pointer; transition:all .2s; margin-top:8px; }
  .start-btn:hover { transform:translateY(-2px); box-shadow:0 8px 32px rgba(255,215,0,.3); }
  .start-btn:disabled { opacity:.4; cursor:not-allowed; transform:none; }

  /* AUCTION LAYOUT */
  .auction-layout { display:grid; grid-template-columns:1fr 360px; min-height:calc(100vh - 65px); }
  .stage { padding:24px; background:radial-gradient(ellipse at top,#1a0a2e,#0a0a0f 70%); }
  .stage-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
  .progress-info { font-family:'Rajdhani',sans-serif; color:var(--muted); font-size:14px; }
  .progress-bar-outer { background:var(--border); border-radius:4px; height:6px; width:200px; margin-top:6px; }
  .progress-bar-inner { height:100%; border-radius:4px; background:linear-gradient(90deg,var(--gold),#FFA500); transition:width .5s; }

  /* PLAYER SPOTLIGHT */
  .player-spotlight { background:var(--card); border:1px solid var(--border); border-radius:24px; padding:32px; text-align:center; margin-bottom:24px; position:relative; overflow:hidden; }
  .player-spotlight::before { content:''; position:absolute; top:-50%; left:-50%; width:200%; height:200%; background:radial-gradient(ellipse,rgba(255,215,0,.05),transparent 60%); pointer-events:none; }
  .tier-badge { display:inline-flex; align-items:center; gap:8px; background:var(--surface); border-radius:20px; padding:6px 14px; margin-bottom:20px; font-size:12px; font-weight:600; letter-spacing:1px; }
  .player-avatar { width:100px; height:100px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:'Bebas Neue',sans-serif; font-size:28px; margin:0 auto 16px; border:3px solid; }
  .player-name { font-family:'Bebas Neue',sans-serif; font-size:42px; letter-spacing:3px; margin-bottom:8px; line-height:1; }
  .player-meta { display:flex; justify-content:center; gap:16px; margin-bottom:24px; }
  .meta-chip { background:var(--surface); border:1px solid var(--border); border-radius:20px; padding:4px 12px; font-size:13px; }

  /* BID BOX */
  .current-bid-box { background:var(--surface); border-radius:16px; padding:20px; margin-bottom:24px; }
  .bid-label { font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:1.5px; margin-bottom:4px; }
  .bid-amount { font-family:'Bebas Neue',sans-serif; font-size:56px; letter-spacing:2px; color:var(--gold); line-height:1; }
  .bid-unit { font-size:16px; color:var(--muted); margin-top:2px; }
  .bidding-team { font-family:'Rajdhani',sans-serif; font-size:16px; font-weight:600; margin-top:8px; }

  /* BID BUTTONS */
  .bid-actions { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .team-bid-btn { padding:14px 12px; border-radius:12px; border:2px solid transparent; cursor:pointer; font-family:'Rajdhani',sans-serif; font-weight:700; font-size:15px; letter-spacing:1px; transition:all .2s; text-align:left; }
  .team-bid-btn:disabled { opacity:.35; cursor:not-allowed; }
  .team-bid-btn:not(:disabled):hover { transform:translateY(-2px); filter:brightness(1.1); }
  .team-name-sm { font-size:13px; opacity:.8; display:block; }
  .team-purse-sm { font-size:11px; opacity:.6; display:block; margin-top:2px; }
  .action-row { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px; }
  .sold-btn { background:linear-gradient(135deg,var(--success),#00b36b); border:none; border-radius:12px; color:#000; padding:14px; font-family:'Bebas Neue',sans-serif; font-size:20px; letter-spacing:2px; cursor:pointer; transition:all .2s; }
  .sold-btn:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(46,213,115,.3); }
  .sold-btn:disabled { opacity:.4; cursor:not-allowed; }
  .unsold-btn { background:var(--surface); border:1px solid var(--border); border-radius:12px; color:var(--muted); padding:14px; font-family:'Bebas Neue',sans-serif; font-size:20px; letter-spacing:2px; cursor:pointer; transition:all .2s; }
  .unsold-btn:hover { border-color:var(--danger); color:var(--danger); }
  .unsold-btn:disabled { opacity:.4; cursor:not-allowed; }

  /* SOLD OVERLAY */
  .sold-overlay { position:absolute; inset:0; background:rgba(0,0,0,.85); display:flex; flex-direction:column; align-items:center; justify-content:center; border-radius:24px; z-index:10; animation:fadeIn .3s ease; }
  .sold-text { font-family:'Bebas Neue',sans-serif; font-size:72px; letter-spacing:8px; color:var(--success); animation:zoomIn .4s ease; }
  .sold-to { font-size:18px; color:var(--muted); margin-top:4px; }
  .sold-price-tag { font-family:'Bebas Neue',sans-serif; font-size:36px; color:var(--gold); }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes zoomIn { from{transform:scale(.5);opacity:0} to{transform:scale(1);opacity:1} }

  /* SIDEBAR */
  .sidebar { background:var(--surface); border-left:1px solid var(--border); overflow-y:auto; max-height:calc(100vh - 65px); }
  .sidebar-section { padding:20px; border-bottom:1px solid var(--border); }
  .sidebar-title { font-family:'Rajdhani',sans-serif; font-weight:700; font-size:11px; text-transform:uppercase; letter-spacing:2px; color:var(--muted); margin-bottom:16px; }
  .team-card { background:var(--card); border-radius:12px; padding:14px; margin-bottom:10px; border:1px solid var(--border); cursor:pointer; transition:all .2s; }
  .team-card.active-bidder { border-color:var(--gold); box-shadow:0 0 16px rgba(255,215,0,.15); }
  .team-card-header { display:flex; justify-content:space-between; align-items:center; }
  .team-badge { font-family:'Bebas Neue',sans-serif; font-size:14px; letter-spacing:2px; padding:3px 8px; border-radius:4px; }
  .purse-bar { margin-top:8px; }
  .purse-text { display:flex; justify-content:space-between; font-size:11px; color:var(--muted); margin-bottom:4px; }
  .purse-outer { background:var(--border); border-radius:3px; height:4px; }
  .purse-inner { height:100%; border-radius:3px; transition:width .5s; }
  .squad-count { font-size:11px; color:var(--muted); margin-top:6px; }
  .bid-log { max-height:200px; overflow-y:auto; }
  .log-item { display:flex; gap:10px; align-items:flex-start; padding:8px 0; border-bottom:1px solid var(--border); }
  .log-icon { font-size:14px; flex-shrink:0; }
  .log-text { font-size:12px; line-height:1.4; }
  .log-time { font-size:10px; color:var(--muted); }

  /* PLAYERS SCREEN */
  .players-list-screen { padding:24px; max-width:1200px; margin:0 auto; }
  .filter-bar { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:24px; }
  .filter-btn { background:var(--card); border:1px solid var(--border); color:var(--muted); padding:6px 14px; border-radius:20px; cursor:pointer; font-size:13px; transition:all .2s; }
  .filter-btn.active,.filter-btn:hover { border-color:var(--gold); color:var(--gold); }
  .players-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:12px; }
  .player-card { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px; transition:all .2s; }
  .player-card.sold-card { opacity:.5; }
  .player-card:hover { border-color:#444; }
  .player-avatar-sm { width:50px; height:50px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:'Bebas Neue',sans-serif; font-size:14px; margin-bottom:10px; border:2px solid; }
  .player-card-name { font-family:'Rajdhani',sans-serif; font-weight:700; font-size:15px; margin-bottom:4px; }
  .player-card-role { font-size:11px; color:var(--muted); margin-bottom:8px; }
  .player-tier-badge { font-size:10px; padding:2px 8px; border-radius:10px; display:inline-block; background:var(--surface); }
  .sold-tag { font-size:10px; color:var(--success); font-weight:600; margin-top:6px; }
  .base-price-tag { font-size:11px; color:var(--muted); margin-top:4px; }

  /* TEAMS SCREEN */
  .teams-screen { padding:24px; max-width:1200px; margin:0 auto; }
  .teams-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:20px; }
  .team-full-card { background:var(--card); border:1px solid var(--border); border-radius:16px; overflow:hidden; }
  .team-full-header { padding:20px; display:flex; justify-content:space-between; align-items:center; }
  .team-full-name { font-family:'Bebas Neue',sans-serif; font-size:22px; letter-spacing:2px; }
  .team-stats-row { display:flex; gap:16px; padding:0 20px 16px; }
  .stat-box { background:var(--surface); border-radius:8px; padding:10px 14px; flex:1; }
  .stat-val { font-family:'Rajdhani',sans-serif; font-weight:700; font-size:20px; }
  .stat-lbl { font-size:10px; color:var(--muted); text-transform:uppercase; letter-spacing:1px; }
  .squad-list { padding:0 20px 20px; }
  .squad-player { display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid var(--border); }
  .squad-player:last-child { border-bottom:none; }
  .squad-av { width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:700; border:1.5px solid; flex-shrink:0; }
  .squad-info { flex:1; }
  .squad-name { font-size:13px; font-weight:600; }
  .squad-role { font-size:11px; color:var(--muted); }
  .squad-price { font-size:12px; font-family:'Rajdhani',sans-serif; font-weight:700; color:var(--gold); }
  .marquee-tag { font-size:9px; background:var(--gold); color:#000; padding:1px 5px; border-radius:3px; font-weight:700; letter-spacing:1px; margin-left:4px; }

  /* COMPLETE */
  .complete-screen { min-height:calc(100vh - 65px); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px 24px; }
  .trophy { font-size:80px; margin-bottom:16px; animation:bounce 1s infinite alternate; }
  @keyframes bounce { from{transform:translateY(0)} to{transform:translateY(-12px)} }
  .complete-title { font-family:'Bebas Neue',sans-serif; font-size:64px; letter-spacing:6px; color:var(--gold); margin-bottom:8px; }

  ::-webkit-scrollbar { width:6px; }
  ::-webkit-scrollbar-track { background:var(--surface); }
  ::-webkit-scrollbar-thumb { background:var(--border); border-radius:3px; }

  @media(max-width:768px) {
    .auction-layout { grid-template-columns:1fr; }
    .sidebar { max-height:300px; }
    .player-name { font-size:28px; }
    .bid-amount { font-size:40px; }
    .nav-tab { padding:8px 10px; font-size:12px; }
  }
`;

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<"setup" | "auction" | "players" | "teams">("setup");
  const [teams, setTeams] = useState<Team[]>(DEFAULT_TEAMS);
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [auctionQueue, setAuctionQueue] = useState<number[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentBid, setCurrentBid] = useState(0);
  const [currentBidder, setCurrentBidder] = useState<number | null>(null);
  const [showSold, setShowSold] = useState(false);
  const [bidLog, setBidLog] = useState<LogItem[]>([]);
  const [filterTier, setFilterTier] = useState("All");
  const [auctionDone, setAuctionDone] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  const currentPlayer: Player | undefined =
    auctionQueue.length > 0 ? players.find((p) => p.id === auctionQueue[currentIdx]) : undefined;

  useEffect(() => {
    if (currentPlayer && !showSold) {
      setCurrentBid(currentPlayer.basePrice);
      setCurrentBidder(null);
    }
  }, [currentIdx, auctionQueue]); // eslint-disable-line react-hooks/exhaustive-deps

  function addLog(icon: string, text: string) {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setBidLog((prev) => [{ icon, text, time }, ...prev.slice(0, 49)]);
  }

  function startAuction() {
    const order = ["World Class", "International", "Domestic Star", "Emerging"];
    const sorted = [...players].sort((a, b) => order.indexOf(a.tier) - order.indexOf(b.tier));
    setAuctionQueue(sorted.map((p) => p.id));
    setCurrentIdx(0);
    setScreen("auction");
    addLog("🎙️", "Auction has begun!");
  }

  function placeBid(teamId: number) {
    if (!currentPlayer) return;
    const team = teams.find((t) => t.id === teamId);
    if (!team) return;
    const newBid = currentBidder ? currentBid + MIN_BID_INCREMENT : currentPlayer.basePrice;
    if (team.purse < newBid) return;
    setCurrentBid(newBid);
    setCurrentBidder(teamId);
    addLog("💰", `${team.short} bid ${fmt(newBid)} for ${currentPlayer.name}!`);
  }

  function markSold() {
    if (!currentBidder || !currentPlayer) return;
    const team = teams.find((t) => t.id === currentBidder);
    if (!team) return;
    const isMarquee = currentPlayer.tier === "World Class";
    const soldEntry: SquadPlayer = { ...currentPlayer, soldPrice: currentBid, isMarquee };
    setTeams((prev) =>
      prev.map((t) =>
        t.id === currentBidder
          ? { ...t, purse: t.purse - currentBid, squad: [...t.squad, soldEntry], marqueeCount: isMarquee ? t.marqueeCount + 1 : t.marqueeCount }
          : t
      )
    );
    setPlayers((prev) =>
      prev.map((p) => (p.id === currentPlayer.id ? { ...p, soldTo: currentBidder, soldPrice: currentBid } : p))
    );
    addLog("🔨", `SOLD! ${currentPlayer.name} → ${team.short} for ${fmt(currentBid)}`);
    setShowSold(true);
    setTimeout(() => {
      setShowSold(false);
      advancePlayer();
    }, 2000);
  }

  function markUnsold() {
    if (!currentPlayer) return;
    addLog("❌", `${currentPlayer.name} goes UNSOLD`);
    advancePlayer();
  }

  function advancePlayer() {
    const next = currentIdx + 1;
    if (next >= auctionQueue.length) {
      setAuctionDone(true);
      addLog("🏆", "Auction Complete!");
    } else {
      setCurrentIdx(next);
    }
  }

  function canTeamBid(team: Team): boolean {
    if (showSold || !currentPlayer) return false;
    if (team.squad.length >= MAX_SQUAD) return false;
    if (currentPlayer.tier === "World Class" && team.marqueeCount >= MAX_MARQUEE) return false;
    const nextBid = currentBidder ? currentBid + MIN_BID_INCREMENT : currentPlayer.basePrice;
    if (team.purse < nextBid) return false;
    if (team.id === currentBidder) return false;
    return true;
  }

  const soldCount = players.filter((p) => p.soldTo !== null).length;
  const progressPct = auctionQueue.length > 0 ? Math.round((currentIdx / auctionQueue.length) * 100) : 0;
  const leadingTeam = currentBidder !== null ? teams.find((t) => t.id === currentBidder) : undefined;

  // ── SETUP SCREEN ──────────────────────────────────────────────────────────
  if (screen === "setup") {
    return (
      <div>
        <style>{css}</style>
        <div className="header">
          <div className="header-logo">🏏 <span>CRICKET</span> AUCTION</div>
        </div>
        <div className="setup-screen">
          <div className="setup-title">IPL <span>AUCTION</span></div>
          <p className="setup-sub">Enter captain names for each team, then start the auction!</p>
          <div className="team-grid">
            {teams.map((team) => (
              <div key={team.id} className="team-setup-card">
                <div className="team-color-bar" style={{ background: `linear-gradient(90deg,${team.color},${team.accent})` }} />
                <div className="team-setup-name">{team.name}</div>
                <div className="team-short">{team.short} · Purse: {fmt(PURSE)}</div>
                <div className="input-label">Captain Name</div>
                <input
                  className="input-field"
                  placeholder="Enter captain name..."
                  value={team.captain}
                  onChange={(e) => setTeams((prev) => prev.map((t) => (t.id === team.id ? { ...t, captain: e.target.value } : t)))}
                />
              </div>
            ))}
          </div>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, marginBottom: 24 }}>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {Object.entries(SKILL_TIERS).map(([tier, data]) => (
                <div key={tier} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: data.color, fontSize: 16 }}>{data.badge}</span>
                  <span style={{ fontSize: 13 }}>{tier}</span>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>Base: {fmt(data.basePrice)}</span>
                </div>
              ))}
            </div>
          </div>
          <button className="start-btn" onClick={startAuction}>⚡ START AUCTION</button>
        </div>
      </div>
    );
  }

  // ── COMPLETE SCREEN ───────────────────────────────────────────────────────
  if (auctionDone) {
    return (
      <div>
        <style>{css}</style>
        <div className="header">
          <div className="header-logo">🏏 <span>CRICKET</span> AUCTION</div>
          <div className="nav-tabs">
            <button className={`nav-tab ${screen === "teams" ? "active" : ""}`} onClick={() => setScreen("teams")}>Teams</button>
            <button className={`nav-tab ${screen === "players" ? "active" : ""}`} onClick={() => setScreen("players")}>Players</button>
          </div>
        </div>
        {screen !== "players" ? (
          <div className="teams-screen">
            <div className="complete-screen" style={{ minHeight: "auto", paddingBottom: 0 }}>
              <div className="trophy">🏆</div>
              <div className="complete-title">AUCTION COMPLETE</div>
              <p style={{ color: "var(--muted)", marginBottom: 40 }}>All squads are set. Let the tournament begin!</p>
            </div>
            <div className="teams-grid">{teams.map((team) => <TeamCard key={team.id} team={team} />)}</div>
          </div>
        ) : (
          <PlayersScreen players={players} teams={teams} filterTier={filterTier} setFilterTier={setFilterTier} />
        )}
      </div>
    );
  }

  // ── MAIN SCREENS ──────────────────────────────────────────────────────────
  return (
    <div>
      <style>{css}</style>
      <div className="header">
        <div className="header-logo">🏏 <span>CRICKET</span> AUCTION</div>
        <div className="nav-tabs">
          <button className={`nav-tab ${screen === "auction" ? "active" : ""}`} onClick={() => setScreen("auction")}>🔨 Auction</button>
          <button className={`nav-tab ${screen === "players" ? "active" : ""}`} onClick={() => setScreen("players")}>Players</button>
          <button className={`nav-tab ${screen === "teams" ? "active" : ""}`} onClick={() => setScreen("teams")}>Teams</button>
        </div>
      </div>

      {screen === "auction" && (
        <div className="auction-layout">
          {/* STAGE */}
          <div className="stage">
            <div className="stage-header">
              <div className="progress-info">
                Player {currentIdx + 1} of {auctionQueue.length}
                <div className="progress-bar-outer">
                  <div className="progress-bar-inner" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
              <div style={{ fontSize: 13, color: "var(--muted)", padding: "8px 12px", background: "var(--card)", borderRadius: 8 }}>
                Sold: {soldCount}/{players.length}
              </div>
            </div>

            {currentPlayer ? (
              <>
                <div className="player-spotlight">
                  {showSold && (
                    <div className="sold-overlay">
                      <div className="sold-text">SOLD!</div>
                      <div className="sold-to">to {leadingTeam?.name ?? ""}</div>
                      <div className="sold-price-tag">{fmt(currentBid)}</div>
                    </div>
                  )}
                  <div className="tier-badge" style={{ color: avatarBg(currentPlayer.tier), border: `1px solid ${avatarBg(currentPlayer.tier)}44` }}>
                    {SKILL_TIERS[currentPlayer.tier]?.badge ?? "◆"} {currentPlayer.tier}
                  </div>
                  <div className="player-avatar" style={{ borderColor: avatarBg(currentPlayer.tier), background: `${avatarBg(currentPlayer.tier)}22`, color: avatarBg(currentPlayer.tier) }}>
                    {currentPlayer.img}
                  </div>
                  <div className="player-name">{currentPlayer.name}</div>
                  <div className="player-meta">
                    <span className="meta-chip">🏏 {currentPlayer.role}</span>
                    <span className="meta-chip">🌍 {currentPlayer.country}</span>
                    <span className="meta-chip">📋 Base: {fmt(currentPlayer.basePrice)}</span>
                  </div>
                  <div className="current-bid-box">
                    <div className="bid-label">{currentBidder !== null ? "Current Bid" : "Base Price"}</div>
                    <div className="bid-amount">{fmt(currentBid)}</div>
                    <div className="bid-unit">+{fmt(MIN_BID_INCREMENT)} per raise</div>
                    {leadingTeam && (
                      <div className="bidding-team" style={{ color: leadingTeam.color }}>
                        🔥 {leadingTeam.name} is leading
                      </div>
                    )}
                  </div>
                </div>

                <div className="bid-actions">
                  {teams.map((team) => {
                    const able = canTeamBid(team);
                    const isLeading = team.id === currentBidder;
                    const nextBid = currentBidder !== null ? currentBid + MIN_BID_INCREMENT : currentPlayer.basePrice;
                    return (
                      <button
                        key={team.id}
                        className="team-bid-btn"
                        disabled={!able}
                        style={{
                          background: isLeading ? `${team.color}33` : "var(--card)",
                          borderColor: isLeading ? team.color : "var(--border)",
                          color: isLeading ? team.color : "var(--text)",
                        }}
                        onClick={() => placeBid(team.id)}
                      >
                        <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span>
                            <span className="team-badge" style={{ background: `${team.color}22`, color: team.color }}>{team.short}</span>
                            {isLeading && " 🔥"}
                          </span>
                          {able && <span style={{ fontSize: 13, color: "var(--gold)", fontFamily: "'Bebas Neue'" }}>{fmt(nextBid)}</span>}
                        </span>
                        <span className="team-name-sm">{team.captain || team.name}</span>
                        <span className="team-purse-sm">Purse: {fmt(team.purse)} · Squad: {team.squad.length}/{MAX_SQUAD}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="action-row">
                  <button className="sold-btn" onClick={markSold} disabled={currentBidder === null || showSold}>🔨 SOLD</button>
                  <button className="unsold-btn" onClick={markUnsold} disabled={showSold}>❌ UNSOLD</button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "80px 24px", color: "var(--muted)" }}>
                <div style={{ fontSize: 48 }}>🏏</div>
                <div style={{ fontSize: 16, marginTop: 16 }}>No player in queue</div>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="sidebar">
            <div className="sidebar-section">
              <div className="sidebar-title">Team Purses</div>
              {teams.map((team) => {
                const pctLeft = (team.purse / PURSE) * 100;
                const isLeading = team.id === currentBidder;
                return (
                  <div key={team.id} className={`team-card ${isLeading ? "active-bidder" : ""}`}>
                    <div className="team-card-header">
                      <div>
                        <span className="team-badge" style={{ background: team.color, color: "#fff" }}>{team.short}</span>
                        {team.captain && <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 8 }}>{team.captain}</span>}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: pctLeft < 20 ? "var(--danger)" : "var(--gold)" }}>{fmt(team.purse)}</span>
                    </div>
                    <div className="purse-bar">
                      <div className="purse-outer">
                        <div className="purse-inner" style={{ width: `${pctLeft}%`, background: pctLeft < 20 ? "var(--danger)" : team.color }} />
                      </div>
                    </div>
                    <div className="squad-count">Squad: {team.squad.length}/{MAX_SQUAD} · Marquee: {team.marqueeCount}/{MAX_MARQUEE}</div>
                  </div>
                );
              })}
            </div>
            <div className="sidebar-section">
              <div className="sidebar-title">Bid Log</div>
              <div className="bid-log" ref={logRef}>
                {bidLog.length === 0 && <div style={{ color: "var(--muted)", fontSize: 12 }}>No bids yet...</div>}
                {bidLog.map((log, i) => (
                  <div key={i} className="log-item">
                    <span className="log-icon">{log.icon}</span>
                    <div>
                      <div className="log-text">{log.text}</div>
                      <div className="log-time">{log.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {screen === "players" && (
        <PlayersScreen players={players} teams={teams} filterTier={filterTier} setFilterTier={setFilterTier} />
      )}

      {screen === "teams" && (
        <div className="teams-screen">
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: 32, letterSpacing: 2 }}>Team Squads</h2>
          </div>
          <div className="teams-grid">{teams.map((team) => <TeamCard key={team.id} team={team} />)}</div>
        </div>
      )}
    </div>
  );
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────
function TeamCard({ team }: { team: Team }) {
  return (
    <div className="team-full-card">
      <div className="team-full-header" style={{ background: `linear-gradient(135deg,${team.color}22,transparent)`, borderBottom: `3px solid ${team.color}` }}>
        <div>
          <div className="team-full-name">{team.name}</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Captain: {team.captain || "—"}</div>
        </div>
        <div className="team-badge" style={{ background: team.color, color: "#fff" }}>{team.short}</div>
      </div>
      <div className="team-stats-row">
        <div className="stat-box"><div className="stat-val" style={{ color: "var(--gold)" }}>{fmt(team.purse)}</div><div className="stat-lbl">Purse Left</div></div>
        <div className="stat-box"><div className="stat-val">{team.squad.length}</div><div className="stat-lbl">Players</div></div>
        <div className="stat-box"><div className="stat-val">{team.marqueeCount}/{MAX_MARQUEE}</div><div className="stat-lbl">Marquee</div></div>
      </div>
      <div className="squad-list">
        {team.squad.length === 0 && <div style={{ color: "var(--muted)", fontSize: 13, padding: "8px 0" }}>No players yet</div>}
        {team.squad.map((p) => (
          <div key={p.id} className="squad-player">
            <div className="squad-av" style={{ borderColor: avatarBg(p.tier), background: `${avatarBg(p.tier)}22`, color: avatarBg(p.tier) }}>
              {p.img.slice(0, 2)}
            </div>
            <div className="squad-info">
              <div className="squad-name">
                {p.name}
                {p.isMarquee && <span className="marquee-tag">M</span>}
              </div>
              <div className="squad-role">{p.role} · {p.country}</div>
            </div>
            <div className="squad-price">{fmt(p.soldPrice)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlayersScreen({
  players, teams, filterTier, setFilterTier,
}: {
  players: Player[];
  teams: Team[];
  filterTier: string;
  setFilterTier: (v: string) => void;
}) {
  const filters = ["All", "Available", "Sold", ...Object.keys(SKILL_TIERS)];
  const filtered = players.filter((p) => {
    if (filterTier === "Available") return p.soldTo === null;
    if (filterTier === "Sold") return p.soldTo !== null;
    if (filterTier === "All") return true;
    return p.tier === filterTier;
  });

  return (
    <div className="players-list-screen">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: 32, letterSpacing: 2 }}>Player Pool</h2>
        <p style={{ color: "var(--muted)", fontSize: 13 }}>
          {players.filter((p) => p.soldTo !== null).length} sold · {players.filter((p) => p.soldTo === null).length} available
        </p>
      </div>
      <div className="filter-bar">
        {filters.map((f) => (
          <button key={f} className={`filter-btn ${filterTier === f ? "active" : ""}`} onClick={() => setFilterTier(f)}>{f}</button>
        ))}
      </div>
      <div className="players-grid">
        {filtered.map((p) => {
          const soldTeam = p.soldTo !== null ? teams.find((t) => t.id === p.soldTo) : undefined;
          return (
            <div key={p.id} className={`player-card ${p.soldTo !== null ? "sold-card" : ""}`}>
              <div className="player-avatar-sm" style={{ borderColor: avatarBg(p.tier), background: `${avatarBg(p.tier)}22`, color: avatarBg(p.tier) }}>
                {p.img.slice(0, 2)}
              </div>
              <div className="player-card-name">{p.name}</div>
              <div className="player-card-role">{p.role} · {p.country}</div>
              <div className="player-tier-badge" style={{ color: avatarBg(p.tier) }}>
                {SKILL_TIERS[p.tier]?.badge ?? "◆"} {p.tier}
              </div>
              {soldTeam ? (
                <div className="sold-tag">✓ {soldTeam.short} · {fmt(p.soldPrice ?? 0)}</div>
              ) : (
                <div className="base-price-tag">Base: {fmt(p.basePrice)}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
