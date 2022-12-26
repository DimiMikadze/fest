import axios from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useGetAuthUser = () => {
  const getAuthUser = async () => {
    const { data } = await axios('/auth/me');
    return data;
  };

  const { data, isLoading, refetch } = useQuery(['getAuthUser'], getAuthUser, {
    enabled: false,
  });

  return { isLoading, data, refetch };
};

export const useCreateUserBasedOnAuth0User = () => {
  interface createUserBasedOnAuth0UserProps {
    auth0Id?: string;
    googleId?: string;
    email: string;
    fullName?: string;
    avatar?: string;
    emailVerified?: boolean;
  }

  const createUserBasedOnAuth0User = async (
    fields: createUserBasedOnAuth0UserProps
  ) => {
    const { data } = await axios.post(
      '/auth/create-user-based-on-auth0-user',
      fields
    );
    return data;
  };

  return useMutation(createUserBasedOnAuth0User);
};

interface updateUserProps {
  userId: string;
  fields: {
    auth0Id?: string;
    googleId?: string;
    fullName?: string;
    avatar?: string;
    emailVerified?: boolean;
  };
}

export const useUpdateUser = (): any => {
  const updateUser = async ({ userId, fields }: updateUserProps) => {
    const { data } = await axios.patch(`/auth/update/${userId}`, fields);
    return data;
  };

  return useMutation(updateUser);
};

export const useSendEmailConfirmation = () => {
  const sendEmailConfirmation = async () => {
    const { data } = await axios.post('/auth/send-email-confirmation');
    return data;
  };
  return useMutation(sendEmailConfirmation);
};

export const useValidateEmailByCode = (): any => {
  const validateEmailByCode = async (code: string) => {
    const { data } = await axios.post('/auth/confirm-email-code', { code });
    return data;
  };
  return useMutation(validateEmailByCode);
};

export const useValidateEmailByToken = (): any => {
  const validateEmailByToken = async (token: string) => {
    const { data } = await axios.post('/auth/confirm-email-token', { token });
    return data;
  };
  return useMutation(validateEmailByToken);
};
