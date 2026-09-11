import { calculateFinancialDistribution, deriveBillableUnits } from './financialEngine';
import * as assert from 'assert';

function runTests() {
  // A. Gross R$ 0,00 -> A2 = R$ 0,00
  const resA = calculateFinancialDistribution({
    unitPriceCents: 0,
    quantity: 1,
    billableUnits: 1,
    discountAmountCents: 0,
    promoterCommissionRate: 0,
    passPlatformFeeToBuyer: false,
  });
  assert.strictEqual(resA.platformFeeCents, 0, 'A. Taxa de gross zero deve ser zero');

  // B. Gross R$ 40,00 -> A2 = R$ 5,00
  const resB = calculateFinancialDistribution({
    unitPriceCents: 4000,
    quantity: 1,
    billableUnits: 1,
    discountAmountCents: 0,
    promoterCommissionRate: 0,
    passPlatformFeeToBuyer: false,
  });
  assert.strictEqual(resB.platformFeeCents, 500, 'B. 10% de 40.00 é 4.00, piso de 5.00 se aplica');

  // C. Gross R$ 49,90 -> A2 = R$ 5,00
  const resC = calculateFinancialDistribution({
    unitPriceCents: 4990,
    quantity: 1,
    billableUnits: 1,
    discountAmountCents: 0,
    promoterCommissionRate: 0,
    passPlatformFeeToBuyer: false,
  });
  assert.strictEqual(resC.platformFeeCents, 500, 'C. 10% de 49.90 é 4.99, piso de 5.00 se aplica');

  // D. Gross R$ 49,99 -> A2 = R$ 5,00
  const resD = calculateFinancialDistribution({
    unitPriceCents: 4999,
    quantity: 1,
    billableUnits: 1,
    discountAmountCents: 0,
    promoterCommissionRate: 0,
    passPlatformFeeToBuyer: false,
  });
  assert.strictEqual(resD.platformFeeCents, 500, 'D. 10% de 49.99 arredonda pra 5.00, que já é o piso de 5.00');

  // E. Gross R$ 50,00 -> A2 = R$ 5,00
  const resE = calculateFinancialDistribution({
    unitPriceCents: 5000,
    quantity: 1,
    billableUnits: 1,
    discountAmountCents: 0,
    promoterCommissionRate: 0,
    passPlatformFeeToBuyer: false,
  });
  assert.strictEqual(resE.platformFeeCents, 500, 'E. 10% de 50.00 é exatamente 5.00');

  // F. Gross R$ 50,01 -> validar arredondamento correto em centavos
  const resF = calculateFinancialDistribution({
    unitPriceCents: 5001,
    quantity: 1,
    billableUnits: 1,
    discountAmountCents: 0,
    promoterCommissionRate: 0,
    passPlatformFeeToBuyer: false,
  });
  assert.strictEqual(resF.platformFeeCents, 500, 'F. 10% de 50.01 é 5.001, round para 500 centavos');

  // G. Gross R$ 51,00 -> A2 = R$ 5,10
  const resG = calculateFinancialDistribution({
    unitPriceCents: 5100,
    quantity: 1,
    billableUnits: 1,
    discountAmountCents: 0,
    promoterCommissionRate: 0,
    passPlatformFeeToBuyer: false,
  });
  assert.strictEqual(resG.platformFeeCents, 510, 'G. 10% de 51.00 é 5.10 (acima do piso de 5.00)');

  // H. Gross R$ 600,00 sem desconto/promoter -> A2 = R$ 60,00
  const resH = calculateFinancialDistribution({
    unitPriceCents: 60000,
    quantity: 1,
    billableUnits: 1,
    discountAmountCents: 0,
    promoterCommissionRate: 0,
    passPlatformFeeToBuyer: false,
  });
  assert.strictEqual(resH.platformFeeCents, 6000, 'H. 10% de 600.00 é 60.00');

  // I. Gross R$ 600,00 promoter 10% sem desconto -> promoter = R$ 60,00 A2 = R$ 60,00
  const resI = calculateFinancialDistribution({
    unitPriceCents: 60000,
    quantity: 1,
    billableUnits: 1,
    discountAmountCents: 0,
    promoterCommissionRate: 10,
    passPlatformFeeToBuyer: false,
  });
  assert.strictEqual(resI.promoterCommissionCents, 6000, 'I. Comissão 10% de 600 (sem desc) = 60');
  assert.strictEqual(resI.platformFeeCents, 6000, 'I. Taxa A2 de 600 = 60');

  // J. Gross R$ 600,00 desconto 10% promoter 10%
  const resJRepassada = calculateFinancialDistribution({
    unitPriceCents: 60000,
    quantity: 1,
    billableUnits: 1,
    discountAmountCents: 6000, // 10% de 60000
    promoterCommissionRate: 10,
    passPlatformFeeToBuyer: true,
  });
  assert.strictEqual(resJRepassada.grossAmountCents, 60000);
  assert.strictEqual(resJRepassada.discountAmountCents, 6000);
  assert.strictEqual(resJRepassada.commercialAmountCents, 54000);
  assert.strictEqual(resJRepassada.platformFeeCents, 6000); // 10% do gross
  assert.strictEqual(resJRepassada.promoterCommissionCents, 5400); // 10% do commercial
  assert.strictEqual(resJRepassada.buyerTotalCents, 60000); // 54000 + 6000
  assert.strictEqual(resJRepassada.producerAmountCents, 48600); // 54000 - 5400

  const resJAbsorvida = calculateFinancialDistribution({
    unitPriceCents: 60000,
    quantity: 1,
    billableUnits: 1,
    discountAmountCents: 6000, // 10% de 60000
    promoterCommissionRate: 10,
    passPlatformFeeToBuyer: false,
  });
  assert.strictEqual(resJAbsorvida.buyerTotalCents, 54000); // just commercial
  assert.strictEqual(resJAbsorvida.producerAmountCents, 42600); // 54000 - 6000 - 5400

  // K. quantity > 1 -> provar que NÃO existe R$ 5 por unidade.
  const resK = calculateFinancialDistribution({
    unitPriceCents: 4000,
    quantity: 3, // Gross = 12000
    billableUnits: 3,
    discountAmountCents: 0,
    promoterCommissionRate: 0,
    passPlatformFeeToBuyer: false,
  });
  // 10% of 120.00 = 12.00, which > 5.00. Fee is 12.00. (Not 15!)
  assert.strictEqual(resK.grossAmountCents, 12000);
  assert.strictEqual(resK.platformFeeCents, 1200, 'K. Nenhuma taxa fixa por unidade');

  // L. desconto sem promoter
  const resL = calculateFinancialDistribution({
    unitPriceCents: 10000,
    quantity: 1,
    billableUnits: 1,
    discountAmountCents: 1000,
    promoterCommissionRate: 0,
    passPlatformFeeToBuyer: false,
  });
  assert.strictEqual(resL.commercialAmountCents, 9000);
  assert.strictEqual(resL.platformFeeCents, 1000);
  assert.strictEqual(resL.promoterCommissionCents, 0);

  // M. promoter sem desconto (Já coberto no teste I, mas reforçando)
  const resM = calculateFinancialDistribution({
    unitPriceCents: 50000,
    quantity: 1,
    billableUnits: 1,
    discountAmountCents: 0,
    promoterCommissionRate: 5,
    passPlatformFeeToBuyer: false,
  });
  assert.strictEqual(resM.commercialAmountCents, 50000);
  assert.strictEqual(resM.platformFeeCents, 5000);
  assert.strictEqual(resM.promoterCommissionCents, 2500);

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
