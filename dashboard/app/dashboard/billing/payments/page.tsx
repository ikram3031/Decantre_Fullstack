'use client';

import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Download, CheckCircle2, XCircle, Clock, CreditCard } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { usePayments, PaymentRecord } from '@/hooks/use-payments';

const METHOD_COLORS: Record<string, string> = {
  bKash: 'bg-pink-500/10 text-pink-600 border-pink-500/30',
  Nagad: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
  Cash: 'bg-green-500/10 text-green-600 border-green-500/30',
  Card: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
};

function getStatusBadge(status: PaymentRecord['status']) {
  switch (status) {
    case 'Completed':
      return (
        <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 gap-1">
          <CheckCircle2 className="h-3 w-3" />Completed
        </Badge>
      );
    case 'Pending':
      return (
        <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 gap-1">
          <Clock className="h-3 w-3" />Pending
        </Badge>
      );
    case 'Failed':
      return (
        <Badge className="bg-red-500/15 text-red-600 border-red-500/30 gap-1">
          <XCircle className="h-3 w-3" />Failed
        </Badge>
      );
  }
}

function getMethodBadge(method: string) {
  const cls = METHOD_COLORS[method] ?? 'bg-muted text-muted-foreground';
  return <Badge className={`${cls} gap-1`}>{method}</Badge>;
}

export default function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');

  const { data: payments = [], isLoading, isError } = usePayments({
    search: searchQuery || undefined,
    status: statusFilter !== 'All' ? statusFilter : undefined,
    method: methodFilter !== 'All' ? methodFilter : undefined,
  });

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        p.customerName.toLowerCase().includes(searchLower) ||
        p.id.toLowerCase().includes(searchLower) ||
        p.invoiceId.toLowerCase().includes(searchLower);
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      const matchesMethod = methodFilter === 'All' || p.method === methodFilter;
      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [payments, searchQuery, statusFilter, methodFilter]);

  const totalCollected = useMemo(
    () =>
      payments
        .filter((p) => p.status === 'Completed')
        .reduce((s, p) => s + p.amount, 0),
    [payments]
  );

  const totalPending = useMemo(
    () =>
      payments
        .filter((p) => p.status === 'Pending')
        .reduce((s, p) => s + p.amount, 0),
    [payments]
  );

  const totalFailed = useMemo(
    () =>
      payments
        .filter((p) => p.status === 'Failed')
        .reduce((s, p) => s + p.amount, 0),
    [payments]
  );

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
          <p className="text-sm text-muted-foreground mt-1">Track all payment transactions</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <div className="bg-card border rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Collected</p>
            <p className="text-xl font-bold">৳{totalCollected.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-xl font-bold">৳{totalPending.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
            <XCircle className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Failed</p>
            <p className="text-xl font-bold">৳{totalFailed.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b bg-muted/30">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer, payment ID or invoice..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={methodFilter} onValueChange={(v) => setMethodFilter(v ?? 'All')}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Methods</SelectItem>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="Card">Card</SelectItem>
              <SelectItem value="bKash">bKash</SelectItem>
              <SelectItem value="Nagad">Nagad</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'All')}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment ID</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Loading payments...
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Failed to load payments. Please refresh.
                  </TableCell>
                </TableRow>
              ) : filtered.length > 0 ? (
                filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-semibold flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      {p.id}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{p.invoiceId}</TableCell>
                    <TableCell>{p.customerName}</TableCell>
                    <TableCell>{getMethodBadge(p.method)}</TableCell>
                    <TableCell>{p.date}</TableCell>
                    <TableCell className="font-medium">৳{p.amount.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(p.status)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No payments found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
