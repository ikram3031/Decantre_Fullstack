'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, CreditCard, Receipt, FileText, Download, CheckCircle2, XCircle, Clock } from 'lucide-react';
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

export default function BillingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredInvoices = mockInvoices.filter((inv) => {
    const matchesSearch = inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inv.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'Paid':
        return (
          <Badge variant="outline" className="border-emerald-500 text-emerald-500 bg-emerald-500/5 gap-1">
            <CheckCircle2 className="h-3 w-3" /> Paid
          </Badge>
        );
      case 'Pending':
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500 bg-amber-500/5 gap-1">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        );
      case 'Failed':
        return (
          <Badge variant="outline" className="border-destructive text-destructive bg-destructive/5 gap-1">
            <XCircle className="h-3 w-3" /> Failed
          </Badge>
        );
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Billing & Payment</h2>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Statements
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-card text-card-foreground shadow-sm border rounded-lg p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium">Total Billed</p>
            <h3 className="text-2xl font-bold">৳72,050.00</h3>
          </div>
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <Receipt className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-card text-card-foreground shadow-sm border rounded-lg p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium">Pending Payments</p>
            <h3 className="text-2xl font-bold">৳35,250.00</h3>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-full text-amber-600">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-card text-card-foreground shadow-sm border rounded-lg p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium">Invoices Issued</p>
            <h3 className="text-2xl font-bold">5 Active</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-600">
            <FileText className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search invoice ID or customer..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(value: string | null) => setStatusFilter(value ?? 'All')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Invoices</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card text-card-foreground shadow-sm border rounded-lg">
        <div className="p-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Billing Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-semibold">{inv.id}</TableCell>
                      <TableCell>{inv.customerName}</TableCell>
                      <TableCell>{inv.date}</TableCell>
                      <TableCell>{inv.dueDate}</TableCell>
                      <TableCell className="font-medium">৳{inv.amount.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(inv.status)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No invoices found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
