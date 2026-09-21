/** Pure rules shared by the browser and Edge Functions. No credentials or runtime globals. */
export function zonedLocalToUtc(local: string, timezone: string): string {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)) throw new Error('Choose a valid date and time.');
  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  });
  const nominal = Date.parse(`${local}:00Z`);
  if (!Number.isFinite(nominal)) throw new Error('Choose a valid date and time.');
  const matches: string[] = [];
  // All contemporary IANA offsets are multiples of 15 minutes. Match the wall clock
  // instead of guessing an offset, so DST gaps and repeated hours fail explicitly.
  for (let offset = -14 * 60; offset <= 14 * 60; offset += 15) {
    const candidate = new Date(nominal + offset * 60_000);
    if (formatter.format(candidate).replace(' ', 'T') === local) matches.push(candidate.toISOString());
  }
  if (matches.length !== 1) throw new Error(matches.length ? 'This time occurs twice due to daylight saving. Choose an unambiguous time.' : 'This local time does not exist. Choose another time.');
  return matches[0];
}

export function validateInstagramImage(type: string, size: number, width: number, height: number): void {
  if (type !== 'image/jpeg') throw new Error('Instagram publishing currently accepts JPEG images only.');
  if (!Number.isFinite(size) || size <= 0 || size > 8 * 1024 * 1024) throw new Error('Choose an image no larger than 8 MB.');
  if (width < 320 || width > 1440 || height <= 0 || width / height < 0.8 || width / height > 1.91) {
    throw new Error('Use a 320–1440 px wide image with an aspect ratio between 4:5 and 1.91:1.');
  }
}

export function validateCaption(caption: string): string {
  const value = caption.trim();
  if (!value || [...value].length > 2200) throw new Error('Enter a caption of 1–2,200 characters.');
  if ((value.match(/#[\p{L}\p{N}_]+/gu) ?? []).length > 30) throw new Error('Use no more than 30 hashtags.');
  return value;
}

export function safeInstagramUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && ['www.instagram.com', 'instagram.com'].includes(url.hostname) ? url.href : null;
  } catch { return null; }
}
