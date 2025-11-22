'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useGetAllUsersQuery, useUpdateUserStatusMutation, useDeleteUserMutation } from '@/lib/store';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Search, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import Swal from 'sweetalert2';
import { imageUrl } from '@/lib/baseApi';
import { getImageUrl } from '@/components/providers/imageUrl';

// User interface based on API response
interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'PARENT' | 'NANNY';
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  profileImage: string;
  verified: boolean;
  available: boolean;
  createdAt: string;
  updatedAt: string;
  location?: {
    type: string;
    coordinates: number[];
  };
  stripeAccountId?: string;
  countryCode?: string;
  gender?: string;
  kidsManage?: number;
}

const roleColors = {
  PARENT: 'bg-pink-100 text-pink-800',
  NANNY: 'bg-blue-100 text-blue-800',
  ADMIN: 'bg-purple-100 text-purple-800'
};

const statusColors = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
  BLOCKED: 'bg-red-100 text-red-800',
  SUSPENDED: 'bg-red-100 text-red-800'
};

// Server-side DataTable component
interface ServerDataTableProps {
  columns: any[];
  data: any[];
  searchKey: string;
  filters: any[];
  onSearch: (value: string) => void;
  onFilter: (value: string) => void;
  onPageChange: (page: number) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  isLoading: boolean;
}

function ServerDataTable({
  columns,
  data,
  searchKey,
  filters,
  onSearch,
  onFilter,
  onPageChange,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  isLoading
}: ServerDataTableProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const handleSearch = (value: string) => {
    setLocalSearchTerm(value);
    onSearch(value);
  };

  const handleFilter = (value: string) => {
    setSelectedFilter(value);
    onFilter(value);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder={`Search ${searchKey}...`}
              value={localSearchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {filters.length > 0 && (
          <Select value={selectedFilter} onValueChange={handleFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {filters[0].label}</SelectItem>
              {filters[0].options.map((option: { value: string; label: string }) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader className='bg-[#cd671c] text-white'>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {isLoading ? 'Loading...' : 'No results found.'}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow key={row._id || index}>
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.className}>
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
            >
              <ChevronLeft size={16} />
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
            >
              Next
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UserManagement() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('');

  const queryParams: Array<{ name: string; value: string }> = [
    { name: "page", value: String(page) },
    { name: "limit", value: String(limit) }
  ];

  if (searchTerm.trim()) {
    queryParams.push({ name: "searchTerm", value: searchTerm.trim() });
  }
  
  if (filter && filter !== "all") {
    queryParams.push({ name: "role", value: filter.toUpperCase() });
  }

  // API queries
  const { data: users, isLoading, error } = useGetAllUsersQuery(queryParams);
  const [updateUserStatus] = useUpdateUserStatusMutation();
  const [deleteUser] = useDeleteUserMutation();

  const userData = users?.data?.data || [];
  const meta = users?.data?.meta || { total: 0, limit: 10, page: 1, totalPage: 1 };

  // Handle search with debouncing
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setPage(1);
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      // Debouncing logic
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle role filter
  const handleRoleFilter = (value: string) => {
    setFilter(value);
    setPage(1);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle status change with confirmation
  const handleStatusChange = async (user: User, checked: boolean) => {
    const newStatus = checked ? 'ACTIVE' : 'BLOCKED';
    const actionText = checked ? 'activate' : 'block';

    const result = await Swal.fire({
      title: `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} User?`,
      html: `Are you sure you want to <strong>${actionText}</strong> <br/><strong>${user.name}</strong> (${user.email})?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: checked ? '#10b981' : '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Yes, ${actionText}!`,
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await updateUserStatus({
          userId: user._id,
          data: { status: newStatus }
        }).unwrap();

        Swal.fire({
          title: 'Success!',
          text: `User has been ${checked ? 'activated' : 'blocked'} successfully.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error: any) {
        console.error('Error updating user status:', error);
        Swal.fire({
          title: 'Error!',
          text: error?.data?.message || 'Failed to update user status. Please try again.',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  // Handle delete with confirmation
  const handleDelete = async (user: User) => {
    const result = await Swal.fire({
      title: 'Delete User?',
      html: `Are you sure you want to permanently delete <br/><strong>${user.name}</strong> (${user.email})?<br/><br/><span style="color: #ef4444;">This action cannot be undone!</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      focusCancel: true
    });

    if (result.isConfirmed) {
      try {
        await deleteUser(user._id).unwrap();

        Swal.fire({
          title: 'Deleted!',
          text: 'User has been deleted successfully.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error: any) {
        console.error('Error deleting user:', error);
        Swal.fire({
          title: 'Error!',
          text: error?.data?.message || 'Failed to delete user. Please try again.',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  const columns = [
    {
      key: 'user',
      header: 'User',
      className: '',
      render: (_: any, user: User) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={getImageUrl(user?.profileImage)} alt={user?.name} />
            <AvatarFallback>
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-gray-900">{user.name}</p>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      header: 'Email',
      className: '',
      render: (value: string) => value
    },
    {
      key: 'phone',
      header: 'Contact',
      className: '',
      render: (value: string) => value ?? 'N/A'
    },
    {
      key: 'role',
      header: 'Role',
      className: '',
      render: (value: string) => (
        <Badge className={roleColors[value as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}>
          {value === 'PARENT' ? 'Parent' : value === 'NANNY' ? 'Nanny' : value}
        </Badge>
      )
    },
    {
      key: 'createdAt',
      header: 'Join Date',
      className: '',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'verified',
      header: 'Verified',
      className: 'text-center',
      render: (value: boolean) => (
        <Badge className={value ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
          {value ? 'Verified' : 'Pending'}
        </Badge>
      )
    },
   {
  key: 'status',
  header: 'Status',
  className: '',
  render: (value: string) => {
    const displayText =
      value === 'ACTIVE'
        ? 'Active'
        : value === 'BLOCKED'
        ? 'Inactive'
        : value;

    return (
      <Badge
        className={
          statusColors[value as keyof typeof statusColors] ||
          'bg-gray-100 text-gray-800'
        }
      >
        {displayText}
      </Badge>
    );
  },
},

    {
      key: 'action',
      header: 'Action',
      className: 'text-center',
      render: (_: any, user: User) => (
        <div className="flex items-center justify-center space-x-2">
          <Switch
            checked={user.status === 'ACTIVE'}
            onCheckedChange={(checked) => handleStatusChange(user, checked)}
          />
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => handleDelete(user)}
            className="ml-2 bg-red-600 text-white"
          >
            <Trash2 size={14} className="mr-1" />
            Delete
          </Button>
        </div>
      )
    }
  ];

  const filters = [
    {
      key: 'role',
      label: 'Role',
      options: [
        { value: 'PARENT', label: 'Parents' },
        { value: 'NANNY', label: 'Nannies' }
      ]
    }
  ];

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-10 w-48" />
      </div>
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage and monitor all platform users</p>
          </div>
          <Card>
            <CardContent className="mt-6">
              <LoadingSkeleton />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage and monitor all platform users</p>
          </div>
          <Card>
            <CardContent className="mt-6">
              <div className="text-center py-8">
                <p className="text-red-600">Error loading users. Please try again.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage and monitor all platform users</p>
        </div>

        <Card>
          <CardContent className='mt-6'>
            <ServerDataTable
              columns={columns}
              data={userData}
              searchKey="name"
              filters={filters}
              onSearch={handleSearch}
              onFilter={handleRoleFilter}
              onPageChange={handlePageChange}
              currentPage={page}
              totalPages={meta.totalPage}
              totalItems={meta.total}
              itemsPerPage={limit}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}