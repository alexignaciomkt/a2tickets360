/**
 * Event DateTime Helper
 *
 * DÍVIDA TÉCNICA (V1):
 * Atualmente, os campos events.start_date e events.end_date são salvos como "timestamp without time zone" no PostgreSQL.
 * Eles representam o "wall-clock local" do evento (o horário literal em que ele acontece).
 * Ao serem lidos, o driver do banco adiciona um "Z" (UTC) à string.
 * Se passarmos essa string para `new Date()`, o navegador tentará converter a partir de UTC para o fuso horário local do usuário,
 * o que causa um deslocamento incorreto (ex: 10:00 UTC vira 07:00 no Brasil).
 *
 * Este helper usa UTC estaticamente para formatar a string "Z" exatamente como foi armazenada, preservando os números originais.
 * Exemplo: "2026-08-22T10:00:00.000Z" -> "10:00" e "22/08/2026", independente de onde o usuário acesse.
 *
 * FUTURO:
 * Migrar para `timestamptz` ou salvar os instantes absolutos em UTC, 
 * utilizando `events.timezone` para derivar o instante real.
 */

export const parseWallClock = (dateString: string | null | undefined): Date | null => {
    if (!dateString) return null;
    try {
        // Strip the Z or any timezone offset to force local parsing
        let stripped = dateString.replace(/(Z|[+-]\d{2}:\d{2})$/, '');
        // If it's just a date without time, append T00:00:00 to prevent UTC midnight parsing
        if (!stripped.includes('T')) {
            stripped += 'T00:00:00';
        }
        const d = new Date(stripped);
        if (isNaN(d.getTime())) return null;
        return d;
    } catch {
        return null;
    }
};

export const formatEventDate = (dateString: string | null | undefined): string => {
    const d = parseWallClock(dateString);
    if (!d) return dateString || '—';
    return d.toLocaleDateString('pt-BR');
};

export const formatEventTime = (dateString: string | null | undefined): string => {
    const d = parseWallClock(dateString);
    if (!d) return dateString || '';
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

export const formatEventDateTime = (dateString: string | null | undefined): string => {
    const d = parseWallClock(dateString);
    if (!d) return dateString || '—';
    return `${d.toLocaleDateString('pt-BR')} · ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
};
