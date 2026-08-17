export const PLATFORM_PERCENTAGE_BPS = 800; // 8%
export const PLATFORM_FIXED_FEE_CENTS = 500; // R$5.00

export type FinancialInput = {
  unitPriceCents: number;
  quantity: number;
  billableUnits: number;
  discountAmountCents: number;
  promoterCommissionRate: number; // percentage, e.g., 10 for 10%
  passPlatformFeeToBuyer: boolean;
};

export type FinancialDistribution = {
  grossAmountCents: number;
  discountAmountCents: number;
  commercialAmountCents: number;
  billableUnits: number;
  platformPercentageFeeCents: number;
  platformFixedFeeCents: number;
  platformFeeCents: number;
  promoterCommissionCents: number;
  producerAmountCents: number;
  buyerTotalCents: number;
};

export function calculateFinancialDistribution(input: FinancialInput): FinancialDistribution {
  if (input.quantity <= 0) throw new Error("quantity must be greater than zero");
  if (input.billableUnits <= 0) throw new Error("billableUnits must be greater than zero");
  if (input.unitPriceCents < 0) throw new Error("unitPriceCents cannot be negative");
  if (input.discountAmountCents < 0) throw new Error("discountAmountCents cannot be negative");
  if (input.promoterCommissionRate < 0 || input.promoterCommissionRate > 100) {
    throw new Error("promoterCommissionRate must be between 0 and 100");
  }

  const grossAmountCents = Math.round(input.unitPriceCents * input.quantity);
  
  if (input.discountAmountCents > grossAmountCents) {
    throw new Error("discountAmountCents cannot be greater than grossAmountCents");
  }

  const commercialAmountCents = grossAmountCents - input.discountAmountCents;

  const platformPercentageFeeCents = Math.round(grossAmountCents * (PLATFORM_PERCENTAGE_BPS / 10000));
  const platformFixedFeeCents = Math.round(input.billableUnits * PLATFORM_FIXED_FEE_CENTS);
  const platformFeeCents = platformPercentageFeeCents + platformFixedFeeCents;

  const promoterCommissionCents = Math.round(commercialAmountCents * (input.promoterCommissionRate / 100));

  let buyerTotalCents: number;
  let producerAmountCents: number;

  if (input.passPlatformFeeToBuyer) {
    buyerTotalCents = commercialAmountCents + platformFeeCents;
    producerAmountCents = commercialAmountCents - promoterCommissionCents;
  } else {
    buyerTotalCents = commercialAmountCents;
    producerAmountCents = commercialAmountCents - platformFeeCents - promoterCommissionCents;
  }

  if (producerAmountCents < 0) {
    throw new Error("producerAmountCents cannot be negative. This transaction is economically invalid.");
  }

  return {
    grossAmountCents,
    discountAmountCents: input.discountAmountCents,
    commercialAmountCents,
    billableUnits: input.billableUnits,
    platformPercentageFeeCents,
    platformFixedFeeCents,
    platformFeeCents,
    promoterCommissionCents,
    producerAmountCents,
    buyerTotalCents,
  };
}

export function deriveBillableUnits(
  revenueType: 'TICKET' | 'REGISTRATION' | 'REPECHAGE',
  quantity: number,
  capacityPerUnit: number = 1
): number {
  if (revenueType === 'REGISTRATION' || revenueType === 'REPECHAGE') {
    return quantity;
  }
  
  // TICKET
  const cap = Math.max(1, capacityPerUnit);
  return quantity * cap;
}
