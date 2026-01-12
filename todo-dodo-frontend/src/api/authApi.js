import client from './client';

export const authApi = {
    // Signup
    signup: async (signupData) => {
        try {
            const response = await client.post('/auth/signup', signupData);
            return response.data;
        } catch (error) {
            console.error('Signup failed:', error);
            throw error;
        }
    },

    // Login
    login: async (id, password) => {
        try {
            const response = await client.post('/auth/login', { loginId: id, password });
            return response.data;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    },

    // Refresh Token
    refreshToken: async (refreshToken) => {
        try {
            const response = await client.post('/auth/refresh', { refreshToken });
            return response.data;
        } catch (error) {
            console.error('Token refresh failed:', error);
            throw error;
        }
    },

    // Logout
    logout: async (refreshToken) => {
        try {
            await client.post('/auth/logout', { refreshToken });
            return true;
        } catch (error) {
            console.error('Logout failed:', error);
            throw error;
        }
    },

    requestPasswordReset(loginId, email) {
        return client.post('/auth/password/reset/request', { loginId, email }).then(r => r.data);
    },

    confirmPasswordReset(loginId, code, newPassword) {
        return client.post('/auth/password/reset/confirm', {
            loginId,
            code,
            newPassword,
        }).then(r => r.data);
    },
};
