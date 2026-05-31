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

/** Paleta mate: tonos apagados, sin saturación fuerte */
export const NOTEBOOK_PALETTE: Record<NotebookColorKey, NotebookColorTheme> = {
  blue: {
    key: "blue",
    label: "Azul",
    gradient: "from-[#dfe4eb] via-[#d5dce5] to-[#cbd4df]",
    border: "border-[#c5ced8]/80",
    ring: "ring-[#8a9aad]/40",
    dot: "bg-[#7a8fa8]",
    iconBg: "bg-[#f6f5f2]/90 text-[#6d7b8a]",
    accent: "text-[#6d7b8a]",
    glow: "shadow-[0_6px_20px_rgba(109,123,138,0.08)]",
  },
  amber: {
    key: "amber",
    label: "Ámbar",
    gradient: "from-[#ebe5d8] via-[#e3dbc9] to-[#d9d0bc]",
    border: "border-[#d4cbb8]/80",
    ring: "ring-[#b8a88a]/40",
    dot: "bg-[#a89578]",
    iconBg: "bg-[#f6f5f2]/90 text-[#8a7a62]",
    accent: "text-[#8a7a62]",
    glow: "shadow-[0_6px_20px_rgba(168,149,120,0.08)]",
  },
  emerald: {
    key: "emerald",
    label: "Esmeralda",
    gradient: "from-[#dfe8e1] via-[#d5e0d8] to-[#cad8cf]",
    border: "border-[#c0d0c4]/80",
    ring: "ring-[#8aa894]/40",
    dot: "bg-[#6d8578]",
    iconBg: "bg-[#f6f5f2]/90 text-[#6d8578]",
    accent: "text-[#6d8578]",
    glow: "shadow-[0_6px_20px_rgba(109,133,120,0.08)]",
  },
  violet: {
    key: "violet",
    label: "Violeta",
    gradient: "from-[#e6e2eb] via-[#dcd6e4] to-[#d2cad9]",
    border: "border-[#c8c0d0]/80",
    ring: "ring-[#9d92a8]/40",
    dot: "bg-[#857a92]",
    iconBg: "bg-[#f6f5f2]/90 text-[#857a92]",
    accent: "text-[#857a92]",
    glow: "shadow-[0_6px_20px_rgba(133,122,146,0.08)]",
  },
  rose: {
    key: "rose",
    label: "Rosa",
    gradient: "from-[#ebe0de] via-[#e2d5d2] to-[#d8c8c4]",
    border: "border-[#d0beba]/80",
    ring: "ring-[#b0908c]/40",
    dot: "bg-[#a88682]",
    iconBg: "bg-[#f6f5f2]/90 text-[#9a7874]",
    accent: "text-[#9a7874]",
    glow: "shadow-[0_6px_20px_rgba(168,134,130,0.08)]",
  },
  slate: {
    key: "slate",
    label: "Gris",
    gradient: "from-[#e8e7e4] via-[#dfdeda] to-[#d5d4d0]",
    border: "border-[#cbc9c4]/80",
    ring: "ring-[#9a9892]/40",
    dot: "bg-[#8a8882]",
    iconBg: "bg-[#f6f5f2]/90 text-[#6f6d68]",
    accent: "text-[#6f6d68]",
    glow: "shadow-[0_6px_20px_rgba(138,136,130,0.07)]",
  },
  teal: {
    key: "teal",
    label: "Turquesa",
    gradient: "from-[#dce8e6] via-[#d0e0dd] to-[#c4d8d4]",
    border: "border-[#b8d0cb]/80",
    ring: "ring-[#88a8a0]/40",
    dot: "bg-[#6d9490]",
    iconBg: "bg-[#f6f5f2]/90 text-[#6d9490]",
    accent: "text-[#6d9490]",
    glow: "shadow-[0_6px_20px_rgba(109,148,144,0.08)]",
  },
  coral: {
    key: "coral",
    label: "Coral",
    gradient: "from-[#ebe3dc] via-[#e2d8ce] to-[#d9cdc0]",
    border: "border-[#d4c8b8]/80",
    ring: "ring-[#b8a090]/40",
    dot: "bg-[#b0957e]",
    iconBg: "bg-[#f6f5f2]/90 text-[#9a8070]",
    accent: "text-[#9a8070]",
    glow: "shadow-[0_6px_20px_rgba(176,149,126,0.08)]",
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
