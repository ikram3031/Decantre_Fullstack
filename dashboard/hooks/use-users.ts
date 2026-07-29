import { useQuery } from '@tanstack/react-query';

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Editor';
  status: 'Active' | 'Inactive';
  lastLogin: string;
  avatar?: string;
}

interface FetchUsersParams {
  search?: string;
  role?: string;
}

const mockUsers: SystemUser[] = [
  {
    id: 'U001',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: '2023-10-25T10:30:00Z',
  },
  {
    id: 'U002',
    name: 'Sarah Smith',
    email: 'sarah.manager@example.com',
    role: 'Manager',
    status: 'Active',
    lastLogin: '2023-10-24T14:15:00Z',
  },
  {
    id: 'U003',
    name: 'Tom Editor',
    email: 'tom.editor@example.com',
    role: 'Editor',
    status: 'Inactive',
    lastLogin: '2023-09-15T09:00:00Z',
  },
];

const fetchSystemUsers = async (params?: FetchUsersParams): Promise<SystemUser[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  let result = [...mockUsers];
  if (params?.search) {
    const q = params.search.toLowerCase();
    result = result.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }
  if (params?.role && params.role !== 'All') {
    result = result.filter(u => u.role === params.role);
  }
  
  return result;
};

export function useSystemUsers(params?: FetchUsersParams) {
  return useQuery({
    queryKey: ['system-users', params],
    queryFn: () => fetchSystemUsers(params),
  });
}
