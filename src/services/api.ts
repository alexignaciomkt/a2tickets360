import { supabase } from '@/lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
console.log('API Conectada em:', API_URL);

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Sempre pegar o token atualizado diretamente da sessão do Supabase (Fonte Única de Verdade)
    // Ignoramos o localStorage para o token pois ele pode conter tokens JWT antigos/legados
    let token = null;
    const { data } = await supabase.auth.getSession();
    if (data.session) {
        token = data.session.access_token;
    }

    const isFormData = options.body instanceof FormData;

    const headers = {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    } as any;

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
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

    return response.json();
}

export const api = {
    get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
    post: <T>(endpoint: string, body: any, options: RequestInit = {}) =>
        request<T>(endpoint, {
            method: 'POST',
            body: body instanceof FormData ? body : JSON.stringify(body),
            ...options
        }),
    put: <T>(endpoint: string, body: any, options: RequestInit = {}) =>
        request<T>(endpoint, {
            method: 'PUT',
            body: body instanceof FormData ? body : JSON.stringify(body),
            ...options
        }),
    delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};

export default api;
