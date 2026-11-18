/** A side's payout multiple at today's pot (before fees): the whole pot over what is staked on that side. */
export const multiple = (side: number, total: number) => (side > 0 ? `${(total / side).toFixed(2)}×` : null);

export const UP = 0;
export const DOWN = 1;
