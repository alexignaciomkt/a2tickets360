import { supabase } from '@/lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
console.log('API Conectada em:', API_URL);

export interface CustomRequestInit extends RequestInit {
    timeout?: number;
}

async function getSessionWithTimeout(ms: number = 5000) {
    let timeoutId: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new Error('Sessão Auth Timeout'));
        }, ms);
    });

    try {
        const result = await Promise.race([
            supabase.auth.getSession(),
            timeoutPromise
        ]);
        return result;
    } finally {
        clearTimeout(timeoutId!);
    }
}

export async function request<T>(endpoint: string, options: CustomRequestInit = {}): Promise<T> {
    // Sempre pegar o token atualizado diretamente da sessão do Supabase (Fonte Única de Verdade)
    // Ignoramos o localStorage para o token pois ele pode conter tokens JWT antigos/legados
    let token = null;
    try {
        const { data } = await getSessionWithTimeout(5000);
        if (data?.session) {
            token = data.session.access_token;
        }
    } catch (err: any) {
        console.error('[API AUTH] SESSION ERROR', err);
        throw new Error('Não foi possível validar sua sessão. Atualize a página e tente novamente.');
    }

    const isFormData = options.body instanceof FormData;

    const headers = {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    } as any;

    const { timeout, ...fetchOptions } = options;

    let controller: AbortController | undefined;
    let timerId: NodeJS.Timeout | undefined;

    if (timeout) {
        controller = new AbortController();
        if (fetchOptions.signal) {
            // Se já tiver um signal, a gente poderia fazer um abort signal composto,
            // mas para simplificar, substituimos (a rota de upload de banner não passa timeout)
        }
        fetchOptions.signal = controller.signal;
        timerId = setTimeout(() => {
            controller!.abort();
        }, timeout);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...fetchOptions,
            headers,
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('A2Tickets_user');
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error || errorData.message || 'Erro na requisição ao servidor';
            console.error(`❌ API Error [${options.method || 'GET'}] ${endpoint}:`, errorMessage);
            throw new Error(errorMessage);
        }
        const data = await response.json();
        return data;
    } catch (err: any) {
        if (err.name === 'AbortError') {
            const timeoutErr = new Error('TimeoutError');
            timeoutErr.name = 'TimeoutError';
            throw timeoutErr;
        }
        throw err;
    } finally {
        if (timerId) {
            clearTimeout(timerId);
        }
    }
}

export const api = {
    get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
    post: <T>(endpoint: string, body: any, options: CustomRequestInit = {}) =>
        request<T>(endpoint, {
            method: 'POST',
            body: body instanceof FormData ? body : JSON.stringify(body),
            ...options
        }),
    put: <T>(endpoint: string, body: any, options: CustomRequestInit = {}) =>
        request<T>(endpoint, {
            method: 'PUT',
            body: body instanceof FormData ? body : JSON.stringify(body),
            ...options
        }),
    patch: <T>(endpoint: string, body: any, options: CustomRequestInit = {}) =>
        request<T>(endpoint, {
            method: 'PATCH',
            body: body instanceof FormData ? body : JSON.stringify(body),
            ...options
        }),
    delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};

export default api;
