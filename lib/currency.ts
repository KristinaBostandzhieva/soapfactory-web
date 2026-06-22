// EUR→BGN currency-board peg rate (fixed since 1997).
export const BGN_RATE = 1.956;

export const lev = (eur: number) => (eur * BGN_RATE).toFixed(2);
export const eur = (n: number) => n.toFixed(2).replace('.', ',');
