'use client';

import { useState } from 'react';
import { SystemUsersTable } from '@/components/dashboard/system-users-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, UserPlus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">System Users</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite New User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New User</DialogTitle>
              <DialogDescription>
                Invite a new user to access the admin dashboard.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 flex items-center justify-center border-2 border-dashed rounded-md mt-4 text-muted-foreground">
              Form Component Placeholder
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={roleFilter} onValueChange={(value: string | null) => setRoleFilter(value ?? 'All')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Roles</SelectItem>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="Manager">Manager</SelectItem>
            <SelectItem value="Editor">Editor</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="bg-card text-card-foreground shadow-sm border rounded-lg">
        <div className="p-6">
          <SystemUsersTable searchQuery={searchQuery} roleFilter={roleFilter} />
        </div>
      </div>
    </div>
  );
}
