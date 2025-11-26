import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth, ApiResponse, PaginatedResponse } from "../baseApi";

/* ================= TYPES ================= */

export interface BackgroundCheck {
  _id: string;
  email: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  state: string;
  city: string;
  candidateId: string;
  createdAt: string;
  updatedAt: string;
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

/* ================= API ================= */

export const verifyApi = createApi({
  reducerPath: "verifyApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["BackgroundCheck"],

  endpoints: (builder) => ({
    /* ✅ GET ALL BACKGROUND CHECKS */
    getAllBackgroundChecks: builder.query({
      query: (params) => ({
        url: "/checkr",
        params: Object.fromEntries(
          params.map((p:any) => [p.name, p.value])
        ),
      }),
      providesTags: ["BackgroundCheck"],
    }),
    /* ✅ GET ALL BACKGROUND CHECKS */
    getBackgroundCheckFee: builder.query({
      query: () => '/background-check-fee',
      providesTags: ["BackgroundCheck"],
    }),
   

    /* ✅ UPDATE STATUS (APPROVE / REJECT) */
    updateBackgroundCheckFee: builder.mutation({
      query: (data) => ({
        url: `/background-check-fee`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["BackgroundCheck"],
    }),
    /* ✅ UPDATE STATUS (APPROVE / REJECT) */
    updateBackgroundCheckStatus: builder.mutation({
      query: ({ id, data }) => ({
        url: `/checkr/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["BackgroundCheck"],
    }),
  }),
});

/* ================= EXPORT HOOKS ================= */

export const {
  useGetAllBackgroundChecksQuery,
  useUpdateBackgroundCheckStatusMutation,
  
  useGetBackgroundCheckFeeQuery, 
  useUpdateBackgroundCheckFeeMutation,
} = verifyApi;
