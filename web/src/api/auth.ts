import client from './client';
import type { LoginResponse, User } from '../types';

export interface RegisterBody {
  username: string;
  password: string;
  name: string;
  birthDate: string;
  position: string;
  number: number;
}

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const { data } = await client.post('/auth/login', { username, password });
    return data;
  },
  register: async (body: RegisterBody): Promise<LoginResponse> => {
    const { data } = await client.post('/auth/register', body);
    return data;
  },
  getProfile: async (): Promise<User> => {
    const { data } = await client.get('/auth/profile');
    return data;
  },
};
