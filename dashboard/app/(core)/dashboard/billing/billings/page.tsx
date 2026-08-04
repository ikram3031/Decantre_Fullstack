'use client';

import { useState } from 'react';
import { Input } from '@/components/core/ui/input';
import { Button } from '@/components/core/ui/button';
import { Search, Download, CheckCircle2, XCircle, Clock, FileText } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/core/ui/select';
import { Badge } from '@/components/core/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/core/ui/table';

interface Invoice {
  id: string;
  customerName: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Failed';
  date: string;
  dueDate: string;
}

const mockInvoices: Invoice[] = [
  { id: 'INV-2026-001', customerName: 'Nadia Rahman', amount: 15400, status: 'Paid', date: '2026-07-15', dueDate: '2026-07-25' },
  { id: 'INV-2026-002', customerName: 'Tanvir Hossain', amount: 29050, status: 'Pending', date: '2026-07-28', dueDate: '2026-08-07' },
  { id: 'INV-2026-003', customerName: 'Farhana Ahmed', amount: 8900, status: 'Paid', date: '2026-07-29', dueDate: '2026-08-08' },
  { id: 'INV-2026-004', customerName: 'Imtiaz Chowdhury', amount: 12500, status: 'Failed', date: '2026-07-29', dueDate: '2026-08-05' },
  { id: 'INV-2026-005', customerName: 'Sadia Jahan', amount: 6200, status: 'Pending', date: '2026-07-30', dueDate: '2026-08-10' },
];

function getStatusBadge(status: Invoice['status']) {
  switch (status) {
    case 'Paid':
      return (
        <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 gap-1">
          <CheckCircle2 className="h-3 w-3" />Paid
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

export default function BillingsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = mockInvoices.filter((inv) => {
    const matchesSearch =
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPaid = mockInvoices.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);
  const totalPending = mockInvoices.filter((i) => i.status === 'Pending').reduce((s, i) => s + i.amount, 0);
  const totalFailed = mockInvoices.filter((i) => i.status === 'Failed').reduce((s, i) => s + i.amount, 0);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bills & Invoices</h1>
          <p className="text-sm text-muted-foreground mt-1">View and manage all customer invoices</p>
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
            <p className="text-xs text-muted-foreground">Paid</p>
            <p className="text-xl font-bold">৳{totalPaid.toLocaleString()}</p>
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
              placeholder="Search by customer name or invoice ID..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'All')}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
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
                <TableHead>Invoice ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length > 0 ? (
                filtered.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {inv.id}
                    </TableCell>
                    <TableCell>{inv.customerName}</TableCell>
                    <TableCell>{inv.date}</TableCell>
                    <TableCell>{inv.dueDate}</TableCell>
                    <TableCell className="font-medium">৳{inv.amount.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(inv.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No invoices found.
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
