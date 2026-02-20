import client from './client';
import type { Fine } from '../types';

export const finesApi = {
  getAll: async (params?: { playerId?: string; status?: string }): Promise<Fine[]> => {
    const { data } = await client.get('/fines', { params });
    return data;
  },
  create: async (body: {
    playerId: string;
    fineTypeId: string;
    amount?: number;
    reason?: string;
  }): Promise<Fine> => {
    const { data } = await client.post('/fines', body);
    return data;
  },
  updateStatus: async (id: string, status: 'PAID' | 'UNPAID'): Promise<Fine> => {
    const { data } = await client.patch(`/fines/${id}/status`, { status });
    return data;
  },
  bulkCreate: async (body: {
    playerIds: string[];
    fineTypeId: string;
    reason?: string;
    amount?: number;
  }): Promise<Fine[]> => {
    const { data } = await client.post('/fines/bulk', body);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await client.delete(`/fines/${id}`);
  },
};
