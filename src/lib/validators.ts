export const validatePassword = (password: string): { isValid: boolean; message: string } => {
    if (password.length < 8) {
        return { isValid: false, message: 'A senha deve ter pelo menos 8 caracteres.' };
    }

    if (!/[A-Z]/.test(password)) {
        return { isValid: false, message: 'A senha deve conter pelo menos uma letra maiúscula.' };
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return { isValid: false, message: 'A senha deve conter pelo menos um caractere especial.' };
    }

    return { isValid: true, message: '' };
};
