"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  BarChart,
  CheckSquare,
  Package,
  ShoppingCart,
  ShieldAlert,
  List,
  PlusCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  title: string;
  url: string;
  icon: React.ElementType;
  children?: { title: string; url: string; icon: React.ElementType }[];
};

const navItems: NavItem[] = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Orders",
    url: "/dashboard/orders",
    icon: ShoppingCart,
    children: [
      {
        title: "New In-Store Order",
        url: "/dashboard/orders/new",
        icon: PlusCircle,
      },
      {
        title: "Orders List",
        url: "/dashboard/orders",
        icon: List,
      },
    ],
  },
  {
    title: "Products",
    url: "/dashboard/products",
    icon: Package,
  },
  {
    title: "Members",
    url: "/dashboard/members",
    icon: Users,
  },
  {
    title: "Billing & Payment",
    url: "/dashboard/billing",
    icon: CreditCard,
  },
  {
    title: "Reports",
    url: "/dashboard/reports",
    icon: BarChart,
  },
  {
    title: "System Users",
    url: "/dashboard/users",
    icon: ShieldAlert,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  // Track expanded state for items with children
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>(
    () => {
      // Auto-expand if current path is under that section
      const initial: Record<string, boolean> = {};
      navItems.forEach((item) => {
        if (item.children && pathname.startsWith(item.url)) {
          initial[item.title] = true;
        }
      });
      return initial;
    },
  );

  const toggleExpand = (title: string) => {
    setExpanded((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <Sidebar>
      <SidebarHeader className="h-16 flex items-center border-b px-4">
        <div className="flex items-center gap-2 font-bold text-base tracking-widest uppercase">
          <LayoutDashboard className="h-5 w-5 text-primary" />
          <span>Decantre</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isParentActive =
                  pathname.startsWith(item.url) &&
                  (item.children ? true : pathname === item.url);
                const isOpen = expanded[item.title] ?? false;

                if (item.children) {
                  return (
                    <React.Fragment key={item.title}>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={isParentActive && !item.children}
                          onClick={() => toggleExpand(item.title)}
                          className="cursor-pointer"
                        >
                          <item.icon />
                          <span className="flex-1">{item.title}</span>
                          {isOpen ? (
                            <ChevronDown className="h-4 w-4 ml-auto shrink-0 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 ml-auto shrink-0 text-muted-foreground" />
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      {isOpen && (
                        <div className="ml-4 border-l border-border pl-2 mb-1">
                          {item.children.map((child) => (
                            <SidebarMenuItem key={child.title}>
                              <SidebarMenuButton
                                render={<Link href={{ pathname: child.url }} />}
                                isActive={pathname === child.url}
                                className="text-sm"
                              >
                                <child.icon className="h-3.5 w-3.5" />
                                <span>{child.title}</span>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                        </div>
                      )}
                    </React.Fragment>
                  );
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={
                        <Link
                          href={{
                            pathname: item.url,
                          }}
                        />
                      }
                      isActive={pathname === item.url}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
