import StringUtils from "@rbxts/string-utils";

const { floor } = math;

export function toTimerFormat(seconds: number): string {
  const hours = floor(seconds / 3600);
  const minutes = floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const formattedHours = hours > 0 ? `${hours}:` : "";
  const formattedMinutes = minutes < 10 && hours > 0 ? `0${minutes}` : `${minutes}`;
  const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : `${remainingSeconds}`;

  return `${formattedHours}${formattedMinutes}:${formattedSeconds}`;
}

const s = 1, m = 60, h = 3600, d = 86400, w = 604800;
const timePatterns = {
  s, second: s, seconds: s,
  m, minute: m, minutes: m,
  h, hour: h, hours: h,
  d, day: d, days: d,
  w, week: w, weeks: w
};
// Takes a remaining time string (e.g. 1d 5h 10s) and
// converts it to the amount of time it represents in seconds.

export function toSeconds(time: string): number {
  let seconds = 0;
  for (const [value, unit] of time.gsub(" ", "")[0].gmatch("(%d+)(%a)")) {
    const timeUnit = <keyof typeof timePatterns>unit;
    const figure = <number>value;
    seconds += figure * timePatterns[timeUnit];
  }

  return seconds;
}
// Takes a time in seconds (e.g. 310) and converts
// it to a remaining time string (e.g. 5m 10s)

export function toRemainingTime(seconds: number): string {
  const dayDivisor = 60 * 60 * 24;
  const days = floor(seconds / dayDivisor);
  seconds %= dayDivisor;

  const hourDivisor = 60 * 60;
  const hours = floor(seconds / hourDivisor);
  seconds %= hourDivisor;

  const minuteDivisor = 60;
  const minutes = floor(seconds / minuteDivisor);
  seconds %= minuteDivisor;

  let remainingTime = "";
  if (days > 0)
    remainingTime += "%dd ".format(days);
  if (hours > 0)
    remainingTime += "%dh ".format(hours);
  if (minutes > 0)
    remainingTime += "%dm ".format(minutes);
  if (seconds > 0)
    remainingTime += "%ds ".format(seconds);

  return StringUtils.trim(remainingTime);
}

export function toLongRemainingTime(seconds: number): string {
  const hours = floor(seconds / 3600);
  const minutes = floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return "%02d:%02d:%02d".format(hours, minutes, remainingSeconds);
}
