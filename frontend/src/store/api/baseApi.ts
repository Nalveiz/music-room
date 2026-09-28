import { AppConfig } from '@/src/constants/config';
import { IApiResponse } from '@/src/types';
import { tokenStorage } from '@/src/utils/storage';

const BACKEND_IP = process.env.EXPO_PUBLIC_BACKEND_IP_ADDRESS;
import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

const BASE_URL = `http://${BACKEND_IP}:3000`;
console.log('BASE_URL:', BASE_URL);

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
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
});

const loggingBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> =
  async (args, api, extra) => {
    const result = await rawBaseQuery(args, api, extra);
    if (result.error) {
      console.log('API ERROR:', typeof args === 'string' ? args : args.url, JSON.stringify(result.error));
    }
    return result;
  };

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: loggingBaseQuery,
  tagTypes: ['Profile', 'Posts', 'Visibility'],
  endpoints: () => ({}),
});