"use client";

import { DashboardLayout } from '@/components/layout/DashboardLayout';
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
import { useCreatePlatformFeeMutation, useGetPlatformFeeQuery } from '@/lib/api/platformFeeApi';

interface PlatformFeeData {
  _id: string;
  feeToday: number;
  feeFuture: number;
  createdAt: string;
  updatedAt: string;
}

const PlatformFee = () => {
  const { data: platformFeeResponse, isLoading, refetch } = useGetPlatformFeeQuery({});
  console.log("platformFeeResponse", platformFeeResponse);
  const platformFee = platformFeeResponse?.data as PlatformFeeData | undefined;
  
  const [createPlatformFee, { isLoading: isCreating }] = useCreatePlatformFeeMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    feeToday: '',
    feeFuture: '',
  });
  const [errors, setErrors] = useState({
    feeToday: '',
    feeFuture: '',
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!isModalOpen) {
      setFormData({ feeToday: '', feeFuture: '' });
      setErrors({ feeToday: '', feeFuture: '' });
    }
  }, [isModalOpen]);

  const handleOpenModal = () => {
    if (platformFee) {
      setFormData({
        feeToday: platformFee.feeToday.toString(),
        feeFuture: platformFee.feeFuture.toString(),
      });
    } else {
      setFormData({ feeToday: '', feeFuture: '' });
    }
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const newErrors = { feeToday: '', feeFuture: '' };
    let isValid = true;

    if (!formData.feeToday || parseFloat(formData.feeToday) < 0) {
      newErrors.feeToday = 'Please enter a valid fee for today';
      isValid = false;
    }

    if (!formData.feeFuture || parseFloat(formData.feeFuture) < 0) {
      newErrors.feeFuture = 'Please enter a valid fee for future';
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
        feeToday: parseFloat(formData.feeToday),
        feeFuture: parseFloat(formData.feeFuture),
        ...(platformFee && { id: platformFee._id }),
      };

      await createPlatformFee(payload).unwrap();

      toast.success(`Platform fee ${platformFee ? 'updated' : 'created'} successfully`);

      setIsModalOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || `Failed to ${platformFee ? 'update' : 'create'} platform fee`);
    }
  };

  const handleInputChange = (field: 'feeToday' | 'feeFuture', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 mt-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Platform Fee Management</h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        ) : platformFee ? (
          <Card className="max-w-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-xl font-bold">Current Platform Fees</CardTitle>
                {/* <CardDescription>
                  Last updated: {new Date(platformFee.updatedAt).toLocaleString()}
                </CardDescription> */}
              </div>
              <Button onClick={handleOpenModal} size="sm" className="flex items-center gap-2">
                <Pencil className="w-4 h-4" />
                Edit
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-4 p-4 bg-[#cd671c] rounded-lg border border-blue-100">
                  <div className="bg-white p-3 rounded-full">
                    <DollarSign className="w-6 h-6 text-black" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Today's Fee</p>
                    <p className="text-3xl font-bold text-white mt-1">
                      {platformFee.feeToday}
                    </p>
                  </div>
                </div>

                 <div className="flex items-start space-x-4 p-4 bg-[#cd671c] rounded-lg border border-blue-100">
                  <div className="bg-white p-3 rounded-full">
                    <DollarSign className="w-6 h-6 text-black" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Future Fee</p>
                    <p className="text-3xl font-bold text-white mt-1">
                       {platformFee.feeFuture}
                    </p>
                  </div>
                </div>
              </div>

              {/* <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Created At:</span>
                  <span className="font-medium">
                    {new Date(platformFee.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div> */}
            </CardContent>
          </Card>
        ) : (
          <Card className="max-w-2xl">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <DollarSign className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">No platform fee configured yet</p>
              <Button onClick={handleOpenModal} className="flex items-center gap-2">
                <Pencil className="w-4 h-4" />
                Create Platform Fee
              </Button>
            </CardContent>
          </Card>
        )}

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {platformFee ? 'Edit Platform Fee' : 'Create Platform Fee'}
              </DialogTitle>
              <DialogDescription>
                {platformFee
                  ? 'Update the platform fee .'
                  : 'Set the platform fee for today and future transactions.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="feeToday">Today's Fee </Label>
                  <Input
                    id="feeToday"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter fee"
                    value={formData.feeToday}
                    onChange={(e) => handleInputChange('feeToday', e.target.value)}
                    className={errors.feeToday ? 'border-red-500' : ''}
                  />
                  {errors.feeToday && (
                    <p className="text-sm text-red-500">{errors.feeToday}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="feeFuture">Future Fee </Label>
                  <Input
                    id="feeFuture"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter fee"
                    value={formData.feeFuture}
                    onChange={(e) => handleInputChange('feeFuture', e.target.value)}
                    className={errors.feeFuture ? 'border-red-500' : ''}
                  />
                  {errors.feeFuture && (
                    <p className="text-sm text-red-500">{errors.feeFuture}</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating} className="bg-[#cd671c] text-white">
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {platformFee ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>{platformFee ? 'Update Fee' : 'Create Fee'}</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default PlatformFee;