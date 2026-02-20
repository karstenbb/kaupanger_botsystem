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

export interface UpdateProfileBody {
  username?: string;
  email?: string;
  password?: string;
  name?: string;
  position?: string;
  number?: number;
  birthDate?: string;
}

export interface BirthdayPlayer {
  id: string;
  name: string;
  number: number | null;
  position: string | null;
  birthDate: string;
  age: number;
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
  updateProfile: async (body: UpdateProfileBody): Promise<User> => {
    const { data } = await client.put('/auth/profile', body);
    return data;
  },
  getBirthdaysToday: async (): Promise<BirthdayPlayer[]> => {
    const { data } = await client.get('/players/birthdays/today');
    return data;
  },
};
