'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { 
  BarChart3, 
  Calendar, 
  Users, 
  FileText, 
  UserPlus, 
  Settings,
  Menu,
  X,
  LogOut,
  LucideIcon,   
  DessertIcon,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { logout } from '@/lib/store';
import toast from 'react-hot-toast';

interface MenuItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

const menuItems: MenuItem[] = [
  { icon: BarChart3, label: 'Overview', href: '/dashboard' },
  { icon: Calendar, label: 'Booking Management', href: '/dashboard/booking-management' },
  { icon: DollarSign, label: 'Transaction', href: '/dashboard/transaction-management' },
  { icon: Users, label: 'User Management', href: '/dashboard/user-management' },
  { icon: FileText, label: 'Reports', href: '/dashboard/report' },
  { icon: UserPlus, label: 'Create Admin', href: '/dashboard/create-admin' },
  { icon: UserPlus, label: 'Verify', href: '/dashboard/create-admin' },
  { icon: DessertIcon, label: 'Banner Management', href: '/dashboard/banner-management' },
  { icon: DollarSign, label: 'Platform Fee', href: '/dashboard/platform-fee' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 h-screen transition-all duration-300 flex flex-col",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center p-3 rounded-lg transition-all duration-200 hover:bg-gray-50",
                    isActive ? "bg-[#CD671C] text-white hover:bg-[#B85A18]" : "text-gray-700",
                    isCollapsed ? "justify-center" : "justify-start"
                  )}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="ml-3 font-medium">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          className={cn(
            "flex items-center p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full",
            isCollapsed ? "justify-center" : "justify-start"
          )}
          onClick={() => {
            dispatch(logout());
            toast.success('Logged out successfully!');
            router.push('/auth/login');
          }}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!isCollapsed && <span className="ml-3 font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
}