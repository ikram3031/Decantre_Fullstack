export function formatBDT(value) {
  const n = Number(value) || 0;
  // simple formatting with Bengali Taka symbol
  return `৳ ${n.toLocaleString('en-US')}`;
}

export default formatBDT;
