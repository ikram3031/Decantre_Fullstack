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
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UrlObject } from "url";

const navItems = [
	{
		title: "Overview",
		url: "/dashboard",
		icon: LayoutDashboard,
	},
	{
		title: "Orders",
		url: "/dashboard/orders",
		icon: ShoppingCart,
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
		title: "System Users",
		url: "/dashboard/users",
		icon: ShieldAlert,
	},
];

export function AppSidebar() {
	const pathname = usePathname();

	return (
		<Sidebar>
			<SidebarHeader className="h-16 flex items-center justify-center border-b px-4">
				<div className="flex items-center gap-2 font-semibold text-lg">
					<LayoutDashboard className="h-6 w-6 text-primary" />
					<span>AdminDash</span>
				</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Application</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{navItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton
										render={
											<Link
												href={{
													pathname: item.url
													// query: {},
												}}
											/>
										}
										isActive={pathname === item.url}
									>
										<item.icon />
										<span>{item.title}</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
