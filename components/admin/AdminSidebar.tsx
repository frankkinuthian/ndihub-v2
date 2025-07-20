"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Calendar, 
  DollarSign, 
  Users, 
  BookOpen, 
  Settings, 
  BarChart3,
  Mail,
  FileText,
  Home
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    description: 'Overview and analytics'
  },
  {
    name: 'MasterClasses',
    href: '/admin/masterclasses',
    icon: Calendar,
    description: 'Manage events and sessions'
  },
  {
    name: 'Pricing',
    href: '/admin/pricing',
    icon: DollarSign,
    description: 'Manage pricing and revenue'
  },
  {
    name: 'Enrollments',
    href: '/admin/enrollments',
    icon: Users,
    description: 'Student enrollments and attendance'
  },
  {
    name: 'Courses',
    href: '/admin/courses',
    icon: BookOpen,
    description: 'Course management'
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    description: 'Revenue and performance metrics'
  },
  {
    name: 'Email Invites',
    href: '/admin/invites',
    icon: Mail,
    description: 'Manage calendar invites'
  },
  {
    name: 'Reports',
    href: '/admin/reports',
    icon: FileText,
    description: 'Generate reports'
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'System configuration'
  }
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-card border-r border-border h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/admin" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">N</span>
          </div>
          <div>
            <h1 className="font-bold text-lg">NDIHub</h1>
            <p className="text-xs text-muted-foreground">Admin Dashboard</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {/* Back to Main Site */}
        <Link
          href="/"
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Back to Site</span>
        </Link>

        <div className="border-t border-border my-4"></div>

        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/admin' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <item.icon className="w-4 h-4" />
              <div className="flex-1">
                <div className="font-medium">{item.name}</div>
                <div className="text-xs opacity-75">{item.description}</div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          <p>NDIHub Admin v1.0</p>
          <p>© 2024 NDIHub</p>
        </div>
      </div>
    </div>
  );
}
