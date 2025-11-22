"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import {
  useGetBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useUpdateBannerStatusMutation,
  useDeleteBannerMutation,
  CreateBannerData,
} from "@/lib/api/bannerApi";
import { getImageUrl } from "@/components/providers/imageUrl";
import { imageUrl } from "@/lib/baseApi";

// Form schema
const bannerFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  url: z.string().min(1, "URL is required"),
});

export default function BannerManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null); // null means create mode, object means edit mode
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // API hooks
  const {
    data: bannersData,
    isLoading,
    refetch,
  } = useGetBannersQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });
  const [createBanner, { isLoading: isCreating }] = useCreateBannerMutation();
  const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation();
  const [updateBannerStatus] = useUpdateBannerStatusMutation();
  const [deleteBanner, { isLoading: isDeleting }] = useDeleteBannerMutation();

  // Single form for both create and edit
  const form = useForm<z.infer<typeof bannerFormSchema>>({
    resolver: zodResolver(bannerFormSchema),
    defaultValues: {
      name: "",
      description: "",
      url: "",
    },
  });

  // Check if we're in edit mode
  const isEditMode = editingBanner !== null;
  const isProcessing = isCreating || isUpdating;

  // Table columns
  const columns = [
    {
      key: "name",
      header: "Name",
      className: "w-[150px]",
    },
    {
      key: "image",
      header: "Image",
      className: "w-[100px]",
      render: (value: string) => (
        <div className="relative h-12 w-12 overflow-hidden rounded-md">
          <Image
            src={getImageUrl(value)}
            alt="Banner"
            fill
            className="object-cover"
          />
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      className: "max-w-[300px]",
      render: (value: string) => (
        <div className="truncate max-w-[300px]" title={value}>
          {value}
        </div>
      ),
    },
    {
      key: "url",
      header: "URL",
      className: "w-[150px]",
      render: (value: string) => (
        <div className="truncate max-w-[150px]" title={value}>
          {value}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      className: "w-[100px]",
      render: (value: boolean, row: any) => (
        <Switch
          checked={value}
          onCheckedChange={() => handleStatusChange(row)}
          className="data-[state=checked]:bg-green-500"
        />
      ),
    },
    {
      key: "createdAt",
      header: "Created At",
      className: "w-[150px]",
      render: (value: string) => format(new Date(value), "MMM dd, yyyy"),
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-[100px]",
      render: (_: any, row: any) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Pencil size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  // Handlers
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Open dialog for create
  const handleCreate = () => {
    setEditingBanner(null);
    form.reset({
      name: "",
      description: "",
      url: "",
    });
    setImageFile(null);
    setPreviewImage(null);
    setIsDialogOpen(true);
  };

  // Open dialog for edit
  const handleEdit = (banner: any) => {
    setEditingBanner(banner);
    form.reset({
      name: banner.name,
      description: banner.description,
      url: banner.url,
    });
    setImageFile(null);
    setPreviewImage(banner.image);
    setIsDialogOpen(true);
  };

  // Single submit handler for both create and edit
  const handleSubmit = async (values: z.infer<typeof bannerFormSchema>) => {
  try {
    // Create Mode: Image must be selected
    if (!isEditMode && !imageFile) {
      toast({
        title: "Error",
        description: "Please select an image",
        variant: "destructive",
      });
      return;
    }

    // Prepare FormData
    const formData = new FormData();
    
    // Add JSON data as a string (NO ID here - it goes in URL)
    const payload = {
      name: values.name,
      description: values.description,
      url: values.url,
    };
    formData.append("data", JSON.stringify(payload));
    console.log('JSON payload:', payload);
    // Add image file if present
    if (imageFile) {
     imageFile && formData.append("image", imageFile);
    }

  

    // API Calls
    if (isEditMode && editingBanner && (editingBanner as any)._id) {
      // Pass ID and formData separately
      await updateBanner({ id: (editingBanner as any)._id, formData }).unwrap();
      toast({
        title: "Success",
        description: "Banner updated successfully",
      });
    } else {
      await createBanner(formData).unwrap();
      toast({
        title: "Success",
        description: "Banner created successfully",
      });
    }

    // Reset and Close Dialog
    setIsDialogOpen(false);
    setEditingBanner(null);
    form.reset();
    setImageFile(null);
    setPreviewImage(null);
    refetch();
  } catch (error: any) {
    console.error('Submit error:', error);
    toast({
      title: "Error",
      description: error?.data?.message || `Failed to ${isEditMode ? "update" : "create"} banner`,
      variant: "destructive",
    });
  }
};

  const handleDelete = (banner: any) => {
    setEditingBanner(banner);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (!editingBanner) return;

      await deleteBanner((editingBanner as any)._id).unwrap();
      toast({
        title: "Success",
        description: "Banner deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setEditingBanner(null);
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete banner",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (record: any) => {
    try {
      
      await updateBannerStatus({id: record?._id, status: record?.status === false ? true  : false}).unwrap();
      toast({
        title: "Success",
        description: "Banner status updated successfully",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update banner status",
        variant: "destructive",
      });
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingBanner(null);
    form.reset();
    setImageFile(null);
    setPreviewImage(null);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Banner Management
            </h1>
            <p className="text-gray-600">
              Manage website banners and promotional content
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add New Banner
          </Button>
        </div>

        <Card>
          <CardContent className="mt-6">
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <DataTable
                columns={columns}
                data={bannersData?.data || []}
                searchKey="name"
                itemsPerPage={10}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Single Dialog for Create/Edit Banner */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Banner" : "Create New Banner"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update banner information"
                : "Add a new banner to display on the website"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Banner name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Banner description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input placeholder="Banner URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>
                  Image {!isEditMode && <span className="text-red-500">*</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </FormControl>
                {previewImage && (
                  <div className="mt-2">
                    <div className="relative h-40 w-full overflow-hidden rounded-md">
                      <Image
                        // src={`${imageUrl}${previewImage}`}
                        src={`${previewImage.startsWith('/image') ? `${imageUrl}${previewImage}` : previewImage }`}
                        alt="Preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                )}
              </FormItem>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDialogClose}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isProcessing}>
                  {isProcessing
                    ? isEditMode
                      ? "Updating..."
                      : "Creating..."
                    : isEditMode
                    ? "Update Banner"
                    : "Create Banner"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Banner</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this banner? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setEditingBanner(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Banner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
