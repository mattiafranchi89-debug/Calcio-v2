import React, { useMemo, useState, useEffect } from "react";
import {
  Users, Calendar, TrendingUp, UserPlus, Trash2, Award, Activity,
  ClipboardCheck, CheckCircle, XCircle, Trophy, Target, Send,
  Pencil, Plus, Trash, FlagTriangleRight
} from "lucide-react";

/** ====== Tipi ====== */
type Player = {
  id: number;
  name: string;
  number: number;
  position: "Portiere" | "Terzino Destro" | "Difensore Centrale" | "Terzino Sinistro" | "Centrocampista Centrale" | "Ala" | "Attaccante";
  goals: number;
  assists: number;
  presences: number;
  birthYear: number;
};

type TeamSide = 'SEGURO' | 'AVVERSARI';

type GoalEvent = { id: string; type: 'GOAL'; minute: number; team: TeamSide; playerId?: number; note?: string };

type CardEvent = { id: string; type: 'YELLOW'|'RED'; minute: number; team: TeamSide; playerId?: number; note?: string };

type SubEvent = { id: string; type: 'SUB'; minute: number; team: 'SEGURO'; outId: number; inId: number; note?: string };

type MatchEvent = GoalEvent | CardEvent | SubEvent;

type Match = {
  id: number;  round: number;  date: string;  time: string;
  home: string; away: string; address: string; city: string;
  result?: string; events: MatchEvent[];
};

/** ====== Dati iniziali ====== */
const initialPlayers: Player[] = [
  { id: 1, name: 'Russo Gabriele', number: 1, position: 'Portiere', goals: 0, assists: 0, presences: 12, birthYear: 2007 },
  { id: 2, name: 'Capasso Andrea', number: 12, position: 'Portiere', goals: 0, assists: 0, presences: 11, birthYear: 2007 },
  { id: 3, name: 'Lucchini Gabriele', number: 2, position: 'Terzino Destro', goals: 1, assists: 2, presences: 12, birthYear: 2006 },
  { id: 4, name: 'Toscano Davide', number: 3, position: 'Terzino Destro', goals: 0, assists: 1, presences: 10, birthYear: 2007 },
  { id: 5, name: 'Montalto Giovanni', number: 4, position: 'Difensore Centrale', goals: 2, assists: 0, presences: 11, birthYear: 2006 },
  { id: 6, name: 'Calvone Massimo', number: 5, position: 'Difensore Centrale', goals: 1, assists: 1, presences: 10, birthYear: 2007 },
  { id: 7, name: 'Restivo Elia', number: 6, position: 'Terzino Sinistro', goals: 0, assists: 3, presences: 12, birthYear: 2007 },
  { id: 8, name: 'Dopinto Lorenzo', number: 8, position: 'Centrocampista Centrale', goals: 3, assists: 4, presences: 11, birthYear: 2006 },
  { id: 9, name: 'Lesino Filippo', number: 7, position: 'Centrocampista Centrale', goals: 2, assists: 5, presences: 12, birthYear: 2007 },
  { id: 10, name: 'Brocca Riccardo', number: 10, position: 'Centrocampista Centrale', goals: 4, assists: 3, presences: 11, birthYear: 2005 },
  { id: 11, name: 'Cogliati Filippo', number: 11, position: 'Ala', goals: 5, assists: 6, presences: 12, birthYear: 2007 },
  { id: 12, name: 'Tahsif Abdullah', number: 14, position: 'Ala', goals: 3, assists: 4, presences: 10, birthYear: 2007 },
  { id: 13, name: 'Adam Afif', number: 15, position: 'Ala', goals: 2, assists: 3, presences: 11, birthYear: 2007 },
  { id: 14, name: "D'Agostino Cristian", number: 16, position: 'Ala', goals: 4, assists: 2, presences: 12, birthYear: 2006 },
  { id: 15, name: 'Mazzei Gabriele', number: 17, position: 'Ala', goals: 3, assists: 5, presences: 11, birthYear: 2007 },
  { id: 16, name: 'Dorosan Andrei', number: 9, position: 'Attaccante', goals: 8, assists: 2, presences: 12, birthYear: 2007 },
  { id: 17, name: 'Cristian Gaetano', number: 18, position: 'Attaccante', goals: 6, assists: 3, presences: 11, birthYear: 2007 },
  { id: 18, name: 'Romito Domenico', number: 19, position: 'Attaccante', goals: 7, assists: 4, presences: 10, birthYear: 2007 },
  { id: 19, name: 'Amelotti Enrico', number: 20, position: 'Attaccante', goals: 5, assists: 2, presences: 12, birthYear: 2007 },
];

// Utility: dd/mm/yyyy -> yyyy-mm-dd
const toISO = (d: string) => { const [dd, mm, yyyy] = d.split('/') as [string,string,string]; return `${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`; };

const fixtures: Match[] = [
  { id: 1,  round: 1,  date: toISO('20/09/2025'), time: '18:00', home: 'Vighignolo', away: 'Seguro', address: 'Via Pace S.N.C.', city: 'Settimo Milanese Fr. Vighignolo', result: '4-3', events: [] },
  { id: 2,  round: 2,  date: toISO('27/09/2025'), time: '14:45', home: 'Seguro', away: 'Villapizzone', address: 'Via Sandro Pertini 13', city: 'Seguro', result: '1-1', events: [] },
  { id: 3,  round: 3,  date: toISO('04/10/2025'), time: '18:15', home: 'Sempione Half 1919', away: 'Seguro', address: 'Via Arturo Graf, 4', city: 'Milano', result: '1-1', events: [] },
  { id: 4,  round: 4,  date: toISO('11/10/2025'), time: '14:45', home: 'Seguro', away: 'Polisportiva Or. Pa. S.', address: 'Via Sandro Pertini 13', city: 'Seguro', events: [] },
  { id: 5,  round: 5,  date: toISO('18/10/2025'), time: '17:30', home: 'Cassina Nuova', away: 'Seguro', address: 'Via Oglio, 1/3', city: 'Bollate Fraz. Cassina Nuova', events: [] },
  { id: 6,  round: 6,  date: toISO('25/10/2025'), time: '14:45', home: 'Seguro', away: 'Cob 91', address: 'Via Sandro Pertini 13', city: 'Seguro', events: [] },
  { id: 7,  round: 7,  date: toISO('01/11/2025'), time: '17:30', home: 'Ardor Bollate', away: 'Seguro', address: 'Via Repubblica 6', city: 'Bollate', events: [] },
  { id: 8,  round: 8,  date: toISO('08/11/2025'), time: '14:45', home: 'Garibaldina 1932', away: 'Seguro', address: 'Via Don Giovanni Minzoni 4', city: 'Milano', events: [] },
  { id: 9,  round: 9,  date: toISO('15/11/2025'), time: '14:45', home: 'Seguro', away: 'Quinto Romano', address: 'Via Sandro Pertini 13', city: 'Seguro', events: [] },
  { id: 10, round: 10, date: toISO('22/11/2025'), time: '17:45', home: 'Pro Novate', away: 'Seguro', address: 'Via V. Toriani 6', city: 'Novate Milanese', events: [] },
  { id: 11, round: 11, date: toISO('29/11/2025'), time: '14:45', home: 'Seguro', away: 'Calcio Bonola', address: 'Via Sandro Pertini 13', city: 'Seguro', events: [] },
  { id: 12, round: 12, date: toISO('06/12/2025'), time: '18:00', home: 'Bollatese', away: 'Seguro', address: 'Via Varalli n. 2', city: 'Bollate', events: [] },
  { id: 13, round: 13, date: toISO('13/12/2025'), time: '14:45', home: 'Seguro', away: 'Vigor FC', address: 'Via Sandro Pertini 13', city: 'Seguro', events: [] },
  { id: 14, round: 14, date: toISO('17/01/2026'), time: '14:45', home: 'Seguro', away: 'Vighignolo', address: 'Via Sandro Pertini 13', city: 'Seguro', events: [] },
  { id: 15, round: 15, date: toISO('24/01/2026'), time: '18:15', home: 'Villapizzone', away: 'Seguro', address: 'Via Perin del Vaga 11', city: 'Milano', events: [] },
  { id: 16, round: 16, date: toISO('31/01/2026'), time: '14:45', home: 'Seguro', away: 'Sempione Half 1919', address: 'Via Sandro Pertini 13', city: 'Seguro', events: [] },
  { id: 17, round: 17, date: toISO('07/02/2026'), time: '16:00', home: 'Polisportiva Or. Pa. S.', away: 'Seguro', address: 'Via Comasina 115', city: 'Milano', events: [] },
  { id: 18, round: 18, date: toISO('14/02/2026'), time: '14:45', home: 'Seguro', away: 'Cassina Nuova', address: 'Via Sandro Pertini 13', city: 'Seguro', events: [] },
  { id: 19, round: 19, date: toISO('21/02/2026'), time: '18:00', home: 'Cob 91', away: 'Seguro', address: 'Via Fabio Filzi, 31', city: 'Cormano', events: [] },
  { id: 20, round: 20, date: toISO('28/02/2026'), time: '14:45', home: 'Seguro', away: 'Ardor Bollate', address: 'Via Sandro Pertini 13', city: 'Seguro', events: [] },
  { id: 21, round: 21, date: toISO('07/03/2026'), time: '14:45', home: 'Seguro', away: 'Garibaldina 1932', address: 'Via Sandro Pertini 13', city: 'Seguro', events: [] },
  { id: 22, round: 22, date: toISO('14/03/2026'), time: '17:00', home: 'Quinto Romano', away: 'Seguro', address: 'Via Vittorio De Sica, 14', city: 'Quinto Romano', events: [] },
  { id: 23, round: 23, date: toISO('21/03/2026'), time: '14:45', home: 'Seguro', away: 'Pro Novate', address: 'Via Sandro Pertini 13', city: 'Seguro', events: [] },
  { id: 24, round: 24, date: toISO('28/03/2026'), time: '18:00', home: 'Calcio Bonola', away: 'Seguro', address: 'Via Fichi, 1', city: 'Milano', events: [] },
  { id: 25, round: 25, date: toISO('11/04/2026'), time: '14:45', home: 'Seguro', away: 'Bollatese', address: 'Via Sandro Pertini 13', city: 'Seguro', events: [] },
  { id: 26, round: 26, date: toISO('18/04/2026'), time: '15:30', home: 'Vigor FC', away: 'Seguro', address: 'Via San Michele del Carso, 55', city: 'Paderno Dugnano', events: [] },
];

/** ====== Utils ====== */
const itDate = (iso: string, opts?: Intl.DateTimeFormatOptions) => new Date(iso).toLocaleDateString('it-IT', opts);

function makeNewWeek(existing: TrainingWeek[]): TrainingWeek {
  const today = new Date();
  const weekStart = new Date(today);
  const day = today.getDay() === 0 ? 7 : today.getDay();
  weekStart.setDate(today.getDate() - (day - 1));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const fmt = (d: Date) => `${d.getDate()} ${d.toLocaleString('it-IT', { month: 'short' })}`;
  const iso = (offset: number) => { const d = new Date(weekStart); d.setDate(weekStart.getDate() + offset); return d.toISOString().split('T')[0]; };
  return { id: existing.length + 1, week: `Settimana ${existing.length + 1} - ${fmt(weekStart)} - ${fmt(weekEnd)}`, sessions: [
    { day: 'Lunedì', date: iso(0), attendance: {} },
    { day: 'Mercoledì', date: iso(2), attendance: {} },
    { day: 'Venerdì', date: iso(4), attendance: {} },
  ]};
}

/** ====== Allenamenti ====== */
type TrainingSession = { day: string; date: string; attendance: Record<number, boolean>; };
type TrainingWeek = { id: number; week: string; sessions: TrainingSession[]; };

const initialTrainings: TrainingWeek[] = [
  { id: 1, week: 'Settimana 1 - 30 Set - 6 Ott', sessions: [
    { day: 'Lunedì',    date: '2025-09-30', attendance: {} },
    { day: 'Mercoledì', date: '2025-10-02', attendance: {} },
    { day: 'Venerdì',   date: '2025-10-04', attendance: {} },
  ]}
];

/** ====== Convocazioni ====== */
type CallUpData = { opponent: string; date: string; meetingTime: string; kickoffTime: string; location: string; selectedPlayers: number[]; };
const initialCallUp: CallUpData = { opponent: 'SEMPIONE HALF 1919', date: '2025-10-12', meetingTime: '16:45', kickoffTime: '18:15', location: 'Via Antonio Aldini 77, Milano (MI)', selectedPlayers: [] };

/** ====== Persistenza LocalStorage ====== */
const LS_KEYS = { matches: 'seguro_matches_v1', callup: 'seguro_callup_v1' };

/** ====== App ====== */
export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard'|'players'|'trainings'|'callup'|'matches'|'results'|'standings'|'scorers'>('dashboard');
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [trainings, setTrainings] = useState<TrainingWeek[]>(initialTrainings);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [callUpData, setCallUpData] = useState<CallUpData>(initialCallUp);
  const [matches, setMatches] = useState<Match[]>(fixtures);
  const [openMatchId, setOpenMatchId] = useState<number|null>(null);

  // ====== Load da localStorage ======
  useEffect(()=>{
    try { const rawM = localStorage.getItem(LS_KEYS.matches); if (rawM) setMatches(JSON.parse(rawM)); } catch(e) { console.warn('LocalStorage matches parse error', e); }
    try { const rawC = localStorage.getItem(LS_KEYS.callup); if (rawC) setCallUpData(JSON.parse(rawC)); } catch(e) { console.warn('LocalStorage callup parse error', e); }
  }, []);
  // ====== Save su localStorage ======
  useEffect(()=>{ try { localStorage.setItem(LS_KEYS.matches, JSON.stringify(matches)); } catch{} }, [matches]);
  useEffect(()=>{ try { localStorage.setItem(LS_KEYS.callup, JSON.stringify(callUpData)); } catch{} }, [callUpData]);

  const totalGoals = useMemo(() => players.reduce((sum, p) => sum + p.goals, 0), [players]);
  const playedMatches = useMemo(() => matches.filter(m => !!m.result).length, [matches]);

  /** Allenamenti */
  const toggleAttendance = (playerId: number, sessionIndex: number) => {
    setTrainings(prev => prev.map(w => {
      if (w.id !== selectedWeek) return w; const sessions = [...w.sessions];
      const s = { ...sessions[sessionIndex] }; s.attendance = { ...s.attendance, [playerId]: !s.attendance[playerId] };
      sessions[sessionIndex] = s; return { ...w, sessions };
    }));
  };
  const addNewWeek = () => { setTrainings(prev => { const nw = makeNewWeek(prev); setSelectedWeek(nw.id); return [...prev, nw]; }); };
  const getPlayerWeekStats = (playerId: number) => { const week = trainings.find(w => w.id === selectedWeek); if (!week) return { present: 0, total: 0, percentage: 0 }; const total = week.sessions.length; const present = week.sessions.filter(s => s.attendance[playerId] === true).length; const percentage = total ? Math.round((present / total) * 100) : 0; return { present, total, percentage }; };

  /** Convocazioni */
  const togglePlayerCallUp = (playerId: number) => {
    setCallUpData(prev => {
      const already = prev.selectedPlayers.includes(playerId);
      if (already) return { ...prev, selectedPlayers: prev.selectedPlayers.filter(id => id !== playerId) };
      if (prev.selectedPlayers.length >= 20) { alert('Puoi convocare massimo 20 giocatori!'); return prev; }
      const p = players.find(x => x.id === playerId)!; const selected = prev.selectedPlayers.map(id => players.find(x => x.id === id)!);
      const oldCount = selected.filter(x => x.birthYear === 2005 || x.birthYear === 2006).length;
      if ((p.birthYear === 2005 || p.birthYear === 2006) && oldCount >= 4) { alert('Puoi convocare massimo 4 giocatori nati nel 2005 o 2006!'); return prev; }
      return { ...prev, selectedPlayers: [...prev.selectedPlayers, playerId] };
    });
  };
  const sendWhatsApp = () => {
    const grouped: Record<string, Player[]> = { 'Portieri': [], 'Terzini Destri': [], 'Difensori Centrali': [], 'Terzini Sinistri': [], 'Centrocampisti Centrali': [], 'Ali': [], 'Attaccanti': [] };
    const map: Record<Player["position"], string> = { 'Portiere':'Portieri','Terzino Destro':'Terzini Destri','Difensore Centrale':'Difensori Centrali','Terzino Sinistro':'Terzini Sinistri','Centrocampista Centrale':'Centrocampisti Centrali','Ala':'Ali','Attaccante':'Attaccanti'};
    callUpData.selectedPlayers.forEach(id=>{ const p = players.find(x=>x.id===id); if (!p) return; grouped[map[p.position] ?? 'Attaccanti'].push(p); });
    const numberEmojis = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟','1️⃣1️⃣','1️⃣2️⃣','1️⃣3️⃣','1️⃣4️⃣','1️⃣5️⃣','1️⃣6️⃣','1️⃣7️⃣','1️⃣8️⃣','1️⃣9️⃣','2️⃣0️⃣'];
    let counter=0; let msg = `⚽⚽⚽ JUNIORES PROVINCIALE – Girone B ⚽⚽⚽\n`; msg += `${callUpData.opponent} – SEGURO\n\n`; msg += `📅 ${itDate(callUpData.date, { weekday:'long', day:'numeric', month:'long', year:'numeric' })}\n`; msg += `⏰ Ritrovo: ${callUpData.meetingTime}\n`; msg += `⏰ Calcio d'inizio: ${callUpData.kickoffTime}\n`; msg += `📍 Campo: ${callUpData.location}\n\n`; msg += `🗋 CONVOCATI\n\n`; Object.entries(grouped).forEach(([role, list])=>{ if (!list.length) return; msg += `${role}\n`; list.forEach(p=>{ msg+=`${numberEmojis[counter]} ${p.name}\n`; counter++; }); msg += `\n`; }); msg += `⚠️ IMPORTANTE: Portare documento di identità! ⚠️\n\n`; msg += `🎒 Occorrente:\nKit allenamento completo\nCalzettoni blu`;
    const encoded = encodeURIComponent(msg); window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  /** Matches helpers */
  const updateMatch = (matchId: number, updater: (m: Match) => Match) => { setMatches(prev => prev.map(m => m.id === matchId ? updater(m) : m)); };
  const openMatch = (id: number) => setOpenMatchId(id);
  const closeMatch = () => setOpenMatchId(null);
  const selectedMatch = matches.find(m=>m.id===openMatchId) || null;

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <Target className="text-blue-600" />
          <h1 className="text-xl font-bold">Seguro Calcio U19</h1>
          <span className="ml-auto text-sm text-gray-500">Sistema di Gestione Squadra</span>
        </div>
        <nav className="max-w-6xl mx-auto px-2 pb-3 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          <TabButton active={activeTab==='dashboard'} onClick={()=>setActiveTab('dashboard')} icon={<TrendingUp size={18}/>}>Dashboard</TabButton>
          <TabButton active={activeTab==='players'} onClick={()=>setActiveTab('players')} icon={<Users size={18}/>}>Giocatori</TabButton>
          <TabButton active={activeTab==='trainings'} onClick={()=>setActiveTab('trainings')} icon={<ClipboardCheck size={18}/>}>Allenamenti</TabButton>
          <TabButton active={activeTab==='callup'} onClick={()=>setActiveTab('callup')} icon={<UserPlus size={18}/>}>Convocazione</TabButton>
          <TabButton active={activeTab==='matches'} onClick={()=>setActiveTab('matches')} icon={<Calendar size={18}/>}>Partite</TabButton>
          <TabButton active={activeTab==='results'} onClick={()=>setActiveTab('results')} icon={<Activity size={18}/>}>Risultati</TabButton>
          <TabButton active={activeTab==='standings'} onClick={()=>setActiveTab('standings')} icon={<Trophy size={18}/>}>Classifica</TabButton>
          <TabButton active={activeTab==='scorers'} onClick={()=>setActiveTab('scorers')} icon={<Award size={18}/>}>Marcatori</TabButton>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {activeTab === 'dashboard' && (
          <Dashboard totalPlayers={players.length} totalMatches={playedMatches} totalGoals={totalGoals} players={players}/>
        )}

        {activeTab === 'players' && (
          <PlayersTab players={players} setPlayers={setPlayers}/>
        )}

        {activeTab === 'trainings' && (
          <TrainingsTab players={players} trainings={trainings} selectedWeek={selectedWeek} setSelectedWeek={setSelectedWeek} toggleAttendance={toggleAttendance} addNewWeek={addNewWeek} getPlayerWeekStats={getPlayerWeekStats} />
        )}

        {activeTab === 'callup' && (
          <CallUpTab players={players} callUpData={callUpData} setCallUpData={setCallUpData} togglePlayerCallUp={togglePlayerCallUp} sendWhatsApp={sendWhatsApp} getPlayerWeekStats={getPlayerWeekStats} />
        )}

        {activeTab === 'scorers' && (
          <div className="card">
            <h2 className="text-lg font-semibold mb-3">Marcatori</h2>
            <div className="flex justify-center">
              <iframe src="https://www.tuttocampo.it/WidgetV2/Marcatori/e888709c-f06f-4678-9178-40c209ac19ef" width="500" height="700" scrolling="no" loading="lazy" frameBorder="0" style={{border:0, width:'100%', maxWidth:500}}/>
            </div>
          </div>
        )}

        {activeTab === 'matches' && (
          <MatchesTab matches={matches} onOpen={openMatch} />
        )}

        {activeTab === 'results' && (
          <div className="card">
            <h2 className="text-lg font-semibold mb-3">Risultati</h2>
            <div className="flex justify-center">
              <iframe src="https://www.tuttocampo.it/WidgetV2/Risultati/e888709c-f06f-4678-9178-40c209ac19ef" width="500" height="600" scrolling="no" loading="lazy" frameBorder="0" style={{border:0, width:'100%', maxWidth:500}}/>
            </div>
          </div>
        )}

        {activeTab === 'standings' && (
          <div className="card">
            <h2 className="text-lg font-semibold mb-3">Classifica</h2>
            <div className="flex justify-center">
              <iframe src="https://www.tuttocampo.it/WidgetV2/Classifica/e888709c-f06f-4678-9178-40c209ac19ef" width="500" height="800" scrolling="no" loading="lazy" frameBorder="0" style={{border:0, width:'100%', maxWidth:500}}/>
            </div>
          </div>
        )}
      </main>

      {selectedMatch && (
        <MatchDetailModal match={selectedMatch} players={players} onClose={closeMatch} onSave={(updater)=>updateMatch(selectedMatch.id, updater)} />
      )}
    </div>
  );
}

/** ====== Componenti ====== */
function TabButton({active, onClick, children, icon}:{active:boolean; onClick:()=>void; children:React.ReactNode; icon:React.ReactNode}) {
  return (<button onClick={onClick} className={`btn ${active ? 'bg-blue-600 text-white' : 'btn-ghost'} justify-center`}>{icon}{children}</button>);
}

function Dashboard({totalPlayers, totalMatches, totalGoals, players}:{totalPlayers:number; totalMatches:number; totalGoals:number; players:Player[]}) {
  const topScorers = [...players].sort((a,b)=>b.goals-a.goals).slice(0,5);
  const nextMatchDate = '19 Ott';
  return (<>
    <section className="grid sm:grid-cols-3 gap-4">
      <div className="card flex items-center justify-between"><div><p className="text-sm text-gray-500">Giocatori</p><p className="text-2xl font-bold">{totalPlayers}</p></div><Users className="text-blue-600"/></div>
      <div className="card flex items-center justify-between"><div><p className="text-sm text-gray-500">Partite Giocate</p><p className="text-2xl font-bold">{totalMatches}</p></div><Calendar className="text-blue-600"/></div>
      <div className="card flex items-center justify-between"><div><p className="text-sm text-gray-500">Gol Totali</p><p className="text-2xl font-bold">{totalGoals}</p></div><Award className="text-blue-600"/></div>
    </section>
    <section className="card">
      <h2 className="text-lg font-semibold mb-3">Top Marcatori</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {topScorers.map((p, idx)=>(
          <div key={p.id} className="flex items-center justify-between bg-gray-50 rounded p-3">
            <div><div className="text-sm text-gray-500">#{idx+1}</div><div className="font-semibold">{p.name}</div><div className="text-sm text-gray-500">{p.position}</div></div>
            <div className="text-right"><div className="text-2xl font-bold">{p.goals}</div><div className="text-xs text-gray-500">gol</div></div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-sm text-gray-600">Prossima Partita: <b>{nextMatchDate}</b></div>
    </section>
  </>);
}

function PlayersTab({players, setPlayers}:{players:Player[]; setPlayers:React.Dispatch<React.SetStateAction<Player[]>>}) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Partial<Player>>({ position:'Attaccante', birthYear: 2007 });
  const addPlayer = () => { if (!form.name || !form.number) return; setPlayers(prev => [...prev, { id: prev.length ? Math.max(...prev.map(p=>p.id))+1 : 1, name: form.name!, number: Number(form.number), position: (form.position ?? 'Attaccante') as Player["position"], goals: 0, assists: 0, presences: 0, birthYear: Number(form.birthYear ?? 2007), }]); setForm({ position:'Attaccante', birthYear: 2007 }); setShowAdd(false); };
  const deletePlayer = (id:number) => { setPlayers(prev => prev.filter(p=>p.id!==id)); };
  return (<section className="space-y-4">
    <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Rosa Giocatori</h2><button className="btn btn-primary" onClick={()=>setShowAdd(s=>!s)}><UserPlus size={18}/>Aggiungi Giocatore</button></div>
    {showAdd && (<div className="card grid sm:grid-cols-4 gap-3">
      <div><label className="text-sm text-gray-600">Nome</label><input className="w-full border rounded-lg px-3 py-2" value={form.name??''} onChange={e=>setForm(f=>({...f, name:e.target.value}))}/></div>
      <div><label className="text-sm text-gray-600">Numero</label><input className="w-full border rounded-lg px-3 py-2" value={form.number??''} onChange={e=>setForm(f=>({...f, number:e.target.value as any}))}/></div>
      <div><label className="text-sm text-gray-600">Ruolo</label><select className="w-full border rounded-lg px-3 py-2" value={form.position} onChange={e=>setForm(f=>({...f, position:e.target.value as any}))}><option>Portiere</option><option>Terzino Destro</option><option>Difensore Centrale</option><option>Terzino Sinistro</option><option>Centrocampista Centrale</option><option>Ala</option><option>Attaccante</option></select></div>
      <div><label className="text-sm text-gray-600">Anno</label><input className="w-full border rounded-lg px-3 py-2" value={form.birthYear??2007} onChange={e=>setForm(f=>({...f, birthYear:Number(e.target.value)}))}/></div>
      <div className="sm:col-span-4"><button className="btn btn-primary" onClick={addPlayer}>Conferma</button></div>
    </div>)}
    <div className="card overflow-auto"><table className="table w-full min-w-[700px]"><thead><tr className="text-left text-sm text-gray-500"><th>N°</th><th>Nome</th><th>Ruolo</th><th>Anno</th><th>Gol</th><th>Assist</th><th>Presenze</th><th>Azioni</th></tr></thead><tbody>
      {[...players].sort((a,b)=>a.number-b.number).map(p=>(
        <tr key={p.id} className="border-t"><td>{p.number}</td><td className="font-medium">{p.name}</td><td>{p.position}</td><td><span className={`badge ${p.birthYear<=2006 ? 'bg-orange-100 text-orange-700':'bg-blue-100 text-blue-700'}`}>{p.birthYear}</span></td><td>{p.goals}</td><td>{p.assists}</td><td>{p.presences}</td><td><button className="text-red-600 hover:text-red-800" onClick={()=>deletePlayer(p.id)} title="Elimina"><Trash2 size={18}/></button></td></tr>
      ))}
    </tbody></table></div>
  </section>);
}

function TrainingsTab({ players, trainings, selectedWeek, setSelectedWeek, toggleAttendance, addNewWeek, getPlayerWeekStats }:{ players:Player[]; trainings:TrainingWeek[]; selectedWeek:number; setSelectedWeek: (n:number)=>void; toggleAttendance:(playerId:number, sessionIndex:number)=>void; addNewWeek:()=>void; getPlayerWeekStats:(playerId:number)=>{present:number; total:number; percentage:number} }) {
  const week = trainings.find(w=>w.id===selectedWeek);
  return (<section className="space-y-4">
    <div className="flex items-center gap-3"><h2 className="text-lg font-semibold">Presenze Allenamenti</h2><button className="btn btn-primary" onClick={addNewWeek}>Nuova Settimana</button><div className="ml-auto flex items-center gap-2"><span className="text-sm text-gray-600">Seleziona Settimana</span><select className="px-3 py-2 border rounded-lg" value={selectedWeek} onChange={e=>setSelectedWeek(Number(e.target.value))}>{trainings.map(t=>(<option key={t.id} value={t.id}>{t.week}</option>))}</select></div></div>
    {week && week.sessions.map((s, idx)=>(<div key={idx} className="card"><h3 className="font-semibold mb-1">{s.day}</h3><div className="text-sm text-gray-600 mb-3">{itDate(s.date, { day:'numeric', month:'long', year:'numeric' })}</div><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">{players.map(pl=>{ const present = s.attendance[pl.id] === true; return (<button key={pl.id} onClick={()=>toggleAttendance(pl.id, idx)} className={`p-3 rounded-lg border-2 text-left transition ${present ? 'bg-green-50 border-green-400 hover:bg-green-100':'bg-gray-50 border-gray-300 hover:bg-gray-100'}`}><div className="flex items-center gap-2">{present ? <CheckCircle className="text-green-600"/> : <XCircle className="text-gray-400"/>}<span className="text-sm text-gray-500">N° {pl.number}</span></div><div className="font-medium">{pl.name}</div></button>); })}</div><div className="mt-3 flex items-center gap-4 text-sm"><div><b>{Object.values(s.attendance).filter(a=>a===true).length}</b> Presenti</div><div><b>{players.length - Object.values(s.attendance).filter(a=>a===true).length}</b> Assenti</div><div><b>{Math.round((Object.values(s.attendance).filter(a=>a===true).length / players.length) * 100) || 0}%</b> Percentuale</div></div></div>))}
    <div className="card"><h3 className="font-semibold mb-2">📈 Statistiche Settimana</h3><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">{players.map(pl=>{ const st = getPlayerWeekStats(pl.id); return (<div key={pl.id} className="bg-gray-50 rounded p-3"><div className="font-medium">{pl.name} <span className="text-xs text-gray-500">N° {pl.number}</span></div><div className="text-sm text-gray-600">{st.present}/{st.total} — {st.percentage}%</div></div>); })}</div></div>
  </section>);
}

function CallUpTab({ players, callUpData, setCallUpData, togglePlayerCallUp, sendWhatsApp, getPlayerWeekStats }:{ players:Player[]; callUpData:CallUpData; setCallUpData:React.Dispatch<React.SetStateAction<CallUpData>>; togglePlayerCallUp:(id:number)=>void; sendWhatsApp:()=>void; getPlayerWeekStats:(playerId:number)=>{present:number; total:number; percentage:number} }) {
  const oldPlayers = callUpData.selectedPlayers.map(id=>players.find(p=>p.id===id)!).filter(p=>p && (p.birthYear===2005 || p.birthYear===2006));
  return (<section className="space-y-4">
    <div className="card grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <div><label className="text-sm text-gray-600">Avversario</label><input className="w-full px-3 py-2 border rounded-lg" value={callUpData.opponent} onChange={e=>setCallUpData(v=>({...v, opponent:e.target.value}))}/></div>
      <div><label className="text-sm text-gray-600">Data Partita</label><input type="date" className="w-full px-3 py-2 border rounded-lg" value={callUpData.date} onChange={e=>setCallUpData(v=>({...v, date:e.target.value}))}/></div>
      <div><label className="text-sm text-gray-600">Orario Ritrovo</label><input type="time" className="w-full px-3 py-2 border rounded-lg" value={callUpData.meetingTime} onChange={e=>setCallUpData(v=>({...v, meetingTime:e.target.value}))}/></div>
      <div><label className="text-sm text-gray-600">Calcio d'Inizio</label><input type="time" className="w-full px-3 py-2 border rounded-lg" value={callUpData.kickoffTime} onChange={e=>setCallUpData(v=>({...v, kickoffTime:e.target.value}))}/></div>
      <div className="lg:col-span-2"><label className="text-sm text-gray-600">Indirizzo Campo</label><input className="w-full px-3 py-2 border rounded-lg" value={callUpData.location} onChange={e=>setCallUpData(v=>({...v, location:e.target.value}))}/></div>
      <div className="flex items-center gap-3"><span className="badge bg-blue-100 text-blue-700">{callUpData.selectedPlayers.length}/20 Selezionati</span><span className="badge bg-orange-100 text-orange-700">{oldPlayers.length}/4 2005-2006</span></div>
      <div className="lg:col-span-3"><button className="btn btn-primary" onClick={sendWhatsApp}><Send size={18}/>Invia su WhatsApp</button></div>
    </div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">{players.map(p=>{ const isSel = callUpData.selectedPlayers.includes(p.id); const st = getPlayerWeekStats(p.id); return (<button key={p.id} onClick={()=>togglePlayerCallUp(p.id)} className={`p-4 rounded-lg border-2 text-left transition ${isSel ? 'bg-blue-50 border-blue-500':'bg-gray-50 border-gray-300 hover:bg-gray-100'}`}><div className="flex items-center justify-between"><span className="text-sm text-gray-500">N° {p.number}</span><span className={`badge ${p.birthYear<=2006 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>{p.birthYear}</span></div><div className="font-semibold">{p.name}</div><div className="text-sm text-gray-600">{p.position}</div><div className="text-xs text-gray-500 mt-1">Presenze settimana: {st.present}/{st.total} ({st.percentage}%)</div>{isSel && <div className="mt-2 text-blue-600 text-sm font-medium">Selezionato</div>}</button>); })}</div>
  </section>);
}

function MatchesTab({matches, onOpen}:{matches:Match[]; onOpen:(id:number)=>void}) {
  return (<section className="space-y-3">
    <h2 className="text-lg font-semibold">Partite</h2>
    <div className="grid sm:grid-cols-2 gap-3">
      <div className="card"><h3 className="font-semibold mb-2">Ultima Partita</h3><div className="flex justify-center"><iframe src="https://www.tuttocampo.it/WidgetV2/Partita/e888709c-f06f-4678-9178-40c209ac19ef" width="500" height="350" scrolling="no" loading="lazy" frameBorder="0" style={{border:0, width:'100%', maxWidth:500}}/></div></div>
      <div className="card"><h3 className="font-semibold mb-2">Prossima Partita</h3><div className="flex justify-center"><iframe src="https://www.tuttocampo.it/WidgetV2/ProssimaPartita/e888709c-f06f-4678-9178-40c209ac19ef" width="500" height="350" scrolling="no" loading="lazy" frameBorder="0" style={{border:0, width:'100%', maxWidth:500}}/></div></div>
    </div>
    <h2 className="text-lg font-semibold mt-2">Calendario Partite</h2>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{matches.map(m=>(
      <div key={m.id} className="card">
        <div className="text-xs text-gray-500">Giornata {m.round} • {itDate(m.date)} • {m.time}</div>
        <h3 className="font-semibold mt-1">{m.home} vs {m.away}</h3>
        <div className="mt-1 text-sm text-gray-600">{m.address} — {m.city}</div>
        <div className="mt-2 flex items-center justify-between"><div>{m.result ? <span className="text-green-700 font-semibold">{m.result}</span> : <span className="text-gray-500">Da giocare</span>}</div><button className="btn btn-primary" onClick={()=>onOpen(m.id)}><Pencil size={16}/> Dettagli</button></div>
      </div>
    ))}</div>
  </section>);
}

function MatchDetailModal({match, players, onClose, onSave}:{match:Match; players:Player[]; onClose:()=>void; onSave:(updater:(m:Match)=>Match)=>void}) {
  const [local, setLocal] = useState<Match>({...match});
  const addGoal = (side:TeamSide) => { setLocal(m=>({ ...m, events: [...m.events, { id: crypto.randomUUID?.() || String(Date.now()), type:'GOAL', minute: 0, team: side } as GoalEvent] })); };
  const addCard = (kind:'YELLOW'|'RED', side:TeamSide) => { setLocal(m=>({ ...m, events: [...m.events, { id: crypto.randomUUID?.() || String(Date.now()), type: kind, minute: 0, team: side } as CardEvent] })); };
  const addSub = () => { const a = players[0]?.id ?? 1, b = players[1]?.id ?? 2; setLocal(m=>({ ...m, events: [...m.events, { id: crypto.randomUUID?.() || String(Date.now()), type:'SUB', minute: 0, team:'SEGURO', outId: a, inId: b } as SubEvent] })); };
  const updateEvent = (id:string, patch: Partial<MatchEvent>) => { setLocal(m=>({ ...m, events: m.events.map(ev=> ev.id===id ? ({...ev, ...patch} as MatchEvent) : ev) })); };
  const removeEvent = (id:string) => setLocal(m=>({ ...m, events: m.events.filter(ev=>ev.id!==id) }));
  const save = () => { onSave(()=>local); onClose(); };

  return (<div className="fixed inset-0 z-20 bg-black/50 flex items-end sm:items-center justify-center p-2">
    <div className="bg-white w-full max-w-3xl rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-lg">
      <div className="px-4 py-3 border-b flex items-center gap-2"><FlagTriangleRight className="text-blue-600"/><div className="font-semibold">Giornata {local.round} — {local.home} vs {local.away}</div><button className="ml-auto text-gray-500 hover:text-gray-800" onClick={onClose}>✕</button></div>
      <div className="p-4 space-y-4 max-h-[80vh] overflow-auto">
        <div className="grid sm:grid-cols-3 gap-3">
          <div><label className="text-sm text-gray-600">Data</label><input type="date" className="w-full border rounded-lg px-3 py-2" value={local.date} onChange={e=>setLocal(v=>({...v, date:e.target.value}))}/></div>
          <div><label className="text-sm text-gray-600">Ora</label><input type="time" className="w-full border rounded-lg px-3 py-2" value={local.time} onChange={e=>setLocal(v=>({...v, time:e.target.value}))}/></div>
          <div><label className="text-sm text-gray-600">Risultato</label><input placeholder="es. 1-1" className="w-full border rounded-lg px-3 py-2" value={local.result ?? ''} onChange={e=>setLocal(v=>({...v, result: e.target.value || undefined}))}/></div>
          <div className="sm:col-span-3"><label className="text-sm text-gray-600">Campo</label><input className="w-full border rounded-lg px-3 py-2" value={local.address} onChange={e=>setLocal(v=>({...v, address:e.target.value}))}/><input className="w-full border rounded-lg px-3 py-2 mt-2" value={local.city} onChange={e=>setLocal(v=>({...v, city:e.target.value}))}/></div>
        </div>
        <div className="flex items-center gap-2"><button className="btn btn-primary" onClick={()=>addGoal('SEGURO')}><Plus size={16}/> Goal Seguro</button><button className="btn btn-primary" onClick={()=>addGoal('AVVERSARI')}><Plus size={16}/> Goal Avversari</button><button className="btn btn-primary" onClick={()=>addCard('YELLOW','SEGURO')}><Plus size={16}/> Ammonizione Seguro</button><button className="btn btn-primary" onClick={()=>addCard('YELLOW','AVVERSARI')}><Plus size={16}/> Ammonizione Avv.</button><button className="btn btn-primary" onClick={()=>addCard('RED','SEGURO')}><Plus size={16}/> Espulsione Seguro</button><button className="btn btn-primary" onClick={()=>addCard('RED','AVVERSARI')}><Plus size={16}/> Espulsione Avv.</button><button className="btn btn-primary" onClick={addSub}><Plus size={16}/> Sostituzione</button></div>
        <div className="card"><h3 className="font-semibold mb-2">Eventi</h3>{local.events.length===0 && <div className="text-sm text-gray-600">Nessun evento aggiunto.</div>}<div className="space-y-2">{local.events.map(ev=>(<div key={ev.id} className="border rounded-lg p-3"><div className="flex items-center gap-2 text-sm mb-2"><span className={`badge ${ev.type==='GOAL'?'bg-green-100 text-green-700': ev.type==='SUB'?'bg-blue-100 text-blue-700': ev.type==='YELLOW'?'bg-yellow-100 text-yellow-800':'bg-red-100 text-red-700'}`}>{labelForEvent(ev)}</span><span className="text-gray-500">{ev.team}</span></div><EventEditor ev={ev} players={players} onChange={(patch)=>updateEvent(ev.id, patch)} onRemove={()=>removeEvent(ev.id)}/></div>))}</div></div>
      </div>
      <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-end gap-2"><button className="btn btn-ghost" onClick={onClose}>Annulla</button><button className="btn btn-primary" onClick={save}>Salva</button></div>
    </div>
  </div>);
}

function labelForEvent(ev: MatchEvent){ switch(ev.type){ case 'GOAL': return 'Goal'; case 'YELLOW': return 'Ammonizione'; case 'RED': return 'Espulsione'; case 'SUB': return 'Sostituzione'; } }

function EventEditor({ev, players, onChange, onRemove}:{ev:MatchEvent; players:Player[]; onChange:(patch:Partial<MatchEvent>)=>void; onRemove:()=>void}){
  return (<div className="grid sm:grid-cols-4 gap-2 items-end">
    <div><label className="text-sm text-gray-600">Min.</label><input type="number" min={0} max={130} className="w-full border rounded-lg px-3 py-2" value={(ev as any).minute ?? 0} onChange={e=>onChange({ minute: Number(e.target.value) } as any)}/></div>
    {ev.type==='GOAL' && (<><div><label className="text-sm text-gray-600">Squadra</label><select className="w-full border rounded-lg px-3 py-2" value={ev.team} onChange={e=>onChange({ team: e.target.value as any })}><option value="SEGURO">SEGURO</option><option value="AVVERSARI">AVVERSARI</option></select></div><div><label className="text-sm text-gray-600">Giocatore (facolt.)</label><select className="w-full border rounded-lg px-3 py-2" value={(ev as any).playerId ?? ''} onChange={e=>onChange({ playerId: e.target.value? Number(e.target.value): undefined } as any)}><option value="">—</option>{players.map(p=> <option key={p.id} value={p.id}>{p.number} — {p.name}</option>)}</select></div><div><label className="text-sm text-gray-600">Note</label><input className="w-full border rounded-lg px-3 py-2" value={(ev as any).note ?? ''} onChange={e=>onChange({ note: e.target.value } as any)}/></div></>)}
    {(ev.type==='YELLOW' || ev.type==='RED') && (<><div><label className="text-sm text-gray-600">Squadra</label><select className="w-full border rounded-lg px-3 py-2" value={ev.team} onChange={e=>onChange({ team: e.target.value as any })}><option value="SEGURO">SEGURO</option><option value="AVVERSARI">AVVERSARI</option></select></div><div><label className="text-sm text-gray-600">Giocatore (facolt.)</label><select className="w-full border rounded-lg px-3 py-2" value={(ev as any).playerId ?? ''} onChange={e=>onChange({ playerId: e.target.value? Number(e.target.value): undefined } as any)}><option value="">—</option>{players.map(p=> <option key={p.id} value={p.id}>{p.number} — {p.name}</option>)}</select></div><div><label className="text-sm text-gray-600">Note</label><input className="w-full border rounded-lg px-3 py-2" value={(ev as any).note ?? ''} onChange={e=>onChange({ note: e.target.value } as any)}/></div></>)}
    {ev.type==='SUB' && (<><div><label className="text-sm text-gray-600">Esce</label><select className="w-full border rounded-lg px-3 py-2" value={(ev as any).outId} onChange={e=>onChange({ outId: Number(e.target.value) } as any)}>{players.map(p=> <option key={p.id} value={p.id}>{p.number} — {p.name}</option>)}</select></div><div><label className="text-sm text-gray-600">Entra</label><select className="w-full border rounded-lg px-3 py-2" value={(ev as any).inId} onChange={e=>onChange({ inId: Number(e.target.value) } as any)}>{players.map(p=> <option key={p.id} value={p.id}>{p.number} — {p.name}</option>)}</select></div><div><label className="text-sm text-gray-600">Note</label><input className="w-full border rounded-lg px-3 py-2" value={(ev as any).note ?? ''} onChange={e=>onChange({ note: e.target.value } as any)}/></div></>)}
    <div className="sm:col-span-4 flex justify-end"><button className="text-red-600 hover:text-red-800 inline-flex items-center gap-1" onClick={onRemove}><Trash size={16}/> Rimuovi</button></div>
  </div>);
}
