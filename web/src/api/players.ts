import client from './client';
import type { Player } from '../types';

export const playersApi = {
  getAll: async (): Promise<Player[]> => {
    const { data } = await client.get('/players');
    return data;
  },
  getById: async (id: string): Promise<Player> => {
    const { data } = await client.get(`/players/${id}`);
    return data;
  },
  create: async (body: { name: string; birthDate?: string; number?: number; position?: string }): Promise<Player> => {
    const { data } = await client.post('/players', body);
    return data;
  },
  update: async (id: string, body: Partial<{ name: string; number: number; position: string; birthDate: string | null }>): Promise<Player> => {
    const { data } = await client.put(`/players/${id}`, body);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await client.delete(`/players/${id}`);
  },
};
