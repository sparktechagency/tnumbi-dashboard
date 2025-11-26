"use client";

import FeePlatform from '@/components/feemanage/FeePlatform';
import BackgroundCheckFee from '@/components/feemanage/BackgroundCheckFee';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import React, { useState, useEffect } from 'react';

const FeeManage = () => {
  
  return (
    <DashboardLayout>
    <div className="flex items-center gap-10">
      <FeePlatform />
      <BackgroundCheckFee />
    </div>
    </DashboardLayout>
  );
};

export default FeeManage;