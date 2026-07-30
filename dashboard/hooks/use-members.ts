import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  lifetimeSpent: number;
  joinedDate: string;
  avatar?: string;
}

interface FetchMembersParams {
  search?: string;
  segment?: string;
}

const mockMembers: Member[] = [
  {
    id: 'M001',
    name: 'Olivia Martin',
    email: 'olivia.martin@email.com',
    phone: '+1 (555) 123-4567',
    totalOrders: 12,
    lifetimeSpent: 1250.00,
    joinedDate: '2022-01-15',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80',
  },
  {
    id: 'M002',
    name: 'Jackson Lee',
    email: 'jackson.lee@email.com',
    phone: '+1 (555) 987-6543',
    totalOrders: 5,
    lifetimeSpent: 345.50,
    joinedDate: '2022-03-22',
  },
  {
    id: 'M003',
    name: 'Isabella Nguyen',
    email: 'isabella.nguyen@email.com',
    phone: '+1 (555) 456-7890',
    totalOrders: 28,
    lifetimeSpent: 4500.25,
    joinedDate: '2021-11-05',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&q=80',
  },
  {
    id: 'M004',
    name: 'William Chen',
    email: 'william.chen@email.com',
    phone: '+1 (555) 789-0123',
    totalOrders: 8,
    lifetimeSpent: 890.00,
    joinedDate: '2023-05-10',
  },
];

const fetchMembers = async (params?: FetchMembersParams): Promise<Member[]> => {
  try {
    const queryParams: any = {};
    if (params?.search) queryParams.q = params.search;

    const response = await apiClient.get<any>('/api/v1/members', { params: queryParams });
    const memberList = response.data?.data || (Array.isArray(response.data) ? response.data : []);

    if (memberList.length > 0) {
      return memberList.map((m: any) => {
        const totalOrders = m.orders ? m.orders.length : 0;
        const lifetimeSpent = m.orders 
          ? m.orders.reduce((sum: number, o: any) => sum + (o.totals?.total || o.total || 0), 0) 
          : 0;

        return {
          id: m.id || m._id,
          name: m.name || '',
          email: m.email || '',
          phone: m.phone || '',
          totalOrders,
          lifetimeSpent,
          joinedDate: m.createdAt || new Date().toISOString(),
          avatar: m.avatar || undefined,
        };
      });
    }
  } catch (err) {
    console.warn('Backend API members request failed, using fallback mock data:', err);
  }

  // Fallback to mockMembers
  let result = [...mockMembers];
  if (params?.search) {
    const q = params.search.toLowerCase();
    result = result.filter(m => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
  }

  return result;
};

export function useMembers(params?: FetchMembersParams) {
  return useQuery({
    queryKey: ['members', params],
    queryFn: () => fetchMembers(params),
  });
}
