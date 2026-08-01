'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrders } from '@/hooks/use-orders';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

import { apiClient } from '@/lib/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';

interface OrdersTableProps {
  searchQuery: string;
  statusFilter: string;
}

import type { Order, OrderDetails, OrderItem } from '@/types';

export function OrdersTable({ searchQuery, statusFilter }: OrdersTableProps) {
  const queryClient = useQueryClient();

  const { data: orders, isLoading, isError, error } = useOrders({
    search: searchQuery,
    status: statusFilter !== 'All' ? statusFilter : undefined,
  });

  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editFulfillmentStatus, setEditFulfillmentStatus] = useState<'Pending' | 'Processing' | 'Shipped' | 'Cancelled'>('Pending');
  const [editPaymentStatus, setEditPaymentStatus] = useState<'Paid' | 'Pending' | 'Failed'>('Pending');

  const handleUpdateStatus = async (order: Order, newStatus: string) => {
    try {
      await apiClient.put(`/api/v1/orders/${order.id}`, { status: newStatus });
      toast.success(`Order ${order.orderNumber} status updated to ${newStatus}.`);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    } catch (err: unknown) {
      console.error(err);
      toast.error('Failed to update order status.');
    }
  };

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; orderNumber: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteOrder = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/api/v1/orders/${deleteTarget.id}`);
      toast.success(`Order ${deleteTarget.orderNumber} deleted successfully.`);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setDeleteTarget(null);
    } catch (err: unknown) {
      console.error(err);
      toast.error('Failed to delete order.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setEditFulfillmentStatus(order.fulfillmentStatus);
    setEditPaymentStatus(order.paymentStatus);
    setIsEditOpen(true);
  };

  const handleViewDetails = async (order: Order) => {
    setSelectedOrder(order);
    setDetailsLoading(true);
    setIsDetailsOpen(true);

    try {
      const response = await apiClient.get<{ data?: OrderDetails }>(`/api/v1/orders/${order.id}`);
      if (response.data?.data) {
        setSelectedOrder(response.data.data);
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error('Failed to load order details.');
      setIsDetailsOpen(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleEditOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsSubmitting(true);
    try {
      let apiStatus = 'received';
      if (editFulfillmentStatus === 'Processing') apiStatus = 'processing';
      else if (editFulfillmentStatus === 'Shipped') apiStatus = 'shipped';
      else if (editFulfillmentStatus === 'Cancelled') apiStatus = 'cancelled';

      await apiClient.put(`/api/v1/orders/${selectedOrder.id}`, {
        status: apiStatus,
      });

      toast.success(`Order ${selectedOrder.orderNumber} updated successfully!`);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setIsEditOpen(false);
    } catch (err: unknown) {
      console.error(err);
      toast.error('Failed to update order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Paid</Badge>;
      case 'Pending':
        return <Badge variant="secondary" className="bg-amber-500/20 text-amber-600 hover:bg-amber-500/30 dark:text-amber-400">Pending</Badge>;
      case 'Failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getFulfillmentBadge = (status: string) => {
    switch (status) {
      case 'Shipped':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Shipped</Badge>;
      case 'Processing':
        return <Badge variant="secondary" className="bg-blue-500/20 text-blue-600 hover:bg-blue-500/30 dark:text-blue-400">Processing</Badge>;
      case 'Cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'Pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isError) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to fetch orders. {error instanceof Error ? error.message : 'Unknown error occurred.'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Order ID</TableHead>
            <TableHead>Customer Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Fulfillment</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></TableCell>
              </TableRow>
            ))
          ) : orders && orders.length > 0 ? (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-semibold">{order.orderNumber}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                <TableCell>৳{order.totalAmount.toFixed(2)}</TableCell>
                <TableCell>{getPaymentBadge(order.paymentStatus)}</TableCell>
                <TableCell>{getFulfillmentBadge(order.fulfillmentStatus)}</TableCell>
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
                      <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditOrderClick(order)}>
                        Edit Order
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive cursor-pointer"
                        onClick={() => setDeleteTarget({ id: order.id, orderNumber: order.orderNumber })}
                      >
                        Delete Order
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No orders found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Full information for order {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          {detailsLoading ? (
            <div className="space-y-4 pt-2 text-sm">
              <div className="h-16 rounded-xl bg-muted animate-pulse" />
              <div className="h-12 rounded-xl bg-muted animate-pulse" />
            </div>
          ) : selectedOrder ? (
            <div className="space-y-4 pt-2 text-sm">
              <div className="grid grid-cols-2 gap-2 border-b pb-2">
                <div>
                  <span className="text-xs text-muted-foreground block">Order Number</span>
                  <span className="font-medium">{selectedOrder.orderNumber || selectedOrder._id}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Order ID</span>
                  <span className="font-medium">{selectedOrder.id || selectedOrder._id || 'N/A'}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b pb-2">
                <div>
                  <span className="text-xs text-muted-foreground block">Date</span>
                  <span className="font-medium">{new Date(selectedOrder.createdAt || selectedOrder.date).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Payment Method</span>
                  <span className="font-medium">{selectedOrder.paymentMethod || 'N/A'}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b pb-2">
                <div>
                  <span className="text-xs text-muted-foreground block">Customer Name</span>
                  <span className="font-medium">{selectedOrder.customer?.fullName || selectedOrder.customerName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Phone</span>
                  <span className="font-medium">{selectedOrder.customer?.phone || 'N/A'}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b pb-2">
                <div>
                  <span className="text-xs text-muted-foreground block">Email</span>
                  <span className="font-medium">{selectedOrder.customer?.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Address</span>
                  <span className="font-medium">
                    {selectedOrder.customer?.address || 'N/A'}
                    {selectedOrder.customer?.city ? `, ${selectedOrder.customer.city}` : ''}
                    {selectedOrder.customer?.thana ? `, ${selectedOrder.customer.thana}` : ''}
                    {selectedOrder.customer?.district ? `, ${selectedOrder.customer.district}` : ''}
                    {selectedOrder.customer?.zip ? `, ${selectedOrder.customer.zip}` : ''}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b pb-2">
                <div>
                  <span className="text-xs text-muted-foreground block">Shipping Address</span>
                  <span className="font-medium">
                    {selectedOrder.shippingAddress?.address || selectedOrder.shippingAddress?.line1 || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Shipping City</span>
                  <span className="font-medium">{selectedOrder.shippingAddress?.city || 'N/A'}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b pb-2">
                <div>
                  <span className="text-xs text-muted-foreground block">Payment Status</span>
                  <span>{getPaymentBadge(selectedOrder.paymentStatus || (selectedOrder.status === 'completed' ? 'Paid' : 'Pending'))}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Fulfillment Status</span>
                  <span>{getFulfillmentBadge(selectedOrder.fulfillmentStatus || selectedOrder.status)}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b pb-2">
                <div>
                  <span className="text-xs text-muted-foreground block">Subtotal</span>
                  <span className="font-medium">৳{(selectedOrder.totals?.subtotal ?? 0).toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Tax</span>
                  <span className="font-medium">৳{(selectedOrder.totals?.tax ?? 0).toFixed(2)}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b pb-2">
                <div>
                  <span className="text-xs text-muted-foreground block">Shipping Fee</span>
                  <span className="font-medium">৳{(selectedOrder.totals?.shippingFee ?? selectedOrder.shippingTotalAmount ?? 0).toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Discount</span>
                  <span className="font-medium">৳{(selectedOrder.discountTotalAmount ?? 0).toFixed(2)}</span>
                </div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Total Amount</span>
                <span className="text-lg font-bold text-primary">৳{(selectedOrder.totals?.total ?? selectedOrder.totalAmount ?? 0).toFixed(2)}</span>
              </div>
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground block">Items</span>
                  <div className="rounded-lg border border-border bg-surface p-3 space-y-2">
                    {selectedOrder.items.map((item: OrderItem, index: number) => (
                      <div key={index} className="grid grid-cols-[1.5fr_0.7fr_0.8fr] gap-2 text-sm">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-muted-foreground">Qty: {item.quantity}</div>
                        <div className="text-right">৳{((item.unitPrice ?? item.price ?? 0) * (item.quantity ?? 1)).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
          <DialogFooter>
            <Button onClick={() => setIsDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Order Status</DialogTitle>
            <DialogDescription>
              Update fulfillment and status for order {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditOrderSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Fulfillment Status</label>
              <Select value={editFulfillmentStatus} onValueChange={(val: string | null) => setEditFulfillmentStatus((val as 'Pending' | 'Processing' | 'Shipped' | 'Cancelled') ?? 'Pending')}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Payment Status</label>
              <Select value={editPaymentStatus} onValueChange={(val: string | null) => setEditPaymentStatus((val as 'Paid' | 'Pending' | 'Failed') ?? 'Pending')}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDeleteOrder}
        isDeleting={isDeleting}
        title="Delete Order"
        description={`Are you sure you want to delete order ${deleteTarget?.orderNumber ?? ''}?`}
      />
    </div>
  );
}
