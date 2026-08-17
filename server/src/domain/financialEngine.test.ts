import { calculateFinancialDistribution, deriveBillableUnits } from './financialEngine';
import * as assert from 'assert';

function runTests() {
  // TESTE A: Ingresso 100, 1 unidade, sem desconto, sem promoter, taxa absorvida
  const resA = calculateFinancialDistribution({
    unitPriceCents: 10000,
    quantity: 1,
    billableUnits: deriveBillableUnits('TICKET', 1, 1),
    discountAmountCents: 0,
    promoterCommissionRate: 0,
    passPlatformFeeToBuyer: false,
  });
  assert.strictEqual(resA.grossAmountCents, 10000);
  assert.strictEqual(resA.commercialAmountCents, 10000);
  assert.strictEqual(resA.platformFeeCents, 1300);
  assert.strictEqual(resA.promoterCommissionCents, 0);
  assert.strictEqual(resA.producerAmountCents, 8700);
  assert.strictEqual(resA.buyerTotalCents, 10000);

  // TESTE B: Mesmo ingresso, taxa repassada
  const resB = calculateFinancialDistribution({
    unitPriceCents: 10000,
    quantity: 1,
    billableUnits: deriveBillableUnits('TICKET', 1, 1),
    discountAmountCents: 0,
    promoterCommissionRate: 0,
    passPlatformFeeToBuyer: true,
  });
  assert.strictEqual(resB.platformFeeCents, 1300);
  assert.strictEqual(resB.producerAmountCents, 10000);
  assert.strictEqual(resB.buyerTotalCents, 11300);

  // TESTE C: Ingresso 100, desconto 5, promoter 10%, taxa absorvida
  const resC = calculateFinancialDistribution({
    unitPriceCents: 10000,
    quantity: 1,
    billableUnits: deriveBillableUnits('TICKET', 1, 1),
    discountAmountCents: 500,
    promoterCommissionRate: 10,
    passPlatformFeeToBuyer: false,
  });
  assert.strictEqual(resC.grossAmountCents, 10000);
  assert.strictEqual(resC.commercialAmountCents, 9500);
  assert.strictEqual(resC.platformFeeCents, 1300);
  assert.strictEqual(resC.promoterCommissionCents, 950);
  assert.strictEqual(resC.producerAmountCents, 7250);
  assert.strictEqual(resC.buyerTotalCents, 9500);

  // TESTE D: Mesmo cenário, taxa repassada
  const resD = calculateFinancialDistribution({
    unitPriceCents: 10000,
    quantity: 1,
    billableUnits: deriveBillableUnits('TICKET', 1, 1),
    discountAmountCents: 500,
    promoterCommissionRate: 10,
    passPlatformFeeToBuyer: true,
  });
  assert.strictEqual(resD.grossAmountCents, 10000);
  assert.strictEqual(resD.commercialAmountCents, 9500);
  assert.strictEqual(resD.platformFeeCents, 1300);
  assert.strictEqual(resD.promoterCommissionCents, 950);
  assert.strictEqual(resD.producerAmountCents, 8550);
  assert.strictEqual(resD.buyerTotalCents, 10800);

  // TESTE E: Camarote 1000, quantity 1, billableUnits 10, sem desconto, sem promoter, taxa absorvida
  const resE = calculateFinancialDistribution({
    unitPriceCents: 100000,
    quantity: 1,
    billableUnits: deriveBillableUnits('TICKET', 1, 10),
    discountAmountCents: 0,
    promoterCommissionRate: 0,
    passPlatformFeeToBuyer: false,
  });
  assert.strictEqual(resE.platformPercentageFeeCents, 8000);
  assert.strictEqual(resE.platformFixedFeeCents, 5000);
  assert.strictEqual(resE.platformFeeCents, 13000);
  assert.strictEqual(resE.producerAmountCents, 87000);
  assert.strictEqual(resE.buyerTotalCents, 100000);

  // TESTE F: Camarote 1000, 10 acessos, promoter 10%, sem desconto, taxa repassada
  const resF = calculateFinancialDistribution({
    unitPriceCents: 100000,
    quantity: 1,
    billableUnits: deriveBillableUnits('TICKET', 1, 10),
    discountAmountCents: 0,
    promoterCommissionRate: 10,
    passPlatformFeeToBuyer: true,
  });
  assert.strictEqual(resF.promoterCommissionCents, 10000);
  assert.strictEqual(resF.producerAmountCents, 90000);
  assert.strictEqual(resF.platformFeeCents, 13000);
  assert.strictEqual(resF.buyerTotalCents, 113000);

  // Invariantes Test
  const results = [resA, resB, resC, resD, resE, resF];
  for (const res of results) {
    assert.strictEqual(res.grossAmountCents, res.commercialAmountCents + res.discountAmountCents);
    assert.strictEqual(
      res.buyerTotalCents,
      res.producerAmountCents + res.promoterCommissionCents + res.platformFeeCents
    );
  }

  // Error validations
  assert.throws(() => calculateFinancialDistribution({ unitPriceCents: -1, quantity: 1, billableUnits: 1, discountAmountCents: 0, promoterCommissionRate: 0, passPlatformFeeToBuyer: false }));
  assert.throws(() => calculateFinancialDistribution({ unitPriceCents: 100, quantity: 0, billableUnits: 1, discountAmountCents: 0, promoterCommissionRate: 0, passPlatformFeeToBuyer: false }));
  assert.throws(() => calculateFinancialDistribution({ unitPriceCents: 100, quantity: 1, billableUnits: 0, discountAmountCents: 0, promoterCommissionRate: 0, passPlatformFeeToBuyer: false }));
  assert.throws(() => calculateFinancialDistribution({ unitPriceCents: 100, quantity: 1, billableUnits: 1, discountAmountCents: -10, promoterCommissionRate: 0, passPlatformFeeToBuyer: false }));
  assert.throws(() => calculateFinancialDistribution({ unitPriceCents: 100, quantity: 1, billableUnits: 1, discountAmountCents: 200, promoterCommissionRate: 0, passPlatformFeeToBuyer: false })); // discount > gross
  assert.throws(() => calculateFinancialDistribution({ unitPriceCents: 100, quantity: 1, billableUnits: 1, discountAmountCents: 0, promoterCommissionRate: 110, passPlatformFeeToBuyer: false }));

  console.log("All tests passed!");
}

runTests();
