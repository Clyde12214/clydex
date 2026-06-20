import type { DigitStats } from './types';

export function pipSizeFromPip(pip: number): number {
  if (pip >= 1) return 0;
  const str = pip.toString();
  const dotIndex = str.indexOf('.');
  if (dotIndex === -1) return 0;
  return str.length - dotIndex - 1;
}

export function getLastDigit(price: number, pipSize: number): number {
  const priceStr = price.toFixed(pipSize);
  const lastChar = priceStr[priceStr.length - 1];
  return parseInt(lastChar, 10);
}

export function computeDigitStats(prices: number[], pipSize: number): DigitStats {
  const counts = new Array(10).fill(0);
  for (const price of prices) {
    const digit = getLastDigit(price, pipSize);
    counts[digit]++;
  }
  const totalTicks = prices.length;
  const percentages = counts.map((count) =>
    totalTicks > 0 ? (count / totalTicks) * 100 : 0
  );
  return { counts, percentages, totalTicks };
}

export function updateDigitStats({
  prices,
  newPrice,
  windowSize,
}: {
  prices: number[];
  newPrice: number;
  windowSize: number;
}): number[] {
  const updated = [...prices, newPrice];
  if (updated.length > windowSize) {
    updated.shift();
  }
  return updated;
}
