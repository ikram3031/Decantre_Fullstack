export function formatBDT(value: number | string | null | undefined): string {
  const n = Number(value) || 0;
  // simple formatting with Bengali Taka symbol
  return `৳ ${n.toLocaleString('en-US')}`;
}

export default formatBDT;
