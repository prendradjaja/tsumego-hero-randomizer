import * as raw from "./the-rules-of-capturing-races.raw";

export const all = [
  ...raw.type1,
  ...raw.type2,
  ...raw.type3Plus,
];

export const upToType2 = [
  ...raw.type1,
  ...raw.type2,
];

export const first140 = all.slice(0, 140);

