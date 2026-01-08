export const todoApi = {
    getTodos: async () => {
        // Mock data
        return [
            { id: 1, title: 'TODOLIST 1', status: 'Todo' },
            { id: 2, title: 'TODOLIST 2', status: 'In Progress' },
            { id: 3, title: 'TODOLIST 3', status: 'Done' },
            { id: 4, title: 'TODOLIST 4', status: 'Todo' }
        ];
    },
    getTodo: async (id) => {
        return { id, title: `TODOLIST ${id}`, content: 'Sample content...' };
    },
    createTodo: async (todo) => {
        console.log('Create', todo);
        return { success: true };
    },
    updateTodo: async (id, todo) => {
        console.log('Update', id, todo);
        return { success: true };
    }
};
