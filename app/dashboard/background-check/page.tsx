"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getImageUrl } from "@/components/providers/imageUrl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useGetAllBackgroundChecksQuery } from "@/lib/api/verifyApi";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useState } from "react";

/* ✅ RTK QUERY HOOKS (YOU MUST CREATE THESE) */
useGetAllBackgroundChecksQuery

useGetAllBackgroundChecksQuery
/* ================= TYPES ================= */

interface BackgroundCheck {
  _id: string;
  email: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  state: string;
  city: string;
  candidateId: string;
  createdAt: string;
  nannyId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    profileImage: string;
    location?: {
      address?: string;
    };
  };
}

/* ================= STATUS BADGES ================= */

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

/* ================= DATATABLE ================= */

function ServerDataTable({
  columns,
  data,
  onSearch,
  onFilter,
  onPageChange,
  currentPage,
  totalPages,
  isLoading,
}: any) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  return (
    <div className="space-y-4">
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <Input
            placeholder="Search by email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              onSearch(e.target.value);
            }}
            className="pl-10"
          />
        </div>

        <Select
          value={filter}
          onValueChange={(value) => {
            setFilter(value);
            onFilter(value);
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader className="bg-[#cd671c] text-white">
            <TableRow>
              {columns.map((col: any) => (
                <TableHead key={col.key}>{col.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center h-24">
                  {isLoading ? "Loading..." : "No data found"}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row: any) => (
                <TableRow key={row._id}>
                  {columns.map((col: any) => (
                    <TableCell key={col.key}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
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
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <ChevronLeft size={16} /> Prev
          </Button>
          <span className="text-sm mt-1">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}

/* ================= PAGE ================= */

export default function BackgroundCheckPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
const [limit, setLimit] = useState(10);
  const params: any[] = [
    { name: "page", value: String(page) },
    { name: "limit", value: limit },
];

if (search.trim()) params.push({ name: "searchTerm", value: search });
if (status && status !== "all") params.push({ name: "status", value: status });
const { data:backgroundCheckData, isLoading } = useGetAllBackgroundChecksQuery(params);

const backgroundData = backgroundCheckData?.data || [];
  const meta = backgroundCheckData?.meta || { total: 0, limit: 10, page: 1, totalPage: 1 };

  console.log('backgroundData', backgroundData);
  
  
  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };
  const columns = [
    {
      key: "nanny",
      header: "Nanny",
      render: (_: any, row: BackgroundCheck) => (
        <div className="flex gap-3 items-center">
          <Avatar className="h-8 w-8">
            <AvatarImage src={getImageUrl(row.nannyId.profileImage)} />
            <AvatarFallback>
              {row.nannyId.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.nannyId.name}</p>
            <p className="text-xs text-gray-500">{row.nannyId.email}</p>
          </div>
        </div>
      ),
    },
    { key: "email", header: "Candidate Email" },
    { key: "state", header: "State" },
    { key: "city", header: "City" },
    {
      key: "status",
      header: "Status",
      render: (value: string) => (
        <Badge className={statusColors[value as keyof typeof statusColors]}>
          {value}
        </Badge>
      ),
    },    
  ];

  /* ================= UI ================= */

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-2">Background Check</h1>
        <p className="text-gray-600 mb-6">
          Review and manage nanny background verification
        </p>

        <Card>
          <CardContent className="mt-6">
            <ServerDataTable
              columns={columns}
              data={backgroundData}
               searchKey="name"
              onSearch={(v: string) => {
                setSearch(v);
                setPage(1);
              }}
              onFilter={(v: string) => {
                setStatus(v);
                setPage(1);
              }}    
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
