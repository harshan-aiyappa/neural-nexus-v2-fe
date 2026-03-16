import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://10.10.20.122:8000';

// Create axios instance with base URL
const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
});

// Add interceptor to include token in all requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('nexus_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export interface Node {
    id: string;
    label: string;
    properties?: any;
}

export interface Relationship {
    source: string;
    target: string;
    type: string;
    properties?: any;
}

export const nexusApi = {
    // Auth
    login: async (email: string, password: string) => {
        const params = new URLSearchParams();
        params.append('username', email);
        params.append('password', password);
        const response = await api.post('/auth/login', params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        if (response.data.access_token) {
            localStorage.setItem('nexus_token', response.data.access_token);
            localStorage.setItem('user_role', response.data.role);
        }
        return response.data;
    },
    register: async (email: string, password: string, fullName: string) => {
        const response = await api.post('/auth/register', { 
            email, 
            password, 
            full_name: fullName, 
            role: 'RESEARCHER' 
        });
        if (response.data.access_token) {
            localStorage.setItem('nexus_token', response.data.access_token);
            localStorage.setItem('user_role', response.data.role);
        }
        return response.data;
    },
    logout: () => {
        localStorage.removeItem('nexus_token');
        localStorage.removeItem('user_role');
    },

    // Topics / Folders
    getFolders: async () => {
        const response = await api.get('/folders/');
        return response.data;
    },
    createFolder: async (name: string, description: string = "New research topic") => {
        const response = await api.post('/folders', { name, description });
        return response.data;
    },
    deleteFolder: async (folderId: string) => {
        const response = await api.delete(`/folders/${folderId}`);
        return response.data;
    },

    // Extraction & Ingestion
    extract: async (text: string) => {
        const response = await api.post('/ingest/extract', { text }); // Adjusted to modular path
        return response.data;
    },
    ingest: async (nodes: Node[], relationships: Relationship[], folderId: string) => {
        const response = await api.post('/ingest/ingest', { // Adjusted to modular path
            nodes,
            relationships,
            folder_id: folderId
        });
        return response.data;
    },
    uploadCypherFile: async (formData: FormData, folderId: string) => {
        // Append folder_id to form data
        formData.append('folder_id', folderId);
        const response = await api.post('/ingest/upload-cypher', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    uploadCypherText: async (cypher: string, folderId: string) => {
        const response = await api.post('/ingest/cypher', { cypher, folder_id: folderId });
        return response.data;
    },

    // Discovery & Stats
    chat: async (message: string, contextFolder?: string) => {
        const response = await api.post('/chat', { message, context_folder: contextFolder });
        return response.data;
    },
    getStats: async () => {
        const response = await api.get('/graph/stats/');
        return response.data;
    },
    getGraph: async (folder?: string) => {
        const url = folder ? `/graph/full?folder=${folder}` : '/graph/full/';
        const response = await api.get(url);
        return response.data;
    },
    getActivity: async () => {
        const response = await api.get('/graph/activity/');
        return response.data;
    },

    // Settings & Resilience (Phase 6)
    updateApiKey: async (name: string, value: string) => {
        const response = await api.post('/settings/update-key', { key_name: name, key_value: value });
        return response.data;
    },
    getSystemStatus: async () => {
        const response = await api.get('/settings/status');
        return response.data;
    },
    verifyApiKey: async (value: string) => {
        const response = await api.post('/settings/verify-key', { key_value: value });
        return response.data;
    },

    // Analytics (Phase 14)
    getAnalyticsFlow: async () => {
        const response = await api.get('/analytics/flow');
        return response.data;
    },
    getAnalyticsMetrics: async () => {
        const response = await api.get('/analytics/metrics');
        return response.data;
    },
    deepAnalyze: async (nodeId: string, folderSlug?: string, nodeName?: string, nodeLabel?: string) => {
        const response = await api.post('/graph/deep-analyze', { 
            node_id: nodeId, 
            folder_slug: folderSlug,
            node_name: nodeName,
            node_label: nodeLabel
        });
        return response.data;
    }
};
