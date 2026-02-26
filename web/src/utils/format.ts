export const formatKr = (n: number) => `${(n ?? 0).toLocaleString('nb-NO')} kr`;

export const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' });
