"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  CreditCard,
  BarChart3,
  ShieldAlert,
  ListOrdered,
  PlusCircle,
  Package,
  Receipt,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { DecantreLogo } from "@/components/DecantreLogo"
import { useAuth } from "@/lib/auth-context"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b border-sidebar-border px-6 py-4">
        <div className="flex items-center gap-3">
          <DecantreLogo className="h-8 w-8 text-primary" />
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-bold text-lg tracking-tight text-sidebar-foreground">
              Decantre
            </span>
            <span className="text-xs text-sidebar-foreground/60">
              Perfume Store Dashboard
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarMenu>
          {/* Overview */}
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={pathname === "/dashboard"}
              tooltip="Overview"
              render={<Link href={{ pathname: "/dashboard" }} />}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Overview</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Orders */}
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={pathname.startsWith("/dashboard/orders")}
              tooltip="Orders"
              render={<Link href={{ pathname: "/dashboard/orders" }} />}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Orders</span>
            </SidebarMenuButton>
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton
                  isActive={pathname === "/dashboard/orders/new"}
                  render={<Link href={{ pathname: "/dashboard/orders/new" }} />}
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>New In-Store Order</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton
                  isActive={pathname === "/dashboard/orders"}
                  render={<Link href={{ pathname: "/dashboard/orders" }} />}
                >
                  <ListOrdered className="h-3.5 w-3.5" />
                  <span>Orders List</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </SidebarMenuItem>

          {/* Products Management */}
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={pathname === "/dashboard/products"}
              tooltip="Products"
              render={<Link href={{ pathname: "/dashboard/products" }} />}
            >
              <Package className="h-4 w-4" />
              <span>Products</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Stock Management */}
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={pathname === "/dashboard/products/stock"}
              tooltip="Stock Management"
              render={<Link href={{ pathname: "/dashboard/products/stock" }} />}
            >
              <ListOrdered className="h-4 w-4" />
              <span>Stock Management</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Members */}
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={pathname === "/dashboard/members"}
              tooltip="Members"
              render={<Link href={{ pathname: "/dashboard/members" }} />}
            >
              <Users className="h-4 w-4" />
              <span>Members</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Billing & Payment */}
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={pathname.startsWith("/dashboard/billing")}
              tooltip="Billing & Payment"
              render={<Link href={{ pathname: "/dashboard/billing" }} />}
            >
              <CreditCard className="h-4 w-4" />
              <span>Billing & Payment</span>
            </SidebarMenuButton>
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton
                  isActive={pathname === "/dashboard/billing/billings"}
                  render={<Link href={{ pathname: "/dashboard/billing/billings" }} />}
                >
                  <Receipt className="h-3.5 w-3.5" />
                  <span>Bills & Invoices</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton
                  isActive={pathname === "/dashboard/billing/payments"}
                  render={<Link href={{ pathname: "/dashboard/billing/payments" }} />}
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>Payments</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </SidebarMenuItem>

          {/* Reports */}
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={pathname === "/dashboard/reports"}
              tooltip="Reports"
              render={<Link href={{ pathname: "/dashboard/reports" }} />}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Reports</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* System Users */}
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={pathname === "/dashboard/users"}
              tooltip="System Users"
              render={<Link href={{ pathname: "/dashboard/users" }} />}
            >
              <ShieldAlert className="h-4 w-4" />
              <span>System Users</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            {user?.email ? user.email.charAt(0).toUpperCase() : "A"}
          </div>
          <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-medium truncate text-sidebar-foreground">
              {user?.email || "Admin User"}
            </span>
            <span className="text-xs text-sidebar-foreground/60 truncate">
              Store Manager
            </span>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}