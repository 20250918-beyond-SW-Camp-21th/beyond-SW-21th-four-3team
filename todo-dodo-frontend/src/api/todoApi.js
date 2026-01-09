import client from './client';

export const todoApi = {
    // Get user's todos
    fetchAll: async () => {
        try {
            const response = await client.get('/todo/me');
            return response.data; // ApiResult structure, let store handle .data check if needed, or return response.data.data if we want to unwrap here. 
            // Controller: return ApiResult.success(list). 
            // ApiResult usually has { success: true, response: ..., error: ... } or { data: ... }
            // Looking at AuthController: ApiResult.success(userId, "msg").
            // Let's assume standard 'data' field. 
            // If I return response.data, it is the full JSON object.
            // The Store expects the list.
            // I will return response.data.data to be safe/direct.
        } catch (error) {
            console.error('Error fetching todos:', error);
            throw error;
        }
    },

    // Create new todo
    create: async (todoData) => {
        try {
            const response = await client.post('/todo', todoData);
            return response.data; // Returns ApiResult<Long>
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
    },

    // Change completed status
    changeCompleted: async (id, completed) => {
        try {
            await client.patch(`/todo/${id}/complete?completed=${completed}`);
            return true;
        } catch (error) {
            console.error('Error changing completed status:', error);
            throw error;
        }
    }
};
