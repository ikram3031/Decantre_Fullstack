'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useSystemUsers } from '@/hooks/use-users';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { toast } from 'sonner';

interface SystemUsersTableProps {
  searchQuery: string;
  roleFilter: string;
}

import { apiClient } from '@/lib/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';

export function SystemUsersTable({ searchQuery, roleFilter }: SystemUsersTableProps) {
  const queryClient = useQueryClient();

  const { data: users, isLoading, isError, error } = useSystemUsers({
    search: searchQuery,
    role: roleFilter !== 'All' ? roleFilter : undefined,
  });

  const [toggling, setToggling] = useState<string | null>(null);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    setToggling(id);
    const newActive = currentStatus !== 'Active';
    try {
      await apiClient.put(`/api/v1/users/${id}`, { isActive: newActive });
      toast.success(`User status updated to ${newActive ? 'Active' : 'Inactive'}.`);
      queryClient.invalidateQueries({ queryKey: ['system-users'] });
    } catch (err: any) {
      toast.error('Failed to update user status.');
    } finally {
      setToggling(null);
    }
  };

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  const handleRevokeAccess = async () => {
    if (!deleteTarget) return;
    setIsRevoking(true);
    try {
      await apiClient.delete(`/api/v1/users/${deleteTarget.id}`);
      toast.success(`Access revoked for ${deleteTarget.name}.`);
      queryClient.invalidateQueries({ queryKey: ['system-users'] });
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error('Failed to revoke access.');
    } finally {
      setIsRevoking(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Admin':
        return <Badge variant="default">{role}</Badge>;
      case 'Manager':
        return <Badge variant="secondary">{role}</Badge>;
      case 'Editor':
        return <Badge variant="outline">{role}</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  if (isError) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to fetch system users. {error instanceof Error ? error.message : 'Unknown error occurred.'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Assigned Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-10 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></TableCell>
              </TableRow>
            ))
          ) : users && users.length > 0 ? (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id={`status-${user.id}`} 
                      checked={user.status === 'Active'}
                      onCheckedChange={() => handleToggleStatus(user.id, user.status)}
                      disabled={toggling === user.id}
                    />
                    <label 
                      htmlFor={`status-${user.id}`} 
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {user.status}
                    </label>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(user.lastLogin).toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger render={
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    } />
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleToggleStatus(user.id, user.status)}>
                        Toggle Active Status
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive cursor-pointer"
                        onClick={() => setDeleteTarget({ id: user.id, name: user.name })}
                      >
                        Revoke Access
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No system users found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleRevokeAccess}
        isDeleting={isRevoking}
        title="Revoke Access"
        description={`Are you sure you want to revoke access for ${deleteTarget?.name ?? ''}?`}
      />
    </div>
  );
}
