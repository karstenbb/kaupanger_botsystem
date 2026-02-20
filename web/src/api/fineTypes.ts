import client from './client';
import type { FineType } from '../types';

export const fineTypesApi = {
  getAll: async (): Promise<FineType[]> => {
    const { data } = await client.get('/fine-types');
    return data;
  },
  create: async (body: { name: string; amount: number; description?: string }): Promise<FineType> => {
    const { data } = await client.post('/fine-types', body);
    return data;
  },
  update: async (id: string, body: Partial<{ name: string; amount: number; description: string }>): Promise<FineType> => {
    const { data } = await client.put(`/fine-types/${id}`, body);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await client.delete(`/fine-types/${id}`);
  },
};
