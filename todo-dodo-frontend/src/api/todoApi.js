import client from './client';

export const todoApi = {
    // Get all todos
    fetchAll: async () => {
        try {
            const response = await client.get('/todo/me');
            if (response.data && response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to fetch todos');
        } catch (error) {
            console.error('Error fetching todos:', error);
            throw error;
        }
    },

    // Create new todo
    create: async (todoData) => {
        try {
            const response = await client.post('/todo', todoData);
            if (response.data && response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to create todo');
        } catch (error) {
            console.error('Error creating todo:', error);
            throw error;
        }
    },

    // Update todo
    update: async (id, updates) => {
        try {
            const response = await client.put(`/todo/${id}`, updates);
            if (response.data && response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to update todo');
        } catch (error) {
            console.error('Error updating todo:', error);
            throw error;
        }
    },

    // Delete todo
    delete: async (id) => {
        try {
            const response = await client.delete(`/todo/${id}`);
            if (response.data && response.data.success) {
                return true;
            }
            throw new Error(response.data.message || 'Failed to delete todo');
        } catch (error) {
            console.error('Error deleting todo:', error);
            throw error;
        }
    }
};
