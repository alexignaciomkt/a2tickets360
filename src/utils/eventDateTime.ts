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

export const getEventTemporalStatus = (startDateStr: string | null | undefined, endDateStr: string | null | undefined): 'FUTURO' | 'EM ANDAMENTO' | 'ENCERRADO' => {
    const now = new Date();
    
    // Se não tiver start date válido, assumimos futuro por padrão para não quebrar UI 
    const start = parseWallClock(startDateStr);
    if (!start) return 'FUTURO';
    
    // Se tiver endDate, usamos ele para saber se acabou.
    // Se não, assumimos que o evento acaba 6 horas após o início.
    let end = parseWallClock(endDateStr);
    if (!end) {
        end = new Date(start.getTime() + 6 * 60 * 60 * 1000); // +6 horas
    }
    
    if (now < start) {
        return 'FUTURO';
    } else if (now > end) {
        return 'ENCERRADO';
    } else {
        return 'EM ANDAMENTO';
    }
};
