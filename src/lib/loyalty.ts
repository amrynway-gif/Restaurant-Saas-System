

export type LoyaltyComputeSettings = {
  loyaltyProgramEnabled: boolean;
  
  spendCentsPerPoint: number;
};

export function pointsEarnedForOrder(
  orderTotalCents: number,
  settings: LoyaltyComputeSettings
): number {
  if (!settings.loyaltyProgramEnabled || orderTotalCents <= 0) return 0;
  const step = Math.max(1, Math.floor(settings.spendCentsPerPoint));
  return Math.floor(orderTotalCents / step);
}


export function redemptionValueCents(
  pointsBalance: number,
  pointValueCents: number
): number {
  if (pointsBalance <= 0 || pointValueCents <= 0) return 0;
  return pointsBalance * pointValueCents;
}
