export type NotebookColorKey =
  | "blue"
  | "amber"
  | "emerald"
  | "violet"
  | "rose"
  | "slate"
  | "teal"
  | "coral";

export type NotebookColorTheme = {
  key: NotebookColorKey;
  label: string;
  gradient: string;
  border: string;
  ring: string;
  dot: string;
  iconBg: string;
  accent: string;
  glow: string;
};

export const NOTEBOOK_PALETTE: Record<NotebookColorKey, NotebookColorTheme> = {
  blue: {
    key: "blue",
    label: "Azul",
    gradient: "from-[#e8f0fe] via-[#dce8fc] to-[#c8daf8]",
    border: "border-blue-200/60",
    ring: "ring-blue-400/50",
    dot: "bg-[#4285f4]",
    iconBg: "bg-white/85 text-[#1a73e8] shadow-sm",
    accent: "text-[#1a73e8]",
    glow: "shadow-[0_8px_30px_rgba(66,133,244,0.12)]",
  },
  amber: {
    key: "amber",
    label: "Ámbar",
    gradient: "from-[#fef7e0] via-[#fdecc8] to-[#f9dfb0]",
    border: "border-amber-200/60",
    ring: "ring-amber-400/50",
    dot: "bg-[#f9ab00]",
    iconBg: "bg-white/85 text-[#e37400] shadow-sm",
    accent: "text-[#e37400]",
    glow: "shadow-[0_8px_30px_rgba(249,171,0,0.12)]",
  },
  emerald: {
    key: "emerald",
    label: "Esmeralda",
    gradient: "from-[#e6f4ea] via-[#d7eedd] to-[#c6e7cf]",
    border: "border-emerald-200/60",
    ring: "ring-emerald-400/50",
    dot: "bg-[#34a853]",
    iconBg: "bg-white/85 text-[#137333] shadow-sm",
    accent: "text-[#137333]",
    glow: "shadow-[0_8px_30px_rgba(52,168,83,0.12)]",
  },
  violet: {
    key: "violet",
    label: "Violeta",
    gradient: "from-[#f3e8fd] via-[#ead6fa] to-[#dfc4f7]",
    border: "border-violet-200/60",
    ring: "ring-violet-400/50",
    dot: "bg-[#9334e6]",
    iconBg: "bg-white/85 text-[#7b1fa2] shadow-sm",
    accent: "text-[#7b1fa2]",
    glow: "shadow-[0_8px_30px_rgba(147,52,230,0.12)]",
  },
  rose: {
    key: "rose",
    label: "Rosa",
    gradient: "from-[#fce8e6] via-[#f9d9d5] to-[#f5c8c3]",
    border: "border-rose-200/60",
    ring: "ring-rose-400/50",
    dot: "bg-[#ea4335]",
    iconBg: "bg-white/85 text-[#c5221f] shadow-sm",
    accent: "text-[#c5221f]",
    glow: "shadow-[0_8px_30px_rgba(234,67,53,0.12)]",
  },
  slate: {
    key: "slate",
    label: "Gris",
    gradient: "from-[#f1f3f4] via-[#e8eaed] to-[#dadce0]",
    border: "border-slate-200/70",
    ring: "ring-slate-400/50",
    dot: "bg-[#5f6368]",
    iconBg: "bg-white/85 text-[#3c4043] shadow-sm",
    accent: "text-[#3c4043]",
    glow: "shadow-[0_8px_30px_rgba(95,99,104,0.1)]",
  },
  teal: {
    key: "teal",
    label: "Turquesa",
    gradient: "from-[#e0f2f1] via-[#ccecea] to-[#b2dfdb]",
    border: "border-teal-200/60",
    ring: "ring-teal-400/50",
    dot: "bg-[#00897b]",
    iconBg: "bg-white/85 text-[#00695c] shadow-sm",
    accent: "text-[#00695c]",
    glow: "shadow-[0_8px_30px_rgba(0,137,123,0.12)]",
  },
  coral: {
    key: "coral",
    label: "Coral",
    gradient: "from-[#fff0e8] via-[#ffe0cf] to-[#ffd0b5]",
    border: "border-orange-200/60",
    ring: "ring-orange-400/50",
    dot: "bg-[#ff6d01]",
    iconBg: "bg-white/85 text-[#e65100] shadow-sm",
    accent: "text-[#e65100]",
    glow: "shadow-[0_8px_30px_rgba(255,109,1,0.12)]",
  },
};

export const NOTEBOOK_COLOR_KEYS = Object.keys(
  NOTEBOOK_PALETTE
) as NotebookColorKey[];

export function getNotebookTheme(color?: string | null): NotebookColorTheme {
  const key = (color ?? "blue") as NotebookColorKey;
  return NOTEBOOK_PALETTE[key] ?? NOTEBOOK_PALETTE.blue;
}

export function defaultColorForId(id: string): NotebookColorKey {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash += id.charCodeAt(i);
  return NOTEBOOK_COLOR_KEYS[hash % NOTEBOOK_COLOR_KEYS.length];
}
