import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import NextImage from "next/image";
import { useUpdateBannerMutation } from "@/lib/api/bannerApi";

// Form schema
const bannerFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  url: z.string().min(1, "URL is required"),
});

interface EditBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  banner: any;
  onSuccess: () => void;
}

// File size limit (2MB)
const MAX_FILE_SIZE = 2 * 1024 * 1024;

// Compress image function
const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new window.Image();
    
    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        }
      }, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

export function EditBannerModal({ isOpen, onClose, banner, onSuccess }: EditBannerModalProps) {
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  
  const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation();

  const form = useForm<z.infer<typeof bannerFormSchema>>({
    resolver: zodResolver(bannerFormSchema),
    defaultValues: {
      name: "",
      description: "",
      url: "",
    },
  });

  // Reset form when banner changes
  useEffect(() => {
    if (banner && isOpen) {
      form.reset({
        name: banner.name || "",
        description: banner.description || "",
        url: banner.url || "",
      });
      setPreviewImage(banner.image || null);
      setImageFile(null);
    }
  }, [banner, isOpen, form]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCompressing(true);
      
      let processedFile = file;
      
      // Compress if file is too large
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "Compressing image",
          description: "File size is large, compressing...",
        });
        
        processedFile = await compressImage(file);
        
        // If still too large after compression, try with lower quality
        if (processedFile.size > MAX_FILE_SIZE) {
          processedFile = await compressImage(file, 600, 0.6);
        }
        
        // Final check
        if (processedFile.size > MAX_FILE_SIZE) {
          toast({
            title: "File too large",
            description: "Please select a smaller image file (max 2MB)",
            variant: "destructive",
          });
          setIsCompressing(false);
          return;
        }
      }

      setImageFile(processedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(processedFile);
      
    } catch (error) {
      toast({
        title: "Error processing image",
        description: "Failed to process the selected image",
        variant: "destructive",
      });
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = async (values: z.infer<typeof bannerFormSchema>) => {
    try {
      if (!banner) return;

      const formData = new FormData();
      formData.append("id", banner._id);
      formData.append("data", JSON.stringify(values));            
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await updateBanner({ id: banner._id, formData }).unwrap();
      
      toast({
        title: "Success",
        description: "Banner updated successfully",
      });
      
      handleClose();
      onSuccess();
      
    } catch (error: any) {
      console.error('Update error:', error);
      
      let errorMessage = "Failed to update banner";
      
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    form.reset();
    setImageFile(null);
    setPreviewImage(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Banner</DialogTitle>
          <DialogDescription>
            Update banner information
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
              <FormLabel>Image {imageFile ? "(New image selected)" : "(Optional - leave empty to keep current)"}</FormLabel>
              <FormControl>
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  disabled={isCompressing}
                />
              </FormControl>
              {isCompressing && (
                <p className="text-sm text-blue-600">Compressing image...</p>
              )}
              <p className="text-xs text-gray-500">
                Max file size: 2MB. Large images will be automatically compressed.
              </p>
              
              {previewImage && (
                <div className="mt-2">
                  <div className="relative h-40 w-full overflow-hidden rounded-md border">
                    <NextImage 
                      src={previewImage} 
                      alt="Preview" 
                      fill 
                      className="object-contain"
                    />
                  </div>
                  {imageFile && (
                    <p className="text-xs text-gray-600 mt-1">
                      File size: {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                </div>
              )}
            </FormItem>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isUpdating || isCompressing}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isUpdating || isCompressing}
              >
                {isUpdating ? "Updating..." : "Update Banner"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}