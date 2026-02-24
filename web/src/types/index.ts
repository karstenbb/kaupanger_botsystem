export interface User {
  id: string;
  username: string;
  email?: string;
  role: 'ADMIN' | 'USER';
  playerId: string | null;
  player?: Player & {
    birthDate?: string;
  };
}

export interface Player {
  id: string;
  name: string;
  number: number | null;
  position: string | null;
  avatarUrl?: string | null;
  totalFines: number;
  totalPaid: number;
  totalUnpaid: number;
  fineCount: number;
  fines?: Fine[];
}

export interface FineType {
  id: string;
  name: string;
  amount: number;
  description: string | null;
  _count?: { fines: number };
}

export interface Fine {
  id: string;
  amount: number;
  reason: string | null;
  status: 'UNPAID' | 'PAID';
  date: string;
  createdAt: string;
  paidAt: string | null;
  player: { id: string; name: string; number: number | null };
  fineType: { id: string; name: string };
  issuedBy: { id: string; username: string } | null;
}

export interface DashboardData {
  stats: {
    totalAmount: number;
    totalFinesCount: number;
    unpaidAmount: number;
    unpaidCount: number;
    paidAmount: number;
    paidCount: number;
    totalPlayers: number;
    totalFineTypes: number;
  };
  recentFines: Fine[];
  monthlyData: Record<string, number>;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  number: number | null;
  position: string | null;
  avatarUrl: string | null;
  totalAmount: number;
  unpaidAmount: number;
  fineCount: number;
}

export interface LoginResponse {
  token: string;
  user: User;
}
