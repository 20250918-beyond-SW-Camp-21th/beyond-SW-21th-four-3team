import client from './client';

export const todoApi = {
    // Get all todos
    fetchAll: async () => {
        try {
            const response = await client.get('/todo');
            return response.data;
        } catch (error) {
            console.error('Error fetching todos:', error);
            throw error;
        }
    },

    // Create new todo
    create: async (todoData) => {
        try {
            const response = await client.post('/todo', todoData);
            return response.data;
        } catch (error) {
            console.error('Error creating todo:', error);
            throw error;
        }
    },

    // Update todo
    update: async (id, updates) => {
        try {
            const response = await client.put(`/todo/${id}`, updates);
            return response.data;
        } catch (error) {
            console.error('Error updating todo:', error);
            throw error;
        }
    },

    // Delete todo
    delete: async (id) => {
        try {
            await client.delete(`/todo/${id}`);
            return true;
        } catch (error) {
            console.error('Error deleting todo:', error);
            throw error;
        }
    }
};
