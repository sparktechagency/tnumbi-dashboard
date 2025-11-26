'use client'

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Loader2, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { useGetBackgroundCheckFeeQuery, useUpdateBackgroundCheckFeeMutation } from '@/lib/api/verifyApi';

interface BackgroundCheckFeeData {
  _id: string;
  fee: number;
  createdAt: string;
  updatedAt: string;
}

const BackgroundCheckFee = () => {
  const { data: backgroundCheckFeeResponse, isLoading, refetch } = useGetBackgroundCheckFeeQuery({});
  console.log("backgroundCheckFeeResponse", backgroundCheckFeeResponse);
  const backgroundCheckFee = backgroundCheckFeeResponse?.data as BackgroundCheckFeeData | undefined;

  const [updateBackgroundCheckFee, { isLoading: isUpdating }] = useUpdateBackgroundCheckFeeMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fee: '',
  });
  const [errors, setErrors] = useState({
    fee: '',
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!isModalOpen) {
      setFormData({ fee: '' });
      setErrors({ fee: '' });
    }
  }, [isModalOpen]);

  const handleOpenModal = () => {
    if (backgroundCheckFee) {
      setFormData({
        fee: backgroundCheckFee.fee.toString(),
      });
    } else {
      setFormData({ fee: '' });
    }
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const newErrors = { fee: '' };
    let isValid = true;

    if (!formData.fee || parseFloat(formData.fee) < 0) {
      newErrors.fee = 'Please enter a valid fee';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const payload = {
        fee: parseFloat(formData.fee),        
      };

      await updateBackgroundCheckFee(payload).unwrap();

      toast.success(`Background check fee updated successfully`);

      setIsModalOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || `Failed to update background check fee`);
    }
  };

  const handleInputChange = (field: 'fee', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="p-6 mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Background Check Fee Management</h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        </div>
      ) : backgroundCheckFee ? (
        <Card className="max-w-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-xl font-bold">Current Background Check Fee</CardTitle>             
            </div>
            <Button onClick={handleOpenModal} size="sm" className="flex items-center gap-2">
              <Pencil className="w-4 h-4" />
              Edit
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-4 p-4 bg-[#cd671c] rounded-lg border border-blue-100">
              <div className="bg-white p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-black" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Background Check Fee</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {backgroundCheckFee.fee}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="max-w-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-xl font-bold">Current Background Check Fee</CardTitle>              
            </div>
            <Button onClick={handleOpenModal} size="sm" className="flex items-center gap-2">
              <Pencil className="w-4 h-4" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center ">
            <div className="flex w-full items-start space-x-4 p-4 bg-[#cd671c] rounded-lg border border-blue-100">
              <div className="bg-white p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-black" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Background Check Fee</p>
                <p className="text-3xl font-bold text-white mt-1">
                  0
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {backgroundCheckFee ? 'Edit Background Check Fee' : 'Create Background Check Fee'}
            </DialogTitle>
            <DialogDescription>
              {backgroundCheckFee
                ? 'Update the background check fee.'
                : 'Set the background check fee for verification services.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="fee">Background Check Fee</Label>
                <Input
                  id="fee"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Enter fee"
                  value={formData.fee}
                  onChange={(e) => handleInputChange('fee', e.target.value)}
                  className={errors.fee ? 'border-red-500' : ''}
                />
                {errors.fee && (
                  <p className="text-sm text-red-500">{errors.fee}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating} className="bg-[#cd671c] text-white">
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {backgroundCheckFee ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>{backgroundCheckFee ? 'Update Fee' : 'Create Fee'}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BackgroundCheckFee;