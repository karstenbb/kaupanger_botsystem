import client from './client';
import type { LeaderboardEntry } from '../types';

export const leaderboardApi = {
  get: async (period: 'month' | 'year' = 'month'): Promise<LeaderboardEntry[]> => {
    const { data } = await client.get('/leaderboard', { params: { period } });
    return data;
  },
};
