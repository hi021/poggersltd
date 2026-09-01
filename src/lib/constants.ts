export const SHORT_CACHE_CONTROL = "max-age=50";
export const DEFAULT_CACHE_CONTROL = "max-age=300"; // 5 minutes
export const LONG_CACHE_CONTROL = "max-age=172800"; // 48 hours
export const DEFAULT_API_HEADERS = { "cache-control": DEFAULT_CACHE_CONTROL };
export const LONG_CACHE_CONTROL_API_HEADERS = { "cache-control": LONG_CACHE_CONTROL };

export const MIN_DATE = "2020-05-10";
export const MAX_CHART_TREND_DAYS = 180; // TODO...
export const MAX_CHART_PLAYERS = 30;

export const SCORE_CATEGORIES: Readonly<Array<"top50" | "top25" | "top8" | "top1">> = Object.freeze([
	"top50",
	"top25",
	"top8",
	"top1"
]);

export const CATEGORY_COLORS = Object.freeze({
	top50: "#E57373",
	top25: "#7986CB",
	top8: "#4DB6AC",
	top1: "#DCE775"
});

export const CHART_COLORS = Object.freeze([
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
]);
export const CHART_RANK_COLORS = Object.freeze([
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
]);

export const RANKING_BADGES: { [id: string]: { img: string; title?: string } } = Object.freeze({
	"5795337": { img: "/badges/pogu.png", title: "poggers" },
	"1023489": { img: "/badges/unhappi.png", title: "gay" },
	"6502403": { img: "/badges/bowing.svg" },
	"11495715": { img: "/badges/doggo.svg" }
});

// TODO: was supposed to be used with depends() in load functions - needs validation
export const ROUTE_NAMES = Object.freeze(
	new Map([
		["API_GAINS", "API_GAINS"],
		["API_COUNTRIES", "API_COUNTRIES"],
		["API_PLAYERS", "API_PLAYERS"],
		["API_PLAYER", "API_PLAYER"]
	])
);

// This could potentially be Intl.DisplayNames(["en"], { type: "region" })
// but this is safer plus gives control over order and naming
export const COUNTRIES: { [countryCode: string]: string } = Object.freeze({
	US: "United States",
	RU: "Russian Federation",
	JP: "Japan",
	PL: "Poland",
	DE: "Germany",
	GB: "United Kingdom",
	FR: "France",
	CA: "Canada",
	ID: "Indonesia",
	CN: "China",
	AU: "Australia",
	KR: "Korea",
	TW: "Taiwan",
	FI: "Finland",
	PH: "Philippines",
	HK: "Hong Kong",
	AR: "Argentina",
	SG: "Singapore",
	BR: "Brazil",
	NL: "Netherlands",
	PE: "Peru",
	IT: "Italy",
	CL: "Chile",
	MY: "Malaysia",
	SE: "Sweden",
	BE: "Belgium",
	DK: "Denmark",
	CZ: "Czechia",
	UA: "Ukraine",
	KZ: "Kazakhstan",
	MX: "Mexico",
	NO: "Norway",
	ES: "Spain",
	TH: "Thailand",
	BY: "Belarus",
	GR: "Greece",
	VN: "Vietnam",
	RO: "Romania",
	LT: "Lithuania",
	RS: "Serbia",
	CO: "Colombia",
	SK: "Slovakia",
	IL: "Israel",
	NZ: "New Zealand",
	AT: "Austria",
	CR: "Costa Rica",
	VE: "Venezuela",
	TR: "Turkey",
	HU: "Hungary",
	LV: "Latvia",
	BG: "Bulgaria",
	EC: "Ecuador",
	PT: "Portugal",
	UY: "Uruguay",
	CH: "Switzerland",
	IE: "Ireland",
	IN: "India",
	EE: "Estonia",
	HR: "Croatia",
	SI: "Slovenia",
	LU: "Luxembourg",
	MA: "Morocco",
	AE: "United Arab Emirates",
	MO: "Macao",
	MN: "Mongolia",
	ZA: "South Africa",
	DO: "Dominican Republic",
	GP: "Guadeloupe",
	JE: "Jersey",
	SM: "San Marino",
	SA: "Saudi Arabia",
	NI: "Nicaragua",
	PA: "Panama",
	PR: "Puerto Rico",
	QA: "Qatar",
	RE: "Reunion",
	TT: "Trinidad and Tobago"
});
