export const formatCurrency = (value: number, decimals = 2): string => {
  if (value >= 1e12) {
    return `$${(value / 1e12).toFixed(decimals)}T`;
  }
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(decimals)}B`;
  }
  if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(decimals)}M`;
  }
  if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(decimals)}K`;
  }
  return `$${value.toFixed(decimals)}`;
};

export const formatPrice = (price: number): string => {
  if (price >= 1000) {
    return price.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  if (price >= 1) {
    return price.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  }
  return price.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  });
};

export const formatPercentage = (value: number): string => {
  const formatted = Math.abs(value).toFixed(2);
  return value >= 0 ? `+${formatted}%` : `-${formatted}%`;
};

export const formatNumber = (value: number): string => {
  return value.toLocaleString('en-US');
};

export const formatCryptoAmount = (amount: number, symbol: string): string => {
  if (amount >= 1000) {
    return `${amount.toFixed(2)} ${symbol.toUpperCase()}`;
  }
  if (amount >= 1) {
    return `${amount.toFixed(4)} ${symbol.toUpperCase()}`;
  }
  return `${amount.toFixed(8)} ${symbol.toUpperCase()}`;
};

export const timeAgo = (date: string): string => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
};
