import axios from 'axios';
import { setupMockAdapter } from './mockInterceptor';

const client = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Activate Mock Adapter
setupMockAdapter(client);

export default client;
