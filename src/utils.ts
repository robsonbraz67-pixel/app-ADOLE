export const AVTS = ['🦁', '🦊', '🐼', '🐯', '🐵', '🐨', '🐸', '🐙', '🦋', '🌻', '⭐', '🔥'];

export const PROG0 = {
  xp: 0,
  streak: 0,
  done: [] as number[],
  history: {} as Record<string, any>,
};

export function gs<T>(key: string, fallback: T): T;
export function gs(key: string): any;
export function gs<T>(key: string, fallback?: T): T | any {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export const ss = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures caused by private mode or full quota.
  }
};

export const uid = () =>
  (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`);

export const calcPos = (ranking: any[] = [], userId?: string, xp = 0) => {
  const normalized = [...ranking];
  const idx = normalized.findIndex((item) => item.id === userId);

  if (idx >= 0) {
    normalized[idx] = { ...normalized[idx], xp };
  } else if (userId) {
    normalized.push({ id: userId, xp });
  }

  normalized.sort((a, b) => (b.xp || 0) - (a.xp || 0));
  const pos = normalized.findIndex((item) => item.id === userId);
  return pos >= 0 ? pos + 1 : normalized.length + 1;
};

export const rankDemo = () => [
  { id: 'demo-ana', nome: 'Ana Clara', avatar: '🌻', xp: 620, dias: 5 },
  { id: 'demo-gabi', nome: 'Gabriel', avatar: '🦁', xp: 540, dias: 4 },
  { id: 'demo-lu', nome: 'Luiza', avatar: '⭐', xp: 455, dias: 4 },
  { id: 'demo-matheus', nome: 'Matheus', avatar: '🔥', xp: 380, dias: 3 },
];

export const getDiaId = (dias: any[] = []) => {
  const today = new Date().toISOString().slice(0, 10);
  const byDate = dias.find((dia) => dia.data === today);
  if (byDate) return byDate.id;

  const past = dias
    .filter((dia) => dia.data && dia.data <= today)
    .sort((a, b) => String(b.data).localeCompare(String(a.data)));

  return (past[0] || dias[0])?.id;
};

export const getRecencyMult = (date?: string) => {
  if (!date) return 1;

  const target = new Date(`${date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((today.getTime() - target.getTime()) / 86400000);
  if (diffDays <= 0) return 1.25;
  if (diffDays <= 2) return 1;
  if (diffDays <= 6) return 0.75;
  return 0.5;
};

export const xpSpeed = (elapsedSeconds: number, correct: boolean, date?: string) => {
  if (!correct) return 0;

  const speedBonus = Math.max(0, Math.round((40 - elapsedSeconds) * 1.5));
  return Math.round((60 + speedBonus) * getRecencyMult(date));
};

export const getMsgRes = (acertos: number, total: number) => {
  const pct = total ? acertos / total : 0;
  if (pct === 1) return { ic: '🏆', mg: 'Perfeito!' };
  if (pct >= 0.75) return { ic: '⭐', mg: 'Muito bem!' };
  if (pct >= 0.5) return { ic: '📖', mg: 'Continue estudando!' };
  return { ic: '💪', mg: 'Tente novamente amanhã!' };
};

export const formatDiaSemana = (dia: string) => {
  const nomes: Record<string, string> = {
    Sab: 'Sábado',
    'Sáb': 'Sábado',
    Dom: 'Domingo',
    Seg: 'Segunda',
    Ter: 'Terça',
    Qua: 'Quarta',
    Qui: 'Quinta',
    Sex: 'Sexta',
  };

  return nomes[dia] || dia;
};

export const shareApp = async () => {
  const data = {
    title: 'SabatinaQuest',
    text: 'Estude a lição e acompanhe seu progresso no SabatinaQuest.',
    url: window.location.href,
  };

  if (navigator.share) {
    await navigator.share(data);
    return;
  }

  await navigator.clipboard?.writeText(data.url);
  alert('Link copiado!');
};

export const playSound = (type: 'correct' | 'wrong' | 'ranking' | string) => {
  try {
    const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextCtor) return;

    const ctx = new AudioContextCtor();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const freqs: Record<string, number> = { correct: 880, wrong: 220, ranking: 660 };

    osc.frequency.value = freqs[type] || 440;
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch {
    // Audio feedback is optional.
  }
};

export const scheduleStudyReminder = async (name: string, title: string) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const registration = await navigator.serviceWorker?.ready?.catch(() => null);
  const body = `${name}, continue seu estudo: ${title}`;

  if (registration) {
    await registration.showNotification('SabatinaQuest', { body, icon: '/icon-192.png' });
  }
};
