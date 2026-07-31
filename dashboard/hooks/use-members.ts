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
  segment?: string;
  avatar?: string;
}

interface FetchMembersParams {
  search?: string;
  segment?: string;
  page?: number;
  limit?: number;
}

const mockMembers: Member[] = [
  { id: 'M001', name: 'Nadia Rahman', email: 'nadia.rahman@gmail.com', phone: '01711234567', totalOrders: 14, lifetimeSpent: 18400, joinedDate: '2022-01-15', segment: 'VIP' },
  { id: 'M002', name: 'Tanvir Hossain', email: 'tanvir.hossain@gmail.com', phone: '01819876543', totalOrders: 5, lifetimeSpent: 6200, joinedDate: '2022-03-22', segment: 'Returning' },
  { id: 'M003', name: 'Farhana Ahmed', email: 'farhana.ahmed@gmail.com', phone: '01612345678', totalOrders: 31, lifetimeSpent: 52000, joinedDate: '2021-11-05', segment: 'VIP' },
  { id: 'M004', name: 'Imtiaz Chowdhury', email: 'imtiaz.c@yahoo.com', phone: '01987654321', totalOrders: 8, lifetimeSpent: 11500, joinedDate: '2023-05-10', segment: 'Returning' },
  { id: 'M005', name: 'Sadia Jahan', email: 'sadia.jahan@gmail.com', phone: '01512345678', totalOrders: 2, lifetimeSpent: 2800, joinedDate: '2024-01-20', segment: 'New' },
  { id: 'M006', name: 'Rahim Uddin', email: 'rahim.uddin@gmail.com', phone: '01711111111', totalOrders: 19, lifetimeSpent: 29700, joinedDate: '2021-06-30', segment: 'VIP' },
  { id: 'M007', name: 'Sumaiya Akter', email: 'sumaiya.akter@gmail.com', phone: '01822222222', totalOrders: 6, lifetimeSpent: 8400, joinedDate: '2022-09-14', segment: 'Returning' },
  { id: 'M008', name: 'Karim Sheikh', email: 'karim.sheikh@yahoo.com', phone: '01933333333', totalOrders: 1, lifetimeSpent: 1500, joinedDate: '2024-06-01', segment: 'New' },
  { id: 'M009', name: 'Mitu Begum', email: 'mitu.begum@gmail.com', phone: '01644444444', totalOrders: 22, lifetimeSpent: 35800, joinedDate: '2021-02-18', segment: 'VIP' },
  { id: 'M010', name: 'Rafiq Islam', email: 'rafiq.islam@gmail.com', phone: '01755555555', totalOrders: 7, lifetimeSpent: 9100, joinedDate: '2023-03-27', segment: 'Returning' },
  { id: 'M011', name: 'Runa Khatun', email: 'runa.khatun@gmail.com', phone: '01566666666', totalOrders: 3, lifetimeSpent: 3900, joinedDate: '2024-02-14', segment: 'New' },
  { id: 'M012', name: 'Mahmudul Hasan', email: 'mahmudul.hasan@gmail.com', phone: '01877777777', totalOrders: 11, lifetimeSpent: 16200, joinedDate: '2022-07-08', segment: 'Returning' },
  { id: 'M013', name: 'Sharmin Akter', email: 'sharmin.akter@gmail.com', phone: '01988888888', totalOrders: 25, lifetimeSpent: 41000, joinedDate: '2020-12-25', segment: 'VIP' },
  { id: 'M014', name: 'Borhan Uddin', email: 'borhan.uddin@gmail.com', phone: '01699999999', totalOrders: 4, lifetimeSpent: 5600, joinedDate: '2023-11-03', segment: 'Returning' },
  { id: 'M015', name: 'Jannatul Ferdous', email: 'jannatul.f@gmail.com', phone: '01700000000', totalOrders: 1, lifetimeSpent: 950, joinedDate: '2025-01-07', segment: 'New' },
];

const fetchMembers = async (params?: FetchMembersParams): Promise<Member[]> => {
  try {
    const queryParams: Record<string, string | number> = {
      limit: params?.limit ?? 15,
      page: params?.page ?? 1,
    };
    if (params?.search) queryParams.q = params.search;
    if (params?.segment) queryParams.segment = params.segment;

    const response = await apiClient.get<{ data: unknown[] } | unknown[]>(
      '/api/v1/members',
      { params: queryParams }
    );

    const memberList: unknown[] =
      (response.data as { data: unknown[] })?.data ??
      (Array.isArray(response.data) ? (response.data as unknown[]) : []);

    if (memberList.length > 0) {
      return memberList.map((m) => {
        const member = m as Record<string, unknown>;
        const orders = Array.isArray(member.orders) ? (member.orders as Record<string, unknown>[]) : [];
        const totalOrders = orders.length;
        const lifetimeSpent = orders.reduce(
          (sum: number, o: Record<string, unknown>) => {
            const value = o.value as number | undefined;
            if (typeof value === 'number') return sum + value;
            const totals = o.totals as Record<string, number> | undefined;
            return sum + (totals?.total ?? (o.total as number) ?? 0);
          },
          0
        );

        return {
          id: (member.id || member._id) as string,
          name: (member.name as string) || '',
          email: (member.email as string) || '',
          phone: (member.phone as string) || '',
          totalOrders,
          lifetimeSpent,
          joinedDate: (member.createdAt as string) || new Date().toISOString(),
          segment: (member.segment as string) || undefined,
          avatar: (member.avatar as string) || undefined,
        } as Member;
      });
    }
  } catch (err) {
    console.warn('Members API failed, using mock data:', err);
  }

  // Fallback: filter and paginate mock data
  let result = [...mockMembers];
  if (params?.search) {
    const q = params.search.toLowerCase();
    result = result.filter(
      (m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
    );
  }
  if (params?.segment) {
    result = result.filter((m) => m.segment === params.segment);
  }

  const limit = params?.limit ?? 15;
  const page = params?.page ?? 1;
  return result.slice((page - 1) * limit, page * limit);
};

export function useMembers(params?: FetchMembersParams) {
  return useQuery({
    queryKey: ['members', params],
    queryFn: () => fetchMembers(params),
  });
}
