export const loginApi = {
    login: async (id, pw) => {
        console.log(`Login with ${id}, ${pw}`);
        return { success: true, token: 'mock-token' };
    },
    register: async (userData) => {
        console.log('Register', userData);
        return { success: true };
    }
};
