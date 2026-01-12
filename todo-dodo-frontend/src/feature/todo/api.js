export const todoApi = {
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
