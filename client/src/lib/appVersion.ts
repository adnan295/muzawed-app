export const APP_VERSION = "1.0.0";

export function isVersionOutdated(currentVersion: string, minVersion: string): boolean {
  const parse = (v: string) => v.split(".").map((n) => parseInt(n, 10) || 0);
  const [curMajor, curMinor, curPatch] = parse(currentVersion);
  const [minMajor, minMinor, minPatch] = parse(minVersion);

  if (curMajor !== minMajor) return curMajor < minMajor;
  if (curMinor !== minMinor) return curMinor < minMinor;
  return curPatch < minPatch;
}
