export type PidatoStructure = {
  pembukaan: string[];
  isi: string[];
  penutup: string[];
  hasPembukaan: boolean;
  hasIsi: boolean;
  hasPenutup: boolean;
};

export type HistoryEntry = {
  id: string;
  createdAt: number;
  transcript: string;
  isCorrect: boolean;
  errors: Array<{ wrong: string; correct: string }>;
  mode: 'kalimat' | 'pidato';
  structure?: PidatoStructure;
};

const KEY = 'sibebas:history';
const MAX = 50;

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveHistoryEntry(entry: Omit<HistoryEntry, 'id' | 'createdAt'>) {
  const all = loadHistory();
  const next: HistoryEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };
  const updated = [next, ...all].slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save history', e);
  }
  return next;
}

export function deleteHistoryEntry(id: string) {
  const all = loadHistory().filter((e) => e.id !== id);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function clearHistory() {
  localStorage.removeItem(KEY);
}

const PEMBUKAAN_KEYWORDS = [
  'assalamualaikum',
  "assalamu'alaikum",
  'assalamualaikum warahmatullahi',
  'selamat pagi',
  'selamat siang',
  'selamat sore',
  'selamat malam',
  'yang saya hormati',
  'yang terhormat',
  'yang saya banggakan',
  'puji syukur',
  'puji dan syukur',
  'salam sejahtera',
  'bapak ibu guru',
  'teman teman',
  'hadirin',
];

const PENUTUP_KEYWORDS = [
  'demikian',
  'sekian',
  'wassalamualaikum',
  "wassalamu'alaikum",
  'wassalam',
  'terima kasih atas perhatian',
  'mohon maaf',
  'cukup sekian',
  'akhir kata',
  'demikianlah',
  'pidato yang dapat saya sampaikan',
];

export function detectPidatoStructure(text: string): PidatoStructure {
  const sentences = text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const pembukaan: string[] = [];
  const isi: string[] = [];
  const penutup: string[] = [];

  let phase: 'pembukaan' | 'isi' | 'penutup' = 'pembukaan';
  let sawIsi = false;

  for (const s of sentences) {
    const low = s.toLowerCase();
    const isPembukaan = PEMBUKAAN_KEYWORDS.some((k) => low.includes(k));
    const isPenutup = PENUTUP_KEYWORDS.some((k) => low.includes(k));

    if (isPenutup) {
      phase = 'penutup';
      penutup.push(s);
      continue;
    }

    if (phase === 'pembukaan') {
      if (isPembukaan && !sawIsi) {
        pembukaan.push(s);
      } else {
        phase = 'isi';
        sawIsi = true;
        isi.push(s);
      }
      continue;
    }

    if (phase === 'isi') {
      isi.push(s);
      sawIsi = true;
    } else {
      penutup.push(s);
    }
  }

  return {
    pembukaan,
    isi,
    penutup,
    hasPembukaan: pembukaan.length > 0,
    hasIsi: isi.length > 0,
    hasPenutup: penutup.length > 0,
  };
}
