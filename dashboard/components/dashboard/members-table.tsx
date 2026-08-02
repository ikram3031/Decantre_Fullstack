'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useMembers } from '@/hooks/use-members';
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

import { apiClient } from '@/lib/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';

interface MembersTableProps {
  searchQuery: string;
  segmentFilter: string;
  page?: number;
  onTotalPagesChange?: (totalPages: number) => void;
}

export function MembersTable({ searchQuery, segmentFilter, page = 1, onTotalPagesChange }: MembersTableProps) {
  const queryClient = useQueryClient();

  const { data: responseData, isLoading, isError, error } = useMembers({
    search: searchQuery,
    segment: segmentFilter !== 'All' ? segmentFilter : undefined,
    page,
    limit: 15,
  });

  const members = responseData?.data ?? [];
  const totalPages = responseData?.meta?.totalPages ?? 1;

  useEffect(() => {
    if (onTotalPagesChange && responseData?.meta) {
      onTotalPagesChange(totalPages);
    }
  }, [totalPages, onTotalPagesChange, responseData]);

  const handleViewProfile = (member: any) => {
    toast.info(`Viewing profile for ${member.name}`);
  };

  const handleSendMessage = (member: any) => {
    toast.info(`Preparing message for ${member.email}`);
  };

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteMember = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/api/v1/members/${deleteTarget.id}`);
      toast.success(`Member ${deleteTarget.name} deleted.`);
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error('Failed to delete member.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isError) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to fetch members. {error instanceof Error ? error.message : 'Unknown error occurred.'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px] min-w-[160px]">Customer</TableHead>
            <TableHead className="w-[200px]">Email</TableHead>
            <TableHead className="w-[130px]">Phone</TableHead>
            <TableHead className="w-[100px] text-right">Total Orders</TableHead>
            <TableHead className="w-[130px] text-right">Lifetime Spent</TableHead>
            <TableHead className="w-[110px]">Joined Date</TableHead>
            <TableHead className="w-[60px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 15 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></TableCell>
              </TableRow>
            ))
          ) : members && members.length > 0 ? (
            members.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="max-w-[200px]">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-9 w-9 flex-shrink-0">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium truncate" title={member.name}>{member.name}</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px]">
                  <span className="truncate block text-muted-foreground" title={member.email}>{member.email}</span>
                </TableCell>
                <TableCell className="w-[130px] text-muted-foreground whitespace-nowrap">{member.phone}</TableCell>
                <TableCell className="text-right w-[100px]">{member.totalOrders}</TableCell>
                <TableCell className="text-right w-[130px] font-medium whitespace-nowrap">৳{member.lifetimeSpent.toFixed(2)}</TableCell>
                <TableCell className="w-[110px] whitespace-nowrap">{new Date(member.joinedDate).toLocaleDateString()}</TableCell>
                <TableCell className="text-right w-[60px]">
                  <DropdownMenu>
                    <DropdownMenuTrigger render={
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    } />
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleViewProfile(member)}>
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSendMessage(member)}>
                        Send Message
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive cursor-pointer"
                        onClick={() => setDeleteTarget({ id: member.id, name: member.name })}
                      >
                        Delete Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No members found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDeleteMember}
        isDeleting={isDeleting}
        title="Delete Member"
        description={`Are you sure you want to delete member ${deleteTarget?.name ?? ''}?`}
      />
    </div>
  );
}
