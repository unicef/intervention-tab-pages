export function getTotal(csoCash: number | string, unicefCash: number | string): string {
  const total: number = (Number(csoCash) || 0) + (Number(unicefCash) || 0);
  return formatCurrency(total);
}

export function formatCurrency(amount: number): string {
  const normalized: number = Math.round(amount * 100) / 100;
  const formattedTotal: string = `${normalized}`.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  const [main, cents] = formattedTotal.split('.');
  const formattedCents: string = `${cents || ''}00`.slice(0, 2);
  return [main, formattedCents].join('.');
}
