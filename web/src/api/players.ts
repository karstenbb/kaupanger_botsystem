import client from './client';
import type { Player } from '../types';

export interface PlayerWriteBody {
  name: string;
  birthDate?: string | null;
  number?: number | null;
  position?: string | null;
  avatarUrl?: string | null;
}

export const playersApi = {
  getAll: async (): Promise<Player[]> => {
    const { data } = await client.get('/players');
    return data;
  },
  getById: async (id: string): Promise<Player> => {
    const { data } = await client.get(`/players/${id}`);
    return data;
  },
  create: async (body: PlayerWriteBody): Promise<Player> => {
    const { data } = await client.post('/players', body);
    return data;
  },
  update: async (id: string, body: Partial<PlayerWriteBody>): Promise<Player> => {
    const { data } = await client.put(`/players/${id}`, body);
    return data;
  },
  updateRole: async (id: string, role: 'ADMIN' | 'USER'): Promise<{ id: string; username: string; role: string }> => {
    const { data } = await client.put(`/players/${id}/role`, { role });
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await client.delete(`/players/${id}`);
  },
};
