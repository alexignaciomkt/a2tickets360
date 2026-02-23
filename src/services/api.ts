const API_URL = import.meta.env.VITE_API_URL || 'https://46.224.101.23.sslip.io';
console.log('API Conectada em:', API_URL);

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('A2Tickets_token');

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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Erro na requisição ao servidor');
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
