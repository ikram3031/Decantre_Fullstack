import React from 'react';
import { Search, Filter, CalendarDays } from 'lucide-react';

interface OrdersFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  dateFilter: string;
  setDateFilter: (date: string) => void;
  setCurrentPage: (page: number) => void;
}

export const OrdersFilters: React.FC<OrdersFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  setCurrentPage,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Search bar */}
        <div className="relative md:col-span-2">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4.5 w-4.5" />
          </span>
          <input
            type="text"
            placeholder="Search by ID, name or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-950 rounded-xl text-sm outline-none transition"
          />
        </div>

        {/* Status filter */}
        <div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
              <Filter className="h-4 w-4" />
            </span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-950 rounded-xl text-xs outline-none transition appearance-none cursor-pointer font-semibold text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="sold-directly">Sold Directly</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Date filter */}
        <div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
              <CalendarDays className="h-4 w-4" />
            </span>
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-950 rounded-xl text-xs outline-none transition appearance-none cursor-pointer font-semibold text-slate-700"
            >
              <option value="all">All Dates</option>
              <option value="7days">Past 7 days</option>
              <option value="30days">Past 30 days</option>
            </select>
          </div>
        </div>

      </div>
    </div>
  );
};
