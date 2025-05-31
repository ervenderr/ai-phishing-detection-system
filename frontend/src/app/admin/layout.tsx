'use client';

import type React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  BarChart3,
  MessageSquare,
  Brain,
  Users,
  Settings,
  LogOut,
  Bell,
  User,
  Shield,
  MessageCircle,
  FileText,
  Key,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const adminMenuItems = [
  {
    title: 'Dashboard',
    url: '/admin',
    icon: BarChart3,
  },
  {
    title: 'Analytics',
    url: '/admin/analytics',
    icon: TrendingUp,
  },
  {
    title: 'Messages',
    url: '/admin/messages',
    icon: MessageSquare,
  },
  {
    title: 'User Management',
    url: '/admin/users',
    icon: Users,
  },
  {
    title: 'Model Training',
    url: '/admin/model',
    icon: Brain,
  },
  {
    title: 'Feedback',
    url: '/admin/feedback',
    icon: MessageCircle,
  },
  {
    title: 'System Logs',
    url: '/admin/logs',
    icon: FileText,
  },
  {
    title: 'API Access',
    url: '/admin/api',
    icon: Key,
  },
  {
    title: 'Settings',
    url: '/admin/settings',
    icon: Settings,
  },
];

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AdminLayoutWithSidebar>{children}</AdminLayoutWithSidebar>
    </SidebarProvider>
  );
}

function AdminLayoutWithSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state } = useSidebar();

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar className="w-64 min-w-64 max-w-64 bg-[hsl(var(--sidebar-background))] z-10">
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center gap-2 px-4 py-2">
            <Shield className="h-6 w-6 text-red-600" />
            <div>
              <h2 className="text-lg font-semibold">PhishGuard Admin</h2>
              <p className="text-xs text-muted-foreground">Security Management</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="flex-1 overflow-y-auto p-4">
          <SidebarMenu>
            {adminMenuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={pathname === item.url}>
                  <Link href={item.url}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>

      <SidebarInset
        className={`flex-1 transition-all duration-300 ${state === 'expanded' ? 'ml-64' : 'ml-0'}`}
      >
        <header className="flex h-[77px] py-3 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1" />

          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatars/admin.png" alt="Admin" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Admin User</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      admin@phishguard.ai
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </div>
  );
}
