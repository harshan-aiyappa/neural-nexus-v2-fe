import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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
    extract: async (text: string) => {
        const response = await axios.post(`${API_BASE_URL}/extract`, { text });
        return response.data;
    },

    ingest: async (nodes: Node[], relationships: Relationship[], folderId: string) => {
        const response = await axios.post(`${API_BASE_URL}/ingest`, {
            nodes,
            relationships,
            folder_id: folderId
        });
        return response.data;
    },

    chat: async (message: string) => {
        const response = await axios.post(`${API_BASE_URL}/chat`, { message });
        return response.data;
    }
};
