import { linear } from 'svelte/easing';

export function formatNumber(number: number | string, delimiter = ' '): string {
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, delimiter);
}

export function equalArray(arr1: unknown[], arr2: unknown[]): boolean {
	return arr1.length === arr2.length && arr1.every((value, index) => value === arr2[index]);
}

export function isObjEmpty(obj: Record<string, unknown>): boolean {
	for (const i in obj) return false;
	return true;
}

export function trimArray<T>(arr: Array<T>, trimStart = true, trimEnd = true, toRemove = null) {
	if (trimEnd) while (arr?.length && arr[arr.length - 1] == toRemove) arr.pop();
	if (trimStart) while (arr?.length && arr[0] == toRemove) arr.shift();
	return arr;
}

//0-11, returns 3 letter short name
export function monthString(m: number) {
	switch (m) {
		default:
			return 'Jan';
		case 1:
			return 'Feb';
		case 2:
			return 'Mar';
		case 3:
			return 'Apr';
		case 4:
			return 'May';
		case 5:
			return 'Jun';
		case 6:
			return 'Jul';
		case 7:
			return 'Aug';
		case 8:
			return 'Sep';
		case 9:
			return 'Oct';
		case 10:
			return 'Nov';
		case 11:
			return 'Dec';
	}
}

//YYYY-MM-DD
export function formatDate(date?: Date) {
	if (!date) date = new Date();
	return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date
		.getDate()
		.toString()
		.padStart(2, '0')}`;
}

export function addDate(date: Date, days: number) {
	const d = new Date(date);
	d.setDate(d.getUTCDate() + days);
	return d;
}

export const getAvatarURL = (id: number | string) => 'https://a.ppy.sh/' + id + '?0.jpg'; //the 0 is the timestamp, should use latest to avoid caching

export function getDaysBeforeDate(days: number, startDate?: Date) {
	if (!startDate) startDate = new Date();
	let daysDone = 0;
	const dates = new Array(days);

	for (; daysDone < days; daysDone++) {
		const curDate = addDate(startDate, -daysDone);
		dates[daysDone] = formatDate(curDate);
	}

	return dates;
}

export function transitionHeight(
	node: Element,
	{ delay = 0, duration = 400, easing = linear, maxHeight = 1024 }
) {
	return {
		delay,
		duration,
		css: (t: number) => {
			const w = easing(t);
			return `max-height: ${w * maxHeight}px;`;
		}
	};
}

export const MIN_DATE = '2020-05-10';

export const SCORE_CATEGORIES = ['top50', 'top25', 'top8', 'top1'];

export const RANKING_BADGES: { [id: string]: { img: string; title?: string } } = {
	'5795337': { img: '/badges/pogu.png', title: 'poggers' },
	'1023489': { img: '/badges/unhappi.png', title: 'gay' },
	'6502403': { img: '/badges/bowing.svg' },
	'11495715': { img: '/badges/cat.svg' }
};

export const COUNTRIES: { [countryCode: string]: string } = {
	AE: 'United Arab Emirates',
	AR: 'Argentina',
	AT: 'Austria',
	AU: 'Australia',
	BE: 'Belgium',
	BG: 'Bulgaria',
	BR: 'Brazil',
	BY: 'Belarus',
	CA: 'Canada',
	CH: 'Switzerland',
	CL: 'Chile',
	CN: 'China',
	CO: 'Colombia',
	CR: 'Costa Rica',
	CZ: 'Czechia',
	DE: 'Germany',
	DK: 'Denmark',
	DO: 'Dominican Republic',
	EC: 'Ecuador',
	EE: 'Estonia',
	ES: 'Spain',
	FI: 'Finland',
	FR: 'France',
	GB: 'United Kingdom',
	GR: 'Greece',
	HK: 'Hong Kong',
	HR: 'Croatia',
	HU: 'Hungary',
	ID: 'Indonesia',
	IE: 'Ireland',
	IL: 'Israel',
	IN: 'India',
	IT: 'Italy',
	JE: 'Jersey',
	JP: 'Japan',
	KR: 'Korea ',
	KZ: 'Kazakhstan',
	LT: 'Lithuania',
	LU: 'Luxembourg',
	LV: 'Latvia',
	MA: 'Morocco',
	MN: 'Mongolia',
	MO: 'Macao',
	MX: 'Mexico',
	MY: 'Malaysia',
	NI: 'Nicaragua',
	NL: 'Netherlands',
	NO: 'Norway',
	NZ: 'New Zealand',
	PA: 'Panama',
	PE: 'Peru',
	PH: 'Philippines',
	PL: 'Poland',
	PR: 'Puerto Rico',
	PT: 'Portugal',
	QA: 'Qatar',
	RE: 'Reunion',
	RO: 'Romania',
	RS: 'Serbia',
	RU: 'Russian Federation',
	SA: 'Saudi Arabia',
	SE: 'Sweden',
	SG: 'Singapore',
	SI: 'Slovenia',
	SK: 'Slovakia',
	SM: 'San Marino',
	TH: 'Thailand',
	TR: 'Turkey',
	TT: 'Trinidad and Tobago',
	TW: 'Taiwan',
	UA: 'Ukraine',
	US: 'United States',
	UY: 'Uruguay',
	VE: 'Venezuela',
	VN: 'Vietnam',
	ZA: 'South Africa'
};
