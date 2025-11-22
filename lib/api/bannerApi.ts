import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth, ApiResponse } from '../baseApi';

// Type definitions
interface CreateBannerData {
  name: string;
  description: string;
  url?: string;
  image?: File;
}

interface UpdateBannerPayload {
  id: string;
  formData: FormData;
}

// Banner API slice
export const bannerApi = createApi({
  reducerPath: 'bannerApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Banner'],
  endpoints: (builder) => ({
    getBanners: builder.query({
      query: () => '/banners',
      providesTags: ['Banner'],
    }),
    
    createBanner: builder.mutation<any, FormData>({
      query: (formData) => {
       return {
        url: '/banners',
        method: 'POST',
        body: formData,
       }
        // CRITICAL: Let browser set Content-Type automatically for FormData
        // This will include the boundary parameter
        // formData: true,
      },
      invalidatesTags: ['Banner'],
    }),
    
    updateBanner: builder.mutation<any, UpdateBannerPayload>({
      query: ({ id, formData }) => ({
        url: `/banner/${id}`,
        method: 'PATCH',
        body: formData,
        // CRITICAL: Let browser set Content-Type automatically for FormData
        formData: true,
      }),
      invalidatesTags: ['Banner'],
    }),
    
    updateBannerStatus: builder.mutation<any, any>({
      query: (data) => ({
        url: `/banners/status/${data?.id}`,        
        method: 'PATCH',
        body:data

      }),
      invalidatesTags: ['Banner'],
    }),
    
    deleteBanner: builder.mutation<any, string>({
      query: (id) => ({
        url: `/banners/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Banner'],
    }),
  }),
});

export const {
  useGetBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useUpdateBannerStatusMutation,
  useDeleteBannerMutation,
} = bannerApi;

export type { CreateBannerData, UpdateBannerPayload };