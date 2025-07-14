export const SHORT_CACHE_CONTROL = "max-age=50";
export const DEFAULT_CACHE_CONTROL = "max-age=300"; // 5 minutes
export const LONG_CACHE_CONTROL = "max-age=172800"; // 48 hours
export const DEFAULT_API_HEADERS = { "cache-control": DEFAULT_CACHE_CONTROL };
export const LONG_CACHE_CONTROL_API_HEADERS = { "cache-control": LONG_CACHE_CONTROL };

export const MIN_DATE = "2020-05-10";
export const MAX_CHART_TREND_DAYS = 180; // TODO...
export const MAX_CHART_PLAYERS = 30;

export const SCORE_CATEGORIES: Array<"top50" | "top25" | "top8" | "top1"> = [
  "top50",
  "top25",
  "top8",
  "top1"
];

export const CATEGORY_COLORS = {
  top50: "#E57373",
  top25: "#7986CB",
  top8: "#4DB6AC",
  top1: "#DCE775"
};

export const CHART_COLORS = [
  "#B39DDB",
  "#CE93D8",
  "#F48FB1",
  "#EF9A9A",
  "#FFAB91",
  "#FFCC80",
  "#FFE082",
  "#FFF59D",
  "#E6EE9C",
  "#C5E1A5"
];
export const CHART_RANK_COLORS = [
  "#D3548D",
  "#C51162",
  "#AA00FF",
  "#6200EA",
  "#2962FF",
  "#00B8D4",
  "#00BFA5",
  "#64DD17",
  "#FFD600",
  "#FF6D00"
];

export const RANKING_BADGES: { [id: string]: { img: string; title?: string } } = {
  "5795337": { img: "/badges/pogu.png", title: "poggers" },
  "1023489": { img: "/badges/unhappi.png", title: "gay" },
  "6502403": { img: "/badges/bowing.svg" },
  "11495715": { img: "/badges/doggo.svg" }
};

export const COUNTRIES: { [countryCode: string]: string } = {
  AE: "United Arab Emirates",
  AR: "Argentina",
  AT: "Austria",
  AU: "Australia",
  BE: "Belgium",
  BG: "Bulgaria",
  BR: "Brazil",
  BY: "Belarus",
  CA: "Canada",
  CH: "Switzerland",
  CL: "Chile",
  CN: "China",
  CO: "Colombia",
  CR: "Costa Rica",
  CZ: "Czechia",
  DE: "Germany",
  DK: "Denmark",
  DO: "Dominican Republic",
  EC: "Ecuador",
  EE: "Estonia",
  ES: "Spain",
  FI: "Finland",
  FR: "France",
  GB: "United Kingdom",
  GR: "Greece",
  HK: "Hong Kong",
  HR: "Croatia",
  HU: "Hungary",
  ID: "Indonesia",
  IE: "Ireland",
  IL: "Israel",
  IN: "India",
  IT: "Italy",
  JE: "Jersey",
  JP: "Japan",
  KR: "Korea ",
  KZ: "Kazakhstan",
  LT: "Lithuania",
  LU: "Luxembourg",
  LV: "Latvia",
  MA: "Morocco",
  MN: "Mongolia",
  MO: "Macao",
  MX: "Mexico",
  MY: "Malaysia",
  NI: "Nicaragua",
  NL: "Netherlands",
  NO: "Norway",
  NZ: "New Zealand",
  PA: "Panama",
  PE: "Peru",
  PH: "Philippines",
  PL: "Poland",
  PR: "Puerto Rico",
  PT: "Portugal",
  QA: "Qatar",
  RE: "Reunion",
  RO: "Romania",
  RS: "Serbia",
  RU: "Russian Federation",
  SA: "Saudi Arabia",
  SE: "Sweden",
  SG: "Singapore",
  SI: "Slovenia",
  SK: "Slovakia",
  SM: "San Marino",
  TH: "Thailand",
  TR: "Turkey",
  TT: "Trinidad and Tobago",
  TW: "Taiwan",
  UA: "Ukraine",
  US: "United States",
  UY: "Uruguay",
  VE: "Venezuela",
  VN: "Vietnam",
  ZA: "South Africa"
};
