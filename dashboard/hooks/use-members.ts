import { useQuery } from '@tanstack/react-query';

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
  },
];

const fetchMembers = async (params?: FetchMembersParams): Promise<Member[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
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
