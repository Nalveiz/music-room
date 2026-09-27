import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { AppConfig } from '@/src/constants/config';
import { IApiResponse } from '@/src/types';
import { tokenStorage } from '@/src/utils/storage';

const BACKEND_IP = process.env.EXPO_PUBLIC_BACKEND_IP_ADDRESS;

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `http://${BACKEND_IP}:3000`,
    timeout: AppConfig.API_TIMEOUT_MS,
    prepareHeaders: async (headers) => {
      try {
        const tokens = await tokenStorage.get();
        if (tokens?.accessToken) {
          headers.set('Authorization', `Bearer ${tokens.accessToken}`);
        }
      } catch {}
      headers.set('Accept', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Profile', 'Posts'],
  endpoints: () => ({}),
});

// export function unwrapEnvelope<T>(response: unknown): T {
//   const envelope = response as IApiResponse<T>;
//   if (envelope && typeof envelope.success === 'boolean' && envelope.success) {
//     return envelope.data;
//   }
//   throw new Error(envelope?.message ?? 'İstek başarısız oldu.');
// }
