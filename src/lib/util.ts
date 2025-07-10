import tippy, { type Props } from "tippy.js";
import { linear } from "svelte/easing";
import { MIN_DATE } from "./constants";
import "tippy.js/dist/tippy.css";

export function formatNumber(number: number | string, delimiter = " "): string {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, delimiter);
}

export function isRangeContainedWithin(
  subRange: App.DateRange,
  masterRange: App.DateRange,
  now: string
) {
  return (
    (!masterRange.start || (subRange.start || MIN_DATE) >= masterRange.start) &&
    (!masterRange.end || (subRange.end || now) <= masterRange.end)
  );
}

export function arraysEqual(arr1: unknown[], arr2: unknown[]) {
  return arr1.length === arr2.length && arr1.every((value, index) => value === arr2[index]);
}

export function isObjEmpty(obj: Record<any, unknown>) {
  for (const _ in obj) return false;
  return true;
}

export function mergeObjectArraysOnField<K extends string | number | symbol, V>(
  arraySrc: Array<Record<K, V>>,
  arrayDest: Array<Record<K, V>>,
  field: K,
  nestedField?: K
) {
  const objResult = {} as Record<K, V>;
  //@ts-ignore - I honestly don't know what I'm trying to do | also this nestedField workaround is so piss
  for (const objDest of arrayDest)
    objResult[objDest[field]] = nestedField ? objDest[nestedField] : objDest;
  //@ts-ignore
  for (const objSrc of arraySrc)
    objResult[objSrc[field]] = {
      //@ts-ignore
      ...objResult[objSrc[field]],
      ...(nestedField ? objSrc[nestedField] : objSrc)
    };

  return objResult;
}

export function trimArray<T>(
  arr: Array<T>,
  trimStart = true,
  trimEnd = true,
  toRemove: T | null = null
) {
  if (trimEnd) while (arr?.length && arr[arr.length - 1] == toRemove) arr.pop();
  if (trimStart) while (arr?.length && arr[0] == toRemove) arr.shift();
  return arr;
}

export function debounce(task: (...args: any) => unknown, ms: number) {
  let t: { promise: Promise<any> | null; cancel: (value?: unknown) => void } = {
    promise: null,
    cancel: () => void 0
  };
  return async (...args: any) => {
    try {
      t.cancel();
      t = deferred(ms);
      await t.promise;
      await task(...args);
    } catch (_) {}
  };
}

function deferred(ms: number) {
  let cancel = (value?: unknown) => {};
  const promise = new Promise((resolve, reject) => {
    cancel = reject;
    setTimeout(resolve, ms);
  });
  return { promise, cancel };
}

// m 0-11, returns 3 letter short name
export function monthString(m: number) {
  switch (m) {
    default:
      return "Jan";
    case 1:
      return "Feb";
    case 2:
      return "Mar";
    case 3:
      return "Apr";
    case 4:
      return "May";
    case 5:
      return "Jun";
    case 6:
      return "Jul";
    case 7:
      return "Aug";
    case 8:
      return "Sep";
    case 9:
      return "Oct";
    case 10:
      return "Nov";
    case 11:
      return "Dec";
  }
}

export function formatDate(date?: Date, utc?: boolean) {
  if (!date) date = new Date();
  const YYYY = utc ? date.getUTCFullYear() : date.getFullYear();
  const MM = ((utc ? date.getUTCMonth() : date.getMonth()) + 1).toString().padStart(2, "0");
  const DD = (utc ? date.getUTCDate() : date.getDate()).toString().padStart(2, "0");
  return `${YYYY}-${MM}-${DD}`;
}

export function getServerDate() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getUTCDate() + days);
  return d;
}

export const getDaysBetweenDates = (
  startTimestamp: number,
  endTimestamp = getServerDate().valueOf()
) => Math.ceil((endTimestamp - startTimestamp) / (24 * 60 * 60 * 1000));

export function getDaysBeforeDate(days: number, startDate?: Date) {
  if (!startDate) startDate = new Date();
  let daysDone = 0;
  const dates = new Array<string>(days);

  for (; daysDone < days; daysDone++) {
    const curDate = addDays(startDate, -daysDone);
    dates[daysDone] = formatDate(curDate);
  }

  return dates;
}

export const getAvatarURL = (id: number | string) => `https://a.ppy.sh/${id}?0.jpg`; // the 0 is a timestamp, should use latest to avoid caching
export const getOsuProfileURL = (idOrName: number | string) =>
  `https://osu.ppy.sh/users/${idOrName}`;
export const getOsuStatsURL = (name: string) => `https://osustats.ppy.sh/u/${name}//1/////-/1-50`;
export const getOsuTrackURL = (name: string) => `https://ameobea.me/osutrack/user/${name}`;
export const getOsuAltURL = (id: number | string) => `https://score.kirino.sh/user/${id}`;
export const getOsuDailyURL = (name: number) =>
  `https://osudaily.net/profile.php?u=${name}&s=1&m=0`;
export const getOsuSnipeURL = (id: number | string, country = "global") =>
  `https://snipe.huismetbenen.nl/player/${country.toLowerCase()}/osu/${id}`;

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

export function animate({
  duration,
  draw,
  timing
}: {
  duration: number;
  draw: (progress: number) => void;
  timing: (time: number) => number;
}) {
  const start = performance.now();

  requestAnimationFrame(function animate(time) {
    let timeFraction = (time - start) / duration;
    if (timeFraction > 1) timeFraction = 1;
    const progress = timing(timeFraction);

    draw(progress);
    if (timeFraction < 1) requestAnimationFrame(animate);
  });
}

export function outClick(node: Element, ignoredNodes?: Element[]) {
  const ignoreClick = (event: Event) => {
    const target = event.target as Element;

    if (node.contains(target)) return true;
    for (const ignoredNode of ignoredNodes ?? []) {
      if (ignoredNode.contains(target)) return true;
    }

    return false;
  };

  const handleClick = (event: Event) => {
    if (!ignoreClick(event)) node.dispatchEvent(new CustomEvent("outclick"));
  };

  document.addEventListener("click", handleClick, true);
  return {
    destroy() {
      document.removeEventListener("click", handleClick, true);
    }
  };
}

export function tooltip(
  node: Element,
  { content, options }: { content?: string | Element; options?: Partial<Props> }
) {
  if (!content) return;
  const tooltip = tippy(node, {
    allowHTML: true,
    delay: 0,
    ignoreAttributes: true,
    duration: 170,
    theme: "default",
    zIndex: 10,
    ...options,
    content
  });

  return {
    destroy() {
      tooltip.destroy();
    }
  };
}
