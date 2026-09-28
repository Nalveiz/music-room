import { baseApi } from './baseApi';
import { IApiResponse, IAuthUser, ILoginRequest, IUserProfile, Visibility, IProfileVisibility } from '@/src/types';


export interface IAuthResult {
  accessToken: string;
  user: IAuthUser;
}



export const authApi = baseApi.injectEndpoints({

  endpoints: (builder) => ({

    login: builder.mutation<IAuthResult, ILoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),

      transformResponse: (response: { token: string, user: {id: number; name: string; surname: string; username: string; email: string;}; }):
        IAuthResult => {
          return {
            accessToken: response.token,
            user: {
              id: response.user.id,
              email: response.user.email,
              name: response.user.name,
              surname: response.user.surname,
              username: response.user.username,
            },
          };
      },
      invalidatesTags: ['Profile'],
    }),

    getProfile: builder.query<IUserProfile, number>({
      query: (userId) => `/users/${userId}`,

      transformResponse: (response: {
        name: string;
        surname: string;
        username: string;
        profile_photo?: string | null;
        birth_date?: string | null;
        email?: string;
        auth_provider?: string;
        created_date?: string;
      }): IUserProfile => {
        return {
          name: response.name,
          surname: response.surname,
          username: response.username,
          profile_photo: response.profile_photo ?? null,
          birth_date: response.birth_date ?? null,
          email: response.email,
          auth_provider: response.auth_provider,
          created_date: response.created_date ?? null,
        };
      },
      providesTags: ['Profile'],
    }),

    logout: builder.mutation<void, void>({
      queryFn: async () => {
        return { data: undefined };
      },
      invalidatesTags: ['Profile', 'Posts'],
    }),

    register: builder.mutation< {
       message: string; },
      { name: string;
        surname: string;
        username: string;
        email: string;
        password: string;
        birth_date?: string;
      }
    >({ query: (body) => ({
      url: '/users',
      method: 'POST',
      body,
    }),
  }),

  requestResetPassword: builder.mutation<{ message: string}, {email: string}>({
    query: (body) => ({
      url: '/users/reset-password',
      method: 'POST',
      body,
    }),
  }),

  getProfileVisibility: builder.query<IProfileVisibility, void>({
    query: () => '/users/me/visibility',
  }),

  updateProfileVisibility: builder.mutation<{
    message: string;
    visibility: IProfileVisibility;
  },
  Partial <IProfileVisibility>
  >({
    query: (body) => ({
      url: '/users/me/visibility',
      method: 'PATCH',
      body,
    }),
  }),


  }),
});

export type IAuthResultType = IAuthResult;

export const {
  useLoginMutation,
  useGetProfileQuery,
  useLogoutMutation,
  useRegisterMutation,
  useRequestResetPasswordMutation,
  useGetProfileVisibilityQuery,
  useUpdateProfileVisibilityMutation,
} = authApi;
