export function removeTrailingIds(key: string): string {
  return key.replace(/(.+?)-\d+/, '$1');
}
