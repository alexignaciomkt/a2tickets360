import test from 'node:test';
import assert from 'node:assert';
import { sanitizeAsaasDescription } from './asaas';

test('Sanitize Asaas Description', async (t) => {
  await t.test('Should remove special characters and accents', () => {
    const input = 'Inscrição | REIS DO TRUCO — O Iº CAMPEONATO DE TRUCO DE RIBEIRÃO PRETO';
    const expected = 'Inscricao REIS DO TRUCO - O I CAMPEONATO DE TRUCO DE RIBEIRAO PRETO';
    assert.strictEqual(sanitizeAsaasDescription(input), expected);
  });

  await t.test('Should handle empty string', () => {
    assert.strictEqual(sanitizeAsaasDescription(''), '');
  });

  await t.test('Should handle already clean ASCII string', () => {
    const clean = 'Inscricao de Teste 123';
    assert.strictEqual(sanitizeAsaasDescription(clean), clean);
  });

  await t.test('Should convert em-dash and en-dash to hyphen', () => {
    assert.strictEqual(sanitizeAsaasDescription('Word—Word–Word'), 'Word-Word-Word');
  });

  await t.test('Should remove ordinals', () => {
    assert.strictEqual(sanitizeAsaasDescription('1º lugar e 2ª divisao'), '1 lugar e 2 divisao');
  });

  await t.test('Should collapse multiple spaces', () => {
    assert.strictEqual(sanitizeAsaasDescription('Muito    espaco   aqui'), 'Muito espaco aqui');
  });

  await t.test('Should remove emojis and weird symbols', () => {
    assert.strictEqual(sanitizeAsaasDescription('Festa 🚀🎉 & Música @ 100%'), 'Festa Musica 100');
  });

  await t.test('Should keep dots and hyphens', () => {
    assert.strictEqual(sanitizeAsaasDescription('Versao 1.0 - Alfa'), 'Versao 1.0 - Alfa');
  });
});
