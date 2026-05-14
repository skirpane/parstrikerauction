import { useState, useEffect, useRef } from "react";

// ─── TYPES ───────────────────────────────────────────────────────────────────
type Role = "login" | "admin" | "captain" | "viewer";

interface SkillTier { basePrice: number; color: string; badge: string; }

interface Player {
  id: number; name: string; role: string; tier: string;
  country: string; img: string; basePrice: number;
  soldTo: number | null; soldPrice: number | null; round: number | null;
}

interface SquadPlayer extends Player { soldPrice: number; isMarquee: boolean; round: number; }

interface Team {
  id: number; name: string; short: string; color: string;
  accent: string; captainPass: string; purse: number;
  squad: SquadPlayer[]; marqueeCount: number;
}

interface LogItem { icon: string; text: string; time: string; }

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const PURSE = 1000;
const MIN_BID = 5;
const MAX_MARQUEE = 8;
const MAX_SQUAD = 15;
const TOTAL_ROUNDS = 3;
const ADMIN_PASS = "admin123";

const TIERS: Record<string, SkillTier> = {
  "World Class":   { basePrice: 200, color: "#FFD700", badge: "★★★" },
  "International": { basePrice: 100, color: "#FF6B9D", badge: "★★"  },
  "Domestic Star": { basePrice: 50,  color: "#00D9FF", badge: "★"   },
  "Emerging":      { basePrice: 20,  color: "#9D4EDD", badge: "◆"   },
};

const TIER_ORDER = ["World Class", "International", "Domestic Star", "Emerging"];

const RAW_PLAYERS = [
  { id:1,  name:"Abdul Mubeen",     role:"All-Rounder",     tier:"Emerging", country:"IND", img:"AM"  },
  { id:2,  name:"Amit Jadli",       role:"Batsman/Wicket-Keeper",     tier:"Emerging", country:"IND", img:"AJ"  },
  { id:3,  name:"Anshul Dikshit",   role:"Batsman",      tier:"Emerging", country:"IND", img:"AD"  },
  { id:4,  name:"Ashish Negeet",    role:"All-Rounder", tier:"Emerging", country:"IND", img:"AN"  },
  { id:8,  name:"Janesh Chohan",    role:"All-Rounder",     tier:"Emerging", country:"IND", img:"JC"  },
  { id:9,  name:"Jitendra Mistry",  role:"Batsman", tier:"Emerging", country:"IND", img:"JM"  },
  { id:10, name:"Kannan Santharam", role:"All-Rounder",     tier:"Emerging", country:"IND", img:"KS"  },
  { id:11, name:"Karthik Vempati",  role:"Batsman",     tier:"Emerging", country:"IND", img:"KV"  },
  { id:12, name:"Kayur Kumbhani",   role:"All-Rounder", tier:"Emerging", country:"IND", img:"KK"  },
  { id:13, name:"Krunal Shah",      role:"All-Rounder",      tier:"Emerging", country:"IND", img:"KSh" },
  { id:14, name:"Mahendra Negi",    role:"All-Rounder",     tier:"Emerging", country:"IND", img:"MN"  },
  { id:15, name:"Mujeeb Mohammad",  role:"Bowler",      tier:"Emerging", country:"IND", img:"MM"  },
  { id:16, name:"Mukul Datta",      role:"Bowling", tier:"Emerging", country:"IND", img:"MD"  },
  { id:17, name:"Nikhil Surabhi",   role:"Batsman",     tier:"Emerging", country:"IND", img:"NS"  },
  { id:18, name:"Pradeep Patil",    role:"Bowling All-Rounder",      tier:"Emerging", country:"IND", img:"PP"  },
  { id:19, name:"Pranay Raj",       role:"All-Rounder", tier:"Emerging", country:"IND", img:"PR"  },
  { id:20, name:"Raghu Shivakumar", role:"Batsman",     tier:"Emerging", country:"IND", img:"RS"  },
  { id:21, name:"Rajat Mehrotra",   role:"All-Rounder/Wicket-Keeper", tier:"Emerging", country:"IND", img:"RM"  },
  { id:22, name:"Sachin Jagtap",    role:"Batsman",      tier:"Emerging", country:"IND", img:"SJ"  },
  { id:23, name:"Sameer Saxena",    role:"Batsman",     tier:"Emerging", country:"IND", img:"SS"  },
  { id:24, name:"Sandeep Kirpane",  role:"All-Rounder", tier:"Emerging", country:"IND", img:"SK"  },
  { id:25, name:"Sanjay Prajapati", role:"Bowler",      tier:"Emerging", country:"IND", img:"SP"  },
  { id:26, name:"Sanket Rana",      role:"Batsman",     tier:"Emerging", country:"IND", img:"SRa" },
  { id:27, name:"Santosh Vaghmare", role:"Bowling All-Rounder", tier:"Emerging", country:"IND", img:"SV"  },
  { id:28, name:"Savan Paka",       role:"Batsman",      tier:"Emerging", country:"IND", img:"SPa" },
  { id:30, name:"Sushil Page",      role:"Batsman", tier:"Emerging", country:"IND", img:"SuP" },
  { id:31, name:"Tushar More",      role:"Bowler",      tier:"Emerging", country:"IND", img:"TM"  },
  { id:32, name:"Vikramjeet Sangavkar", role:"Batsman/Wicket-Keeper", tier:"Emerging", country:"IND", img:"VS"  },
  { id:33, name:"Vineet Shende",    role:"All-Rounder", tier:"Emerging", country:"IND", img:"VSh" },
  { id:34, name:"Srini Vellingiri", role:"Batsman",      tier:"Emerging", country:"IND", img:"SV2" },
  { id:35, name:"Aravind Kaluva",   role:"Bowler All-Rounder",     tier:"Emerging", country:"IND", img:"AK"  },
  { id:36, name:"Raghav Ambati",    role:"Batsman All-Rounder", tier:"Emerging", country:"IND", img:"RA"  },
  { id:37, name:"Karan Shah",       role:"Bowler All-Rounder",      tier:"Emerging", country:"IND", img:"KSh2" },
  { id:38, name:"Chetan Lad",       role:"Batsman",     tier:"Emerging", country:"IND", img:"CL"  },
];

const INIT_PLAYERS: Player[] = RAW_PLAYERS.map(p => ({
  ...p, basePrice: TIERS[p.tier].basePrice, soldTo: null, soldPrice: null, round: null,
}));

const INIT_TEAMS: Team[] = [
  { id: 1, name: "Parstriker Blue Indians",   short: "BI",  color: "#0066ff", accent: "#FFD700",  captainPass:"bi123",  purse:PURSE, squad:[], marqueeCount:0 },
  { id: 2, name: "Parstriker Red Knights",    short: "RK", color: "#ff3333", accent: "#FFD700", captainPass:"rk123", purse:PURSE, squad:[], marqueeCount:0 },
  { id: 3, name: "Parstriker White Wolves",   short: "WW", color: "#ffffff", accent: "#FFD700", captainPass:"ww123", purse:PURSE, squad:[], marqueeCount:0 },
];
// ─── UTILS ────────────────────────────────────────────────────────────────────
const fmt = (v: number): string => v >= 100 ? `₹${(v/100).toFixed(1)}Cr` : `₹${v}L`;
const tierColor = (t: string): string =>
  ({ "World Class":"#FFD700","International":"#C0C0C0","Domestic Star":"#CD7F32","Emerging":"#4fc3f7" }[t] ?? "#888");

// ─── SHARED STATE ─────────────────────────────────────────────────────────────
function useShared<T>(key: string, init: T): [T, (v: T | ((p: T) => T)) => void] {
  const stored = localStorage.getItem(key);
  const [state, setLocal] = useState<T>(() => {
    try { return stored ? (JSON.parse(stored) as T) : init; } catch { return init; }
  });
  const setState = (v: T | ((p: T) => T)) => {
    setLocal(prev => {
      const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };
  useEffect(() => {
    const h = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try { setLocal(JSON.parse(e.newValue) as T); } catch { /* ignore */ }
      }
    };
    window.addEventListener("storage", h);
    return () => window.removeEventListener("storage", h);
  }, [key]);
  return [state, setState];
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#0f0f1e;--s1:#1a1a2e;--s2:#16213e;--s3:#0f3460;--bd:#4169E1;--gold:#FFD700;--txt:#e8f1f5;--mut:#a0aec0;--ok:#2ed573;--ng:#ff4757;--warn:#ffa502;--royal:#4169E1;--team-red:#ff4757;--team-blue:#4169E1;--team-white:#ffffff;--accent-pink:#FF6B9D;--accent-cyan:#00D9FF;--accent-purple:#9D4EDD}
body{background:linear-gradient(135deg,#0f0f1e 0%,#16213e 100%);color:var(--txt);font-family:'DM Sans',sans-serif;min-height:100vh;overflow-x:hidden}

.logo-banner{background:linear-gradient(135deg,#ff4757 0%,#FFD700 25%,#4169E1 50%,#9D4EDD 75%,#ffffff 100%);padding:2px;border-radius:12px;margin-bottom:20px;box-shadow:0 0 30px rgba(255,71,87,0.6),0 0 20px rgba(157,78,221,0.4)}
.logo-container{background:linear-gradient(135deg,var(--s2) 0%,#1a3e5e 100%);border-radius:10px;padding:12px;display:flex;align-items:center;justify-content:center;gap:12px;min-height:60px;border:1px solid rgba(255,215,0,0.3)}
.logo-img{width:50px;height:50px;background:linear-gradient(135deg,#ff4757 0%,#FFD700 50%,#4169E1 100%);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:bold;color:#fff;text-shadow:0 2px 4px rgba(0,0,0,0.8);box-shadow:0 0 15px rgba(255,71,87,0.5)}
.logo-text{font-family:'Bebas Neue';font-size:18px;letter-spacing:2px;background:linear-gradient(135deg,#FFD700,#FF6B9D,#4169E1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;text-shadow:0 0 10px rgba(157,78,221,0.6)}

.login-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:radial-gradient(ellipse at 20% 30%,rgba(255,107,157,0.2),transparent 50%),radial-gradient(ellipse at 80% 70%,rgba(157,78,221,0.2),transparent 50%),linear-gradient(135deg,#0f0f1e,#16213e)}
.login-box{background:linear-gradient(135deg,rgba(26,26,46,0.8) 0%,rgba(22,33,62,0.8) 100%);border:2px solid;border-image:linear-gradient(135deg,#FFD700,#FF6B9D,#4169E1,#9D4EDD) 1;border-radius:24px;padding:40px 36px;width:100%;max-width:480px;text-align:center;box-shadow:0 0 40px rgba(157,78,221,0.4),0 0 60px rgba(255,107,157,0.2);backdrop-filter:blur(10px)}
.login-logo{font-family:'Bebas Neue';font-size:42px;letter-spacing:4px;background:linear-gradient(135deg,#FFD700,#FF6B9D,#4169E1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:4px}
.login-sub{color:var(--mut);font-size:14px;margin-bottom:32px}
.role-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:22px}
.role-btn{background:linear-gradient(135deg,rgba(255,107,157,0.15),rgba(157,78,221,0.15));border:2px solid rgba(255,215,0,0.4);border-radius:14px;padding:20px 12px;cursor:pointer;transition:all .3s;color:var(--txt);text-align:center;box-shadow:0 4px 15px rgba(157,78,221,0.2)}
.role-btn:hover{border-color:#FFD700;background:linear-gradient(135deg,rgba(255,107,157,0.3),rgba(157,78,221,0.25));transform:translateY(-3px);box-shadow:0 8px 30px rgba(255,107,157,0.4);text-shadow:0 0 10px rgba(255,215,0,0.8)}
.role-btn.sel{border-color:#FFD700;background:linear-gradient(135deg,rgba(255,107,157,0.5),rgba(157,78,221,0.4));box-shadow:0 0 30px rgba(255,215,0,0.6)}
.role-icon{font-size:32px;margin-bottom:6px;text-shadow:0 0 10px rgba(255,215,0,0.6);filter:drop-shadow(0 0 8px rgba(157,78,221,0.5))}
.role-name{font-family:'Rajdhani';font-weight:700;font-size:15px;letter-spacing:1px;color:#FFD700}
.role-hint{font-size:11px;color:var(--mut);margin-top:3px}
.inp{width:100%;background:rgba(15,52,96,0.6);border:2px solid rgba(255,215,0,0.3);border-radius:10px;padding:12px 16px;color:var(--txt);font-size:15px;outline:none;transition:all .2s;margin-bottom:12px}
.inp:focus{border-color:#FFD700;background:rgba(15,52,96,0.8);box-shadow:0 0 15px rgba(255,215,0,0.4)}
.go-btn{width:100%;padding:16px;background:linear-gradient(135deg,#ff4757 0%,#FFD700 25%,#9D4EDD 75%,#FF6B9D 100%);border:none;border-radius:12px;color:#000;font-family:'Bebas Neue';font-size:20px;letter-spacing:3px;cursor:pointer;transition:all .2s;font-weight:bold;text-shadow:0 1px 3px rgba(255,255,255,0.5);box-shadow:0 4px 15px rgba(255,71,87,0.3)}
.go-btn:hover{transform:translateY(-2px);box-shadow:0 8px 35px rgba(255,107,157,.6)}
.go-btn:disabled{opacity:.4;cursor:not-allowed;transform:none}
.err-msg{color:var(--ng);font-size:13px;margin-bottom:10px}
.hint-txt{margin-top:10px;font-size:11px;color:var(--mut)}

.hdr{background:linear-gradient(90deg,#0f0f1e 0%,#16213e 50%,#0f0f1e 100%);border-bottom:2px solid;border-image:linear-gradient(90deg,#FFD700,#FF6B9D,#4169E1) 1;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:200;backdrop-filter:blur(20px);box-shadow:0 4px 20px rgba(157,78,221,0.3)}
.hdr-logo{font-family:'Bebas Neue';font-size:22px;letter-spacing:3px;background:linear-gradient(135deg,#FFD700,#FF6B9D,#4169E1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))}
.hdr-logo span{color:var(--txt)}
.hdr-right{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.role-pill{padding:4px 12px;border-radius:20px;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;background:linear-gradient(135deg,rgba(255,107,157,0.3),rgba(157,78,221,0.2));border:1px solid #FFD700;color:#FFD700}
.nav-bar{background:rgba(22,33,62,0.7);border-bottom:1px solid rgba(255,215,0,0.2);padding:0 20px;display:flex;gap:2px;overflow-x:auto}
.nav-btn{background:transparent;border:none;color:var(--mut);padding:13px 15px;cursor:pointer;font-family:'Rajdhani';font-weight:700;font-size:13px;letter-spacing:1px;border-bottom:2px solid transparent;transition:all .2s;white-space:nowrap}
.nav-btn:hover{color:#FFD700}
.nav-btn.active{color:#FFD700;border-bottom-color:#FFD700;text-shadow:0 0 10px rgba(255,215,0,0.6)}
.logout-btn{background:linear-gradient(135deg,rgba(255,107,157,0.2),rgba(157,78,221,0.15));border:1px solid rgba(255,215,0,0.4);color:var(--mut);padding:6px 13px;border-radius:8px;cursor:pointer;font-size:12px;transition:all .2s}
.logout-btn:hover{border-color:var(--ng);color:var(--ng);background:rgba(255,71,87,0.15)}
.reset-btn{background:var(--s3);border:1px solid var(--ng);color:var(--ng);padding:6px 13px;border-radius:8px;cursor:pointer;font-size:12px;transition:all .2s}

.round-banner{background:linear-gradient(135deg,#1a0a2e,#0a1a2e);border:1px solid var(--bd);border-radius:20px;padding:48px 40px;text-align:center;margin:24px auto;max-width:580px}
.rb-eyebrow{font-family:'Rajdhani';font-size:13px;letter-spacing:3px;color:var(--mut);text-transform:uppercase;margin-bottom:8px}
.rb-title{font-family:'Bebas Neue';font-size:52px;letter-spacing:4px;color:var(--gold);margin-bottom:10px}
.rb-desc{color:var(--mut);font-size:14px;margin-bottom:28px;line-height:1.6}
.rb-btn{padding:16px 44px;background:linear-gradient(135deg,var(--gold),#ffa500);border:none;border-radius:12px;color:#000;font-family:'Bebas Neue';font-size:22px;letter-spacing:3px;cursor:pointer;transition:all .2s}
.rb-btn:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(255,215,0,.3)}

.auction-wrap{display:grid;grid-template-columns:1fr 340px;min-height:calc(100vh - 110px)}
.stage{padding:22px;background:radial-gradient(ellipse at top,#1a0a2e,var(--bg) 65%);overflow-y:auto}
.stage-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px;flex-wrap:wrap;gap:10px}
.round-pill{padding:5px 14px;border-radius:20px;font-family:'Rajdhani';font-weight:700;font-size:12px;letter-spacing:1px;background:rgba(255,215,0,.12);color:var(--gold)}
.prog-bar{background:var(--bd);border-radius:4px;height:5px;width:180px;margin-top:5px}
.prog-fill{height:100%;border-radius:4px;background:linear-gradient(90deg,var(--gold),#ffa500);transition:width .5s}

.spotlight{background:var(--s2);border:1px solid var(--bd);border-radius:22px;padding:28px;text-align:center;margin-bottom:18px;position:relative;overflow:hidden}
.spotlight::before{content:'';position:absolute;top:-60%;left:-30%;width:160%;height:160%;background:radial-gradient(ellipse,rgba(255,215,0,.04),transparent 55%);pointer-events:none}
.tier-tag{display:inline-flex;align-items:center;gap:6px;background:var(--s1);border-radius:20px;padding:5px 14px;margin-bottom:16px;font-size:11px;font-weight:600;letter-spacing:1px;border:1px solid}
.p-avatar{width:88px;height:88px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue';font-size:22px;margin:0 auto 12px;border:3px solid}
.p-name{font-family:'Bebas Neue';font-size:38px;letter-spacing:3px;line-height:1;margin-bottom:10px}
.p-meta{display:flex;justify-content:center;gap:10px;margin-bottom:18px;flex-wrap:wrap}
.chip{background:var(--s1);border:1px solid var(--bd);border-radius:16px;padding:4px 12px;font-size:12px}
.bid-box{background:var(--s1);border-radius:14px;padding:16px;margin-bottom:18px}
.bid-lbl{font-size:10px;color:var(--mut);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:2px}
.bid-amt{font-family:'Bebas Neue';font-size:50px;letter-spacing:2px;color:var(--gold);line-height:1}
.bid-sub{font-size:12px;color:var(--mut);margin-top:3px}
.bid-leader{font-family:'Rajdhani';font-size:14px;font-weight:700;margin-top:6px}

.bid-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:10px}
.tbid-btn{padding:11px 8px;border-radius:10px;border:2px solid;cursor:pointer;font-family:'Rajdhani';font-weight:700;font-size:12px;transition:all .2s;text-align:left;background:var(--s2)}
.tbid-btn:disabled{opacity:.28;cursor:not-allowed}
.tbid-btn:not(:disabled):hover{transform:translateY(-2px);filter:brightness(1.15)}
.tbadge{font-family:'Bebas Neue';font-size:12px;letter-spacing:1.5px;padding:2px 6px;border-radius:4px}

.act-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.sold-btn{background:linear-gradient(135deg,var(--ok),#00b36b);border:none;border-radius:12px;color:#000;padding:14px;font-family:'Bebas Neue';font-size:20px;letter-spacing:2px;cursor:pointer;transition:all .2s}
.sold-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 24px rgba(46,213,115,.3)}
.sold-btn:disabled{opacity:.38;cursor:not-allowed}
.unsold-btn{background:var(--s1);border:2px solid var(--bd);border-radius:12px;color:var(--mut);padding:14px;font-family:'Bebas Neue';font-size:20px;letter-spacing:2px;cursor:pointer;transition:all .2s}
.unsold-btn:hover:not(:disabled){border-color:var(--ng);color:var(--ng)}
.unsold-btn:disabled{opacity:.38;cursor:not-allowed}
.next-rnd-btn{width:100%;margin-top:10px;padding:14px;background:linear-gradient(135deg,#7c3aed,#4f46e5);border:none;border-radius:12px;color:#fff;font-family:'Bebas Neue';font-size:18px;letter-spacing:3px;cursor:pointer;transition:all .2s}
.next-rnd-btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(124,58,237,.35)}

.sold-ov{position:absolute;inset:0;background:rgba(0,0,0,.88);display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:22px;z-index:10;animation:fadeIn .3s ease}
.sold-ov-txt{font-family:'Bebas Neue';font-size:68px;letter-spacing:8px;color:var(--ok);animation:zoomIn .4s ease}
.sold-ov-to{font-size:15px;color:var(--mut);margin-top:4px}
.sold-ov-price{font-family:'Bebas Neue';font-size:32px;color:var(--gold)}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes zoomIn{from{transform:scale(.4);opacity:0}to{transform:scale(1);opacity:1}}

.sidebar{background:var(--s1);border-left:1px solid var(--bd);overflow-y:auto;max-height:calc(100vh - 110px)}
.sb-sec{padding:14px;border-bottom:1px solid var(--bd)}
.sb-title{font-family:'Rajdhani';font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:var(--mut);margin-bottom:12px}
.tc{background:var(--s2);border-radius:10px;padding:11px;margin-bottom:7px;border:1px solid var(--bd);transition:all .2s}
.tc.leading{border-color:var(--gold);box-shadow:0 0 12px rgba(255,215,0,.12)}
.tc-row{display:flex;justify-content:space-between;align-items:center}
.pb-out{background:var(--bd);border-radius:3px;height:3px;margin-top:6px}
.pb-in{height:100%;border-radius:3px;transition:width .5s}
.sq-cnt{font-size:9px;color:var(--mut);margin-top:4px}
.log-scroll{max-height:200px;overflow-y:auto}
.log-row{display:flex;gap:8px;padding:6px 0;border-bottom:1px solid var(--bd)}
.log-ic{font-size:12px;flex-shrink:0;margin-top:1px}
.log-txt{font-size:11px;line-height:1.4;flex:1}
.log-time{font-size:9px;color:var(--mut)}

.cap-wrap{max-width:860px;margin:0 auto;padding:18px}
.cap-stats{background:var(--s2);border-radius:14px;padding:16px;margin-bottom:16px;display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.cap-stat{background:var(--s1);border-radius:10px;padding:12px;text-align:center}
.cap-stat-val{font-family:'Bebas Neue';font-size:26px;letter-spacing:1px}
.cap-stat-lbl{font-size:9px;color:var(--mut);text-transform:uppercase;letter-spacing:1px;margin-top:2px}
.cur-box{background:var(--s2);border:2px solid var(--bd);border-radius:18px;padding:22px;text-align:center;transition:all .3s}
.cur-box.active{border-color:var(--gold);box-shadow:0 0 28px rgba(255,215,0,.1)}
.no-msg{color:var(--mut);font-size:14px;padding:48px 0}
.cap-bid-btn{width:100%;margin-top:14px;padding:17px;border:none;border-radius:13px;color:#000;font-family:'Bebas Neue';font-size:22px;letter-spacing:3px;cursor:pointer;transition:all .2s}
.cap-bid-btn:hover:not(:disabled){transform:translateY(-3px);box-shadow:0 10px 28px rgba(255,215,0,.3)}
.cap-bid-btn:disabled{opacity:.35;cursor:not-allowed}

.pg-wrap{padding:18px;max-width:1100px;margin:0 auto}
.filter-row{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px}
.fbtn{background:var(--s2);border:1px solid var(--bd);color:var(--mut);padding:5px 12px;border-radius:16px;cursor:pointer;font-size:12px;transition:all .2s}
.fbtn.on,.fbtn:hover{border-color:var(--gold);color:var(--gold)}
.pg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px}
.pc{background:var(--s2);border:1px solid var(--bd);border-radius:12px;padding:13px;transition:all .2s}
.pc:hover{border-color:#444}
.pc.sold-pc{opacity:.52}
.pc-av{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue';font-size:11px;border:2px solid;margin-bottom:8px}
.pc-name{font-family:'Rajdhani';font-weight:700;font-size:13px;margin-bottom:2px}
.pc-role{font-size:10px;color:var(--mut);margin-bottom:6px}
.pc-tbadge{font-size:9px;padding:2px 7px;border-radius:8px;background:var(--s1);display:inline-block}
.pc-sold-tag{font-size:10px;color:var(--ok);font-weight:600;margin-top:4px}
.pc-base{font-size:10px;color:var(--mut);margin-top:4px}

.teams-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:16px;padding:18px;max-width:1100px;margin:0 auto}
.team-fc{background:var(--s2);border:1px solid var(--bd);border-radius:14px;overflow:hidden}
.team-fc-hdr{padding:16px;display:flex;justify-content:space-between;align-items:center}
.team-fc-name{font-family:'Bebas Neue';font-size:18px;letter-spacing:2px}
.team-stats{display:flex;gap:8px;padding:0 16px 12px}
.tstat{background:var(--s1);border-radius:7px;padding:7px 10px;flex:1;text-align:center}
.tstat-v{font-family:'Rajdhani';font-weight:700;font-size:16px}
.tstat-l{font-size:9px;color:var(--mut);text-transform:uppercase;letter-spacing:1px}
.sq-list{padding:0 16px 16px}
.sq-row{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--bd)}
.sq-row:last-child{border-bottom:none}
.sq-av{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:7px;font-weight:700;border:1.5px solid;flex-shrink:0}
.sq-info{flex:1}
.sq-name{font-size:12px;font-weight:600}
.sq-sub{font-size:10px;color:var(--mut)}
.sq-price{font-family:'Rajdhani';font-weight:700;font-size:11px;color:var(--gold)}
.mq-tag{font-size:8px;background:var(--gold);color:#000;padding:1px 4px;border-radius:3px;font-weight:700;letter-spacing:.5px;margin-left:3px}

.viewer-wrap{padding:18px;max-width:1100px;margin:0 auto}
.live-ticker{background:var(--s1);border-bottom:1px solid var(--bd);padding:9px 18px;display:flex;align-items:center;gap:10px}
.live-dot{background:var(--ng);color:#fff;font-size:8px;font-weight:700;padding:2px 6px;border-radius:3px;letter-spacing:1px;animation:pulse 1.5s infinite;flex-shrink:0}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.ticker-txt{font-size:12px;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

.done-wrap{text-align:center;padding:48px 24px}
.done-trophy{font-size:70px;animation:bou 1s infinite alternate}
@keyframes bou{from{transform:translateY(0)}to{transform:translateY(-10px)}}
.done-title{font-family:'Bebas Neue';font-size:52px;letter-spacing:5px;color:var(--gold);margin:14px 0 6px}

.squad-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px}
.sq-card{background:var(--s2);border:1px solid var(--bd);border-radius:12px;padding:13px}

::-webkit-scrollbar{width:5px}
::-webkit-scrollbar-track{background:var(--s1)}
::-webkit-scrollbar-thumb{background:var(--bd);border-radius:3px}

@media(max-width:700px){
  .auction-wrap{grid-template-columns:1fr}
  .sidebar{max-height:260px;border-left:none;border-top:1px solid var(--bd)}
  .p-name{font-size:26px}
  .bid-amt{font-size:36px}
  .bid-grid{grid-template-columns:repeat(2,1fr)}
  .cap-stats{grid-template-columns:repeat(2,1fr)}
  .nav-btn{padding:11px 10px;font-size:12px}
  .login-box{padding:36px 24px}
}
`;

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [role, setRole]     = useState<Role>("login");
  const [myTeamId, setMyTeamId] = useState<number | null>(null);

  const [teams, setTeams]     = useShared<Team[]>("ca_teams",   INIT_TEAMS);
  const [players, setPlayers] = useShared<Player[]>("ca_players", INIT_PLAYERS);
  const [queue, setQueue]     = useShared<number[]>("ca_queue",  []);
  const [curIdx, setCurIdx]   = useShared<number>("ca_idx",     0);
  const [curBid, setCurBid]   = useShared<number>("ca_bid",     0);
  const [curBidder, setCurBidder] = useShared<number | null>("ca_bidder", null);
  const [aRound, setARound]   = useShared<number>("ca_round",   0);
  const [phase, setPhase]     = useShared<"banner"|"running"|"done">("ca_phase", "banner");
  const [showSold, setShowSold] = useShared<boolean>("ca_sold",  false);
  const [log, setLog]         = useShared<LogItem[]>("ca_log",  []);
  const [aDone, setADone]     = useShared<boolean>("ca_done",   false);

  const addLog = (icon: string, text: string) => {
    const time = new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
    setLog(prev => [{ icon, text, time }, ...prev.slice(0, 59)]);
  };

  const buildQ = (round: number): number[] => {
    const sorted = [...players].sort((a,b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier));
    return round === 1 ? sorted.map(p => p.id) : sorted.filter(p => p.soldTo === null).map(p => p.id);
  };

  const startRound = (round: number) => {
    const q = buildQ(round);
    setQueue(q);
    setCurIdx(0);
    setARound(round);
    setPhase("running");
    const first = players.find(p => p.id === q[0]);
    if (first) { setCurBid(first.basePrice); setCurBidder(null); }
    addLog("🎙️", `Round ${round} started! ${q.length} players in pool.`);
  };

  const curPlayer: Player | undefined =
    queue.length > 0 ? players.find(p => p.id === queue[curIdx]) : undefined;

  const canBid = (team: Team): boolean => {
    if (showSold || !curPlayer || phase !== "running") return false;
    if (team.squad.length >= MAX_SQUAD) return false;
    if (curPlayer.tier === "World Class" && team.marqueeCount >= MAX_MARQUEE) return false;
    const nb = curBidder !== null ? curBid + MIN_BID : curPlayer.basePrice;
    if (team.purse < nb) return false;
    if (team.id === curBidder) return false;
    return true;
  };

  const placeBid = (teamId: number) => {
    if (!curPlayer) return;
    const team = teams.find(t => t.id === teamId);
    if (!team) return;
    const nb = curBidder !== null ? curBid + MIN_BID : curPlayer.basePrice;
    if (team.purse < nb) return;
    setCurBid(nb);
    setCurBidder(teamId);
    addLog("💰", `${team.short} bid ${fmt(nb)} for ${curPlayer.name}`);
  };

  const doSold = () => {
    if (curBidder === null || !curPlayer) return;
    const team = teams.find(t => t.id === curBidder);
    if (!team) return;
    const isMarquee = curPlayer.tier === "World Class";
    const sp: SquadPlayer = { ...curPlayer, soldPrice: curBid, isMarquee, round: aRound };
    setTeams(prev => prev.map(t => t.id === curBidder
      ? { ...t, purse: t.purse - curBid, squad: [...t.squad, sp], marqueeCount: isMarquee ? t.marqueeCount+1 : t.marqueeCount }
      : t
    ));
    setPlayers(prev => prev.map(p => p.id === curPlayer.id ? { ...p, soldTo: curBidder, soldPrice: curBid, round: aRound } : p));
    addLog("🔨", `SOLD! ${curPlayer.name} → ${team.short} for ${fmt(curBid)}`);
    setShowSold(true);
    setTimeout(() => { setShowSold(false); advance(); }, 2000);
  };

  const doUnsold = () => {
    if (!curPlayer) return;
    addLog("❌", `${curPlayer.name} UNSOLD (Round ${aRound})`);
    advance();
  };

  const advance = () => {
    const next = curIdx + 1;
    if (next >= queue.length) {
      if (aRound >= TOTAL_ROUNDS) { setADone(true); setPhase("done"); addLog("🏆","All 3 rounds done! Auction complete."); }
      else { setPhase("banner"); addLog("🔔", `Round ${aRound} complete! ${players.filter(p=>p.soldTo===null).length} players unsold.`); }
    } else {
      setCurIdx(next);
      const np = players.find(p => p.id === queue[next]);
      if (np) { setCurBid(np.basePrice); setCurBidder(null); }
    }
  };

  const resetAll = () => {
    if (!window.confirm("Reset ALL auction data? This cannot be undone.")) return;
    setTeams(INIT_TEAMS); setPlayers(INIT_PLAYERS); setQueue([]); setCurIdx(0);
    setCurBid(0); setCurBidder(null); setARound(0); setPhase("banner");
    setShowSold(false); setLog([]); setADone(false);
  };

  const logout = () => { setRole("login"); setMyTeamId(null); };
  const myTeam = myTeamId !== null ? teams.find(t => t.id === myTeamId) : undefined;
  const leadTeam = curBidder !== null ? teams.find(t => t.id === curBidder) : undefined;
  const soldCount = players.filter(p => p.soldTo !== null).length;
  const progPct = queue.length > 0 ? Math.round((curIdx / queue.length) * 100) : 0;

  return (
    <>
      <style>{CSS}</style>
      {role === "login" && (
        <LoginScreen teams={teams} onLogin={(r, tid) => { setRole(r); if (tid !== undefined) setMyTeamId(tid); }} />
      )}
      {role === "admin" && (
        <AdminView
          teams={teams} players={players} curPlayer={curPlayer} curBid={curBid}
          curBidder={curBidder} aRound={aRound} phase={phase} showSold={showSold}
          log={log} aDone={aDone} soldCount={soldCount} progPct={progPct}
          leadTeam={leadTeam} queue={queue} curIdx={curIdx}
          onBid={placeBid} onSold={doSold} onUnsold={doUnsold}
          onStartRound={startRound} onLogout={logout} onReset={resetAll} canBid={canBid}
        />
      )}
      {role === "captain" && myTeam !== undefined && (
        <CaptainView
          myTeam={myTeam} teams={teams} curPlayer={curPlayer} curBid={curBid}
          curBidder={curBidder} phase={phase} aRound={aRound} log={log}
          onBid={placeBid} onLogout={logout} canBid={canBid(myTeam)}
        />
      )}
      {role === "viewer" && (
        <ViewerView
          teams={teams} players={players} curPlayer={curPlayer} curBid={curBid}
          leadTeam={leadTeam} phase={phase} aRound={aRound} onLogout={logout}
        />
      )}
    </>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginScreen({ teams, onLogin }: { teams: Team[]; onLogin: (r: Role, tid?: number) => void }) {
  const [sel, setSel] = useState<Role | null>(null);
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  const tryLogin = () => {
    setErr("");
    if (!sel) return;
    if (sel === "viewer") { onLogin("viewer"); return; }
    if (sel === "admin") {
      if (pass === ADMIN_PASS) onLogin("admin");
      else setErr("Wrong admin password");
      return;
    }
    if (sel === "captain") {
      const team = teams.find(t => t.captainPass === pass);
      if (team) onLogin("captain", team.id);
      else setErr("Wrong captain password");
    }
  };

  const roles: Array<{ r: Role; ic: string; nm: string; hn: string }> = [
    { r:"admin",   ic:"🎙️", nm:"Admin",   hn:"Controls auction" },
    { r:"captain", ic:"👑", nm:"Captain", hn:"Bid for players"  },
    { r:"viewer",  ic:"👁️", nm:"Viewer",  hn:"Watch live"       },
  ];

  return (
    <div className="login-wrap">
      <div className="login-box">
        <div className="logo-banner">
          <div className="logo-container">
            <div className="logo-img">🏏</div>
            <div className="logo-text">PARSTRIKER</div>
          </div>
        </div>
        <div className="auction-heading">⚡ PARSTRIKER AUCTION 🏆</div>
        <div className="login-sub">✨ Select your role to enter the auction room ✨</div>
        <div className="role-grid" style={{gridTemplateColumns:"repeat(3,1fr)"}}>
          {roles.map(({ r, ic, nm, hn }) => (
            <div key={r} className={`role-btn ${sel===r?"sel":""}`} onClick={() => { setSel(r); setPass(""); setErr(""); }}>
              <div className="role-icon">{ic}</div>
              <div className="role-name">{nm}</div>
              <div className="role-hint">{hn}</div>
            </div>
          ))}
        </div>
        {err && <div className="err-msg">{err}</div>}
        {sel && sel !== "viewer" && (
          <input className="inp" type="password"
            placeholder={sel === "admin" ? "Enter admin password" : "Enter captain password (e.g. mi123)"}
            value={pass} onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === "Enter" && tryLogin()} />
        )}
        {sel === "viewer" && <div style={{color:"var(--mut)",fontSize:13,marginBottom:12}}>No password required for viewers</div>}
        <button className="go-btn" disabled={!sel} onClick={tryLogin}>ENTER</button>
        <div className="hint-txt">
          copyright &copy; 2024 · made with ❤️ by Kirpane
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────
function AdminView(props: {
  teams: Team[]; players: Player[]; curPlayer: Player | undefined; curBid: number;
  curBidder: number | null; aRound: number; phase: "banner"|"running"|"done";
  showSold: boolean; log: LogItem[]; aDone: boolean; soldCount: number;
  progPct: number; leadTeam: Team | undefined; queue: number[]; curIdx: number;
  onBid: (id: number) => void; onSold: () => void; onUnsold: () => void;
  onStartRound: (r: number) => void; onLogout: () => void; onReset: () => void;
  canBid: (t: Team) => boolean;
}) {
  const { teams, players, curPlayer, curBid, curBidder, aRound, phase, showSold,
          log, aDone, soldCount, progPct, leadTeam, queue, curIdx,
          onBid, onSold, onUnsold, onStartRound, onLogout, onReset, canBid } = props;
  const [tab, setTab] = useState<"auction"|"players"|"teams">("auction");
  const [filter, setFilter] = useState("All");

  return (
    <div>
      <div className="hdr">
        <div className="hdr-logo">🏏 <span>ADMIN PANEL</span></div>
        <div className="hdr-right">
          <span className="role-pill" style={{background:"rgba(255,215,0,.15)",color:"var(--gold)"}}>🎙️ ADMIN</span>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
          <button className="reset-btn" onClick={onReset}>Reset All</button>
        </div>
      </div>
      <div className="nav-bar">
        {(["auction","players","teams"] as const).map(t => (
          <button key={t} className={`nav-btn ${tab===t?"active":""}`} onClick={() => setTab(t)}>
            {t==="auction"?"🔨 AUCTION CONTROL":t==="players"?"🏏 ALL PLAYERS":"🏆 TEAM SQUADS"}
          </button>
        ))}
      </div>

      {tab === "auction" && (
        aDone ? <DoneScreen teams={teams} /> :
        phase === "banner" ? (
          <div style={{padding:"24px 16px"}}>
            <div className="round-banner">
              <div className="rb-eyebrow">{aRound === 0 ? "WELCOME TO THE" : `ROUND ${aRound} COMPLETE`}</div>
              <div className="rb-title">{aRound === 0 ? "Parstrikers AUCTION" : `ROUND ${aRound+1}`}</div>
              <div className="rb-desc">
                {aRound === 0
                  ? `${players.length} players · ${TOTAL_ROUNDS} rounds · ${teams.length} teams · Purse ${fmt(PURSE)} each`
                  : `${players.filter(p=>p.soldTo===null).length} unsold players re-enter · Round ${aRound+1} of ${TOTAL_ROUNDS}`}
              </div>
              <button className="rb-btn" onClick={() => onStartRound(aRound+1)}>
                {aRound === 0 ? "⚡ START AUCTION" : `▶ BEGIN ROUND ${aRound+1}`}
              </button>
            </div>
            <div className="teams-grid" style={{marginTop:8}}>
              {teams.map(t => <TeamCard key={t.id} team={t} />)}
            </div>
          </div>
        ) : (
          <div className="auction-wrap">
            <div className="stage">
              <div className="stage-top">
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div className="round-pill">ROUND {aRound}/{TOTAL_ROUNDS}</div>
                  <div style={{fontSize:11,color:"var(--mut)"}}>Sold: {soldCount}/{players.length}</div>
                </div>
                <div>
                  <div style={{fontSize:10,color:"var(--mut)",marginBottom:3}}>Player {curIdx+1}/{queue.length}</div>
                  <div className="prog-bar"><div className="prog-fill" style={{width:`${progPct}%`}} /></div>
                </div>
              </div>

              {curPlayer && (
                <>
                  <div className="spotlight">
                    {showSold && (
                      <div className="sold-ov">
                        <div className="sold-ov-txt">SOLD!</div>
                        <div className="sold-ov-to">to {leadTeam?.name ?? ""}</div>
                        <div className="sold-ov-price">{fmt(curBid)}</div>
                      </div>
                    )}
                    <div className="tier-tag" style={{color:tierColor(curPlayer.tier),borderColor:`${tierColor(curPlayer.tier)}44`}}>
                      {TIERS[curPlayer.tier]?.badge ?? "◆"} {curPlayer.tier}
                    </div>
                    <div className="p-avatar" style={{borderColor:tierColor(curPlayer.tier),background:`${tierColor(curPlayer.tier)}18`,color:tierColor(curPlayer.tier)}}>
                      {curPlayer.img}
                    </div>
                    <div className="p-name">{curPlayer.name}</div>
                    <div className="p-meta">
                      <span className="chip">🏏 {curPlayer.role}</span>
                      <span className="chip">🌍 {curPlayer.country}</span>
                      <span className="chip">Base: {fmt(curPlayer.basePrice)}</span>
                    </div>
                    <div className="bid-box">
                      <div className="bid-lbl">{curBidder !== null ? "Current Bid" : "Opening Price"}</div>
                      <div className="bid-amt">{fmt(curBid)}</div>
                      <div className="bid-sub">+{fmt(MIN_BID)} per raise</div>
                      {leadTeam && <div className="bid-leader" style={{color:leadTeam.color}}>🔥 {leadTeam.name} leading</div>}
                    </div>
                  </div>

                  <div className="bid-grid">
                    {teams.map(team => {
                      const able = canBid(team);
                      const isLead = team.id === curBidder;
                      const nb = curBidder !== null ? curBid + MIN_BID : curPlayer.basePrice;
                      return (
                        <button key={team.id} className="tbid-btn" disabled={!able}
                          style={{borderColor:isLead?team.color:"var(--bd)",background:isLead?`${team.color}20`:"var(--s2)",color:isLead?team.color:"var(--txt)"}}
                          onClick={() => onBid(team.id)}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                            <span className="tbadge" style={{background:`${team.color}22`,color:team.color}}>{team.short}</span>
                            {able && <span style={{fontSize:10,color:"var(--gold)",fontFamily:"'Bebas Neue'"}}>{fmt(nb)}</span>}
                          </div>
                          <div style={{fontSize:9,opacity:.55,marginTop:2}}>{fmt(team.purse)} left</div>
                          {isLead && <div style={{fontSize:9,color:"var(--ok)",marginTop:1}}>● LEADING</div>}
                        </button>
                      );
                    })}
                  </div>

                  <div className="act-row">
                    <button className="sold-btn" disabled={curBidder===null||showSold} onClick={onSold}>🔨 SOLD</button>
                    <button className="unsold-btn" disabled={showSold} onClick={onUnsold}>❌ UNSOLD</button>
                  </div>
                </>
              )}
            </div>

            <div className="sidebar">
              <div className="sb-sec">
                <div className="sb-title">Team Purses</div>
                {teams.map(team => {
                  const pct = (team.purse / PURSE) * 100;
                  return (
                    <div key={team.id} className={`tc ${team.id===curBidder?"leading":""}`}>
                      <div className="tc-row">
                        <span className="tbadge" style={{background:team.color,color:"#fff"}}>{team.short}</span>
                        <span style={{fontSize:11,fontWeight:600,color:pct<20?"var(--ng)":"var(--gold)"}}>{fmt(team.purse)}</span>
                      </div>
                      <div className="pb-out"><div className="pb-in" style={{width:`${pct}%`,background:pct<20?"var(--ng)":team.color}} /></div>
                      <div className="sq-cnt">Squad {team.squad.length}/{MAX_SQUAD} · Marquee {team.marqueeCount}/{MAX_MARQUEE}</div>
                    </div>
                  );
                })}
              </div>
              <div className="sb-sec">
                <div className="sb-title">Bid Log</div>
                <div className="log-scroll">
                  {log.length === 0 && <div style={{color:"var(--mut)",fontSize:11,padding:"4px 0"}}>No activity yet</div>}
                  {log.map((l,i) => (
                    <div key={i} className="log-row">
                      <span className="log-ic">{l.icon}</span>
                      <div style={{flex:1}}>
                        <div className="log-txt">{l.text}</div>
                        <div className="log-time">{l.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {tab === "players" && (
        <div className="pg-wrap">
          <div style={{marginBottom:14}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:28,letterSpacing:2}}>Player Pool</div>
            <div style={{fontSize:12,color:"var(--mut)"}}>{soldCount} sold · {players.length-soldCount} available</div>
          </div>
          <div className="filter-row">
            {["All","Available","Sold",...Object.keys(TIERS)].map(f => (
              <button key={f} className={`fbtn ${filter===f?"on":""}`} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
          <div className="pg-grid">
            {players.filter(p => {
              if (filter === "Available") return p.soldTo === null;
              if (filter === "Sold") return p.soldTo !== null;
              if (filter === "All") return true;
              return p.tier === filter;
            }).map(p => {
              const st = p.soldTo !== null ? teams.find(t => t.id === p.soldTo) : undefined;
              return (
                <div key={p.id} className={`pc ${p.soldTo!==null?"sold-pc":""}`}>
                  <div className="pc-av" style={{borderColor:tierColor(p.tier),background:`${tierColor(p.tier)}18`,color:tierColor(p.tier)}}>{p.img.slice(0,2)}</div>
                  <div className="pc-name">{p.name}</div>
                  <div className="pc-role">{p.role} · {p.country}</div>
                  <div className="pc-tbadge" style={{color:tierColor(p.tier)}}>{TIERS[p.tier]?.badge} {p.tier}</div>
                  {st ? <div className="pc-sold-tag">✓ {st.short} · {fmt(p.soldPrice??0)} · R{p.round}</div>
                      : <div className="pc-base">Base: {fmt(p.basePrice)}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "teams" && (
        <div className="teams-grid">{teams.map(t => <TeamCard key={t.id} team={t} />)}</div>
      )}
    </div>
  );
}

// ─── CAPTAIN ──────────────────────────────────────────────────────────────────
function CaptainView(props: {
  myTeam: Team; teams: Team[]; curPlayer: Player | undefined; curBid: number;
  curBidder: number | null; phase: "banner"|"running"|"done"; aRound: number;
  log: LogItem[]; onBid: (id: number) => void; onLogout: () => void; canBid: boolean;
}) {
  const { myTeam, curPlayer, curBid, curBidder, phase, aRound, log, onBid, onLogout, canBid } = props;
  const [tab, setTab] = useState<"bid"|"squad"|"log">("bid");
  const isLeading = curBidder === myTeam.id;
  const pctLeft = (myTeam.purse / PURSE) * 100;
  const nextBid = curBidder !== null ? curBid + MIN_BID : curPlayer?.basePrice ?? 0;
  const myLogs = log.filter(l => l.text.includes(myTeam.short));

  return (
    <div>
      <div className="hdr">
        <div className="hdr-logo">🏏 <span style={{color:myTeam.color}}>{myTeam.short}</span> · {myTeam.name}</div>
        <div className="hdr-right">
          <span className="role-pill" style={{background:`${myTeam.color}22`,color:myTeam.color}}>👑 CAPTAIN</span>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </div>
      <div className="nav-bar">
        <button className={`nav-btn ${tab==="bid"?"active":""}`} onClick={() => setTab("bid")}>🔨 LIVE BID</button>
        <button className={`nav-btn ${tab==="squad"?"active":""}`} onClick={() => setTab("squad")}>🏏 MY SQUAD ({myTeam.squad.length})</button>
        <button className={`nav-btn ${tab==="log"?"active":""}`} onClick={() => setTab("log")}>📋 MY ACTIVITY</button>
      </div>

      {tab === "bid" && (
        <div className="cap-wrap">
          <div className="cap-stats">
            <div className="cap-stat">
              <div className="cap-stat-val" style={{color:"var(--gold)"}}>{fmt(myTeam.purse)}</div>
              <div className="cap-stat-lbl">Purse Left</div>
              <div style={{background:"var(--bd)",borderRadius:3,height:3,marginTop:6}}>
                <div style={{height:"100%",borderRadius:3,background:pctLeft<20?"var(--ng)":myTeam.color,width:`${pctLeft}%`,transition:"width .5s"}} />
              </div>
            </div>
            <div className="cap-stat">
              <div className="cap-stat-val">{myTeam.squad.length}/{MAX_SQUAD}</div>
              <div className="cap-stat-lbl">Squad Size</div>
            </div>
            <div className="cap-stat">
              <div className="cap-stat-val">{myTeam.marqueeCount}/{MAX_MARQUEE}</div>
              <div className="cap-stat-lbl">Marquee</div>
            </div>
            <div className="cap-stat">
              <div className="cap-stat-val" style={{color:"var(--warn)"}}>{aRound > 0 ? `R${aRound}` : "—"}</div>
              <div className="cap-stat-lbl">Round</div>
            </div>
          </div>

          <div className={`cur-box ${phase==="running"&&curPlayer?"active":""}`}>
            {phase === "banner" && <div className="no-msg">⏳ Waiting for admin to start the auction...</div>}
            {phase === "done"   && <div className="no-msg">🏆 Auction complete! Check your squad tab.</div>}
            {phase === "running" && !curPlayer && <div className="no-msg">Loading next player...</div>}
            {phase === "running" && curPlayer && (
              <>
                <div className="tier-tag" style={{color:tierColor(curPlayer.tier),borderColor:`${tierColor(curPlayer.tier)}44`,border:"1px solid",display:"inline-flex",alignItems:"center",gap:6,padding:"4px 13px",borderRadius:20,marginBottom:14,fontSize:11,fontWeight:600,letterSpacing:1}}>
                  {TIERS[curPlayer.tier]?.badge} {curPlayer.tier}
                </div>
                <div style={{width:80,height:80,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bebas Neue'",fontSize:20,margin:"0 auto 10px",border:`3px solid ${tierColor(curPlayer.tier)}`,background:`${tierColor(curPlayer.tier)}18`,color:tierColor(curPlayer.tier)}}>
                  {curPlayer.img}
                </div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:34,letterSpacing:2,marginBottom:8}}>{curPlayer.name}</div>
                <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:14,flexWrap:"wrap"}}>
                  <span className="chip">{curPlayer.role}</span>
                  <span className="chip">{curPlayer.country}</span>
                  <span className="chip">Base {fmt(curPlayer.basePrice)}</span>
                </div>
                <div style={{background:"var(--s1)",borderRadius:12,padding:14,marginBottom:4}}>
                  <div style={{fontSize:10,color:"var(--mut)",textTransform:"uppercase",letterSpacing:1.5,marginBottom:2}}>
                    {isLeading ? "🔥 YOU ARE LEADING — Hold or raise" : curBidder !== null ? "Bid in progress" : "Opening Price"}
                  </div>
                  <div style={{fontFamily:"'Bebas Neue'",fontSize:46,color:isLeading?"var(--ok)":"var(--gold)",lineHeight:1}}>{fmt(curBid)}</div>
                  {!isLeading && curBidder !== null && (
                    <div style={{fontSize:12,color:"var(--ng)",marginTop:4}}>⚠ Another team is leading!</div>
                  )}
                </div>
                <button
                  className="cap-bid-btn"
                  style={{background:isLeading?"linear-gradient(135deg,var(--ok),#00b36b)":"linear-gradient(135deg,var(--gold),#ffa500)"}}
                  disabled={!canBid}
                  onClick={() => onBid(myTeam.id)}
                >
                  {isLeading ? `✓ LEADING AT ${fmt(curBid)}` : canBid ? `BID ${fmt(nextBid)}` : "CANNOT BID"}
                </button>
                {!canBid && !isLeading && (
                  <div style={{fontSize:11,color:"var(--mut)",marginTop:8}}>
                    {myTeam.purse < nextBid ? "⚠ Insufficient purse" :
                     myTeam.squad.length >= MAX_SQUAD ? "⚠ Squad full" :
                     curPlayer.tier === "World Class" && myTeam.marqueeCount >= MAX_MARQUEE ? "⚠ Marquee slots full" :
                     "Bidding paused"}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {tab === "squad" && (
        <div className="cap-wrap">
          <div style={{marginBottom:14}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:28,letterSpacing:2}}>{myTeam.name} Squad</div>
            <div style={{fontSize:12,color:"var(--mut)"}}>{myTeam.squad.length} players · Spent: {fmt(PURSE - myTeam.purse)} · Remaining: {fmt(myTeam.purse)}</div>
          </div>
          {myTeam.squad.length === 0 ? (
            <div style={{color:"var(--mut)",textAlign:"center",padding:"60px 0"}}>No players acquired yet</div>
          ) : (
            <div className="squad-grid">
              {myTeam.squad.map(p => (
                <div key={p.id} className="sq-card">
                  <div style={{width:42,height:42,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bebas Neue'",fontSize:11,border:`2px solid ${tierColor(p.tier)}`,background:`${tierColor(p.tier)}18`,color:tierColor(p.tier),marginBottom:9}}>
                    {p.img.slice(0,2)}
                  </div>
                  <div style={{fontFamily:"'Rajdhani'",fontWeight:700,fontSize:13,marginBottom:2}}>{p.name} {p.isMarquee&&<span className="mq-tag">M</span>}</div>
                  <div style={{fontSize:10,color:"var(--mut)",marginBottom:5}}>{p.role} · {p.country}</div>
                  <div style={{fontFamily:"'Rajdhani'",fontWeight:700,fontSize:13,color:"var(--gold)"}}>{fmt(p.soldPrice)} · R{p.round}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "log" && (
        <div className="cap-wrap">
          <div style={{fontFamily:"'Bebas Neue'",fontSize:28,letterSpacing:2,marginBottom:14}}>My Activity</div>
          {myLogs.length === 0 ? (
            <div style={{color:"var(--mut)",textAlign:"center",padding:"60px 0"}}>No activity for {myTeam.short} yet</div>
          ) : (
            myLogs.map((l,i) => (
              <div key={i} style={{display:"flex",gap:10,padding:"10px 0",borderBottom:"1px solid var(--bd)"}}>
                <span style={{fontSize:18}}>{l.icon}</span>
                <div>
                  <div style={{fontSize:13}}>{l.text}</div>
                  <div style={{fontSize:10,color:"var(--mut)"}}>{l.time}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── VIEWER ───────────────────────────────────────────────────────────────────
function ViewerView(props: {
  teams: Team[]; players: Player[]; curPlayer: Player | undefined; curBid: number;
  leadTeam: Team | undefined; phase: "banner"|"running"|"done"; aRound: number;
  onLogout: () => void;
}) {
  const { teams, players, curPlayer, curBid, leadTeam, phase, aRound, onLogout } = props;
  const [tab, setTab] = useState<"live"|"teams"|"players">("live");
  const soldCount = players.filter(p => p.soldTo !== null).length;

  // Auto-refresh viewer every 3s to pick up changes from other tabs
  const [, setTick] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 3000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div>
      <div className="hdr">
        <div className="hdr-logo">🏏 <span>IPL AUCTION</span></div>
        <div className="hdr-right">
          <span className="role-pill" style={{background:"rgba(79,195,247,.12)",color:"#4fc3f7"}}>👁️ VIEWER</span>
          <button className="logout-btn" onClick={onLogout}>Exit</button>
        </div>
      </div>

      {phase === "running" && curPlayer && (
        <div className="live-ticker">
          <span className="live-dot">LIVE</span>
          <span className="ticker-txt">
            On stage: <b style={{color:"var(--txt)"}}>{curPlayer.name}</b>
            {" · "}Bid: <b style={{color:"var(--gold)"}}>{fmt(curBid)}</b>
            {leadTeam && <span> · Leading: <b style={{color:leadTeam.color}}>{leadTeam.name}</b></span>}
            {" · "}Round {aRound}/{TOTAL_ROUNDS}
            {" · "}Sold: {soldCount}/{players.length}
          </span>
        </div>
      )}

      <div className="nav-bar">
        <button className={`nav-btn ${tab==="live"?"active":""}`} onClick={() => setTab("live")}>📡 LIVE STAGE</button>
        <button className={`nav-btn ${tab==="teams"?"active":""}`} onClick={() => setTab("teams")}>🏆 TEAM SQUADS</button>
        <button className={`nav-btn ${tab==="players"?"active":""}`} onClick={() => setTab("players")}>🏏 ALL PLAYERS</button>
      </div>

      {tab === "live" && (
        <div className="viewer-wrap">
          {phase !== "running" && (
            <div style={{textAlign:"center",padding:"80px 24px",color:"var(--mut)"}}>
              <div style={{fontSize:48,marginBottom:16}}>{phase==="done"?"🏆":"⏳"}</div>
              <div style={{fontSize:16}}>{phase==="done"?"Auction complete! Check Team Squads.":"Auction hasn't started yet."}</div>
            </div>
          )}
          {phase === "running" && curPlayer && (
            <div style={{maxWidth:480,margin:"0 auto",padding:"8px 0"}}>
              <div className="spotlight" style={{marginBottom:16}}>
                <div className="tier-tag" style={{color:tierColor(curPlayer.tier),borderColor:`${tierColor(curPlayer.tier)}44`,border:"1px solid",display:"inline-flex",gap:6,padding:"4px 13px",borderRadius:20,marginBottom:14,fontSize:11,fontWeight:600,letterSpacing:1}}>
                  {TIERS[curPlayer.tier]?.badge} {curPlayer.tier}
                </div>
                <div style={{width:78,height:78,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bebas Neue'",fontSize:18,margin:"0 auto 10px",border:`3px solid ${tierColor(curPlayer.tier)}`,background:`${tierColor(curPlayer.tier)}18`,color:tierColor(curPlayer.tier)}}>
                  {curPlayer.img}
                </div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:36,letterSpacing:3,marginBottom:8}}>{curPlayer.name}</div>
                <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:16,flexWrap:"wrap"}}>
                  <span className="chip">{curPlayer.role}</span>
                  <span className="chip">{curPlayer.country}</span>
                  <span className="chip">Base {fmt(curPlayer.basePrice)}</span>
                </div>
                <div style={{background:"var(--s1)",borderRadius:12,padding:16}}>
                  <div style={{fontSize:10,color:"var(--mut)",textTransform:"uppercase",letterSpacing:1.5,marginBottom:2}}>Current Bid</div>
                  <div style={{fontFamily:"'Bebas Neue'",fontSize:50,color:"var(--gold)",lineHeight:1}}>{fmt(curBid)}</div>
                  {leadTeam && <div style={{fontFamily:"'Rajdhani'",fontWeight:700,fontSize:15,marginTop:6,color:leadTeam.color}}>🔥 {leadTeam.name}</div>}
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7}}>
                {teams.map(t => (
                  <div key={t.id} style={{background:"var(--s2)",borderRadius:10,padding:"9px 8px",textAlign:"center",border:`1px solid ${t.id===leadTeam?.id?t.color:"var(--bd)"}`,transition:"all .3s"}}>
                    <div style={{fontFamily:"'Bebas Neue'",fontSize:13,color:t.color,letterSpacing:1}}>{t.short}</div>
                    <div style={{fontSize:11,color:"var(--gold)",fontWeight:600}}>{fmt(t.purse)}</div>
                    <div style={{fontSize:9,color:"var(--mut)"}}>{t.squad.length}pl</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "teams" && (
        <div className="teams-grid">{teams.map(t => <TeamCard key={t.id} team={t} />)}</div>
      )}

      {tab === "players" && (
        <div className="pg-wrap">
          <div style={{marginBottom:14}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:28,letterSpacing:2}}>All Players</div>
            <div style={{fontSize:12,color:"var(--mut)"}}>{soldCount} sold · {players.length-soldCount} available</div>
          </div>
          <div className="pg-grid">
            {players.map(p => {
              const st = p.soldTo !== null ? teams.find(t => t.id === p.soldTo) : undefined;
              return (
                <div key={p.id} className={`pc ${p.soldTo!==null?"sold-pc":""}`}>
                  <div className="pc-av" style={{borderColor:tierColor(p.tier),background:`${tierColor(p.tier)}18`,color:tierColor(p.tier)}}>{p.img.slice(0,2)}</div>
                  <div className="pc-name">{p.name}</div>
                  <div className="pc-role">{p.role} · {p.country}</div>
                  <div className="pc-tbadge" style={{color:tierColor(p.tier)}}>{TIERS[p.tier]?.badge} {p.tier}</div>
                  {st ? <div className="pc-sold-tag">✓ {st.short} · {fmt(p.soldPrice??0)}</div>
                      : <div className="pc-base">Base: {fmt(p.basePrice)}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function TeamCard({ team }: { team: Team }) {
  return (
    <div className="team-fc">
      <div className="team-fc-hdr" style={{background:`linear-gradient(135deg,${team.color}18,transparent)`,borderBottom:`3px solid ${team.color}`}}>
        <div>
          <div className="team-fc-name">{team.name}</div>
          <div style={{fontSize:10,color:"var(--mut)"}}>Purse: {fmt(team.purse)}</div>
        </div>
        <div className="tbadge" style={{background:team.color,color:"#fff"}}>{team.short}</div>
      </div>
      <div className="team-stats">
        <div className="tstat"><div className="tstat-v" style={{color:"var(--gold)"}}>{fmt(team.purse)}</div><div className="tstat-l">Left</div></div>
        <div className="tstat"><div className="tstat-v">{team.squad.length}/{MAX_SQUAD}</div><div className="tstat-l">Players</div></div>
        <div className="tstat"><div className="tstat-v">{team.marqueeCount}/{MAX_MARQUEE}</div><div className="tstat-l">Marquee</div></div>
      </div>
      <div className="sq-list">
        {team.squad.length === 0 && <div style={{color:"var(--mut)",fontSize:11,padding:"6px 0"}}>No players yet</div>}
        {team.squad.map(p => (
          <div key={p.id} className="sq-row">
            <div className="sq-av" style={{borderColor:tierColor(p.tier),background:`${tierColor(p.tier)}18`,color:tierColor(p.tier)}}>{p.img.slice(0,2)}</div>
            <div className="sq-info">
              <div className="sq-name">{p.name}{p.isMarquee&&<span className="mq-tag">M</span>}</div>
              <div className="sq-sub">{p.role} · R{p.round}</div>
            </div>
            <div className="sq-price">{fmt(p.soldPrice)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DoneScreen({ teams }: { teams: Team[] }) {
  return (
    <div>
      <div className="done-wrap">
        <div className="done-trophy">🏆</div>
        <div className="done-title">AUCTION COMPLETE</div>
        <p style={{color:"var(--mut)",marginBottom:40}}>All {TOTAL_ROUNDS} rounds done. Final squads are locked!</p>
      </div>
      <div className="teams-grid">{teams.map(t => <TeamCard key={t.id} team={t} />)}</div>
    </div>
  );
}

// Suppress unused import warning
const _ref = useRef;
void _ref;
