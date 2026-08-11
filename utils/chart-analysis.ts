// Helper functions for chart analysis

export function formatPrice(price: string | number, symbol: string): string {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return 'N/A';

  // Determine decimal places based on symbol
  const isJPY = symbol.includes('JPY');
  const isMetal = symbol.includes('XAU') || symbol.includes('XAG') || symbol.includes('XPT') || symbol.includes('XPD');
  
  let decimals: number;
  if (isMetal) {
    decimals = 2;
  } else if (isJPY) {
    decimals = 3;
  } else {
    decimals = 5;
  }
  
  return num.toFixed(decimals);
}

export function calculateRRR(entry: number, stopLoss: number, takeProfit: number): number {
  const risk = Math.abs(entry - stopLoss);
  const reward = Math.abs(takeProfit - entry);
  if (risk === 0) return 0;
  return Math.round((reward / risk) * 100) / 100;
}

export function getPips(entry: number, stopLoss: number, symbol: string): number {
  const diff = Math.abs(entry - stopLoss);
  const isJPY = symbol.includes('JPY');
  const pipSize = isJPY ? 0.01 : 0.0001;
  return Math.round(diff / pipSize);
}
