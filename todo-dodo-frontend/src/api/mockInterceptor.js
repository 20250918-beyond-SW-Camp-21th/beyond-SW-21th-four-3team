import { initialTodos } from './mockData';

// Maintain state in module scope
let mockDB = {
    todos: JSON.parse(JSON.stringify(initialTodos)) // Deep copy to avoid reference issues
};

// Helper to simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const setupMockAdapter = (axiosInstance) => {
    console.log('[MockInterceptor] Initialized');

    // Replace the adapter to intercept requests
    axiosInstance.defaults.adapter = async (config) => {
        await delay(300); // Simulate network latency

        const { url, method, data } = config;
        const httpMethod = method.toLowerCase();

        console.log(`[MockInterceptor] ${httpMethod.toUpperCase()} ${url}`, data ? '(with data)' : '');

        // Extract endpoint by removing baseURL if present, or just identifying the resource
        // Logic: Look for the segment after /api/v1 or just check endsWith
        // Best approach: Parse URL relative to dummy base if needed, or just match substrings.

        // Normalize path: Remove base URL /api/v1 if it exists
        let path = url;
        if (path.includes('/api/v1')) {
            path = path.split('/api/v1')[1];
        }

        // Remove query params for matching
        const pathWithoutQuery = path.split('?')[0];

        // --- TODO ROUTES ---
        // Match /todo or /todo/
        if (pathWithoutQuery === '/todo' || pathWithoutQuery === '/todo/') {
            if (httpMethod === 'get') {
                return {
                    data: mockDB.todos,
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config,
                    request: {}
                };
            }

            if (httpMethod === 'post') {
                let payload = data;
                try {
                    if (typeof data === 'string') {
                        payload = JSON.parse(data);
                    }
                } catch (e) {
                    console.error('[MockInterceptor] Failed to parse payload', e);
                }

                const newTodo = {
                    ...payload,
                    id: mockDB.todos.length > 0 ? Math.max(...mockDB.todos.map(t => t.id)) + 1 : 1,
                    status: 'Todo',
                    date: payload.date || new Date()
                };

                mockDB.todos.push(newTodo);

                return {
                    data: newTodo,
                    status: 201,
                    statusText: 'Created',
                    headers: {},
                    config,
                    request: {}
                };
            }
        }

        // Match /todo/:id for PUT/DELETE
        const todoIdMatch = pathWithoutQuery.match(/^\/todo\/(\d+)$/);
        if (todoIdMatch) {
            const id = parseInt(todoIdMatch[1]);

            if (httpMethod === 'put') {
                let payload = data;
                try {
                    if (typeof data === 'string') {
                        payload = JSON.parse(data);
                    }
                } catch (e) {
                    console.error('[MockInterceptor] Failed to parse payload', e);
                }

                const index = mockDB.todos.findIndex(t => t.id === id);
                if (index !== -1) {
                    mockDB.todos[index] = { ...mockDB.todos[index], ...payload };
                    return {
                        data: mockDB.todos[index],
                        status: 200,
                        statusText: 'OK',
                        headers: {},
                        config,
                        request: {}
                    };
                }
            }

            if (httpMethod === 'delete') {
                const index = mockDB.todos.findIndex(t => t.id === id);
                if (index !== -1) {
                    mockDB.todos.splice(index, 1);
                    return {
                        data: true,
                        status: 200,
                        statusText: 'OK',
                        headers: {},
                        config,
                        request: {}
                    };
                }
            }
        }

        console.warn(`[MockInterceptor] Unhandled request: ${httpMethod} ${url}`);

        // For unhandled requests, return 404
        const error = new Error('Request failed with status code 404');
        error.response = {
            data: null,
            status: 404,
            statusText: 'Not Found',
            headers: {},
            config,
            request: {}
        };
        throw error;
    };
};
