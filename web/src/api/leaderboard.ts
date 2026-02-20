import client from './client';
import type { LeaderboardEntry } from '../types';

export const leaderboardApi = {
  get: async (): Promise<LeaderboardEntry[]> => {
    const { data } = await client.get('/leaderboard');
    return data;
  },
};
