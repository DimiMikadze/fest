import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

export const useCreateInvitation = (): any => {
  interface createInvitationProps {
    email: string;
    inviterId: string;
    organizationId: string;
  }

  const createInvitation = async (fields: createInvitationProps) => {
    const { data } = await axios.post('/invitations/create', fields);
    return data;
  };
  return useMutation(createInvitation);
};

export const useValidateToken = (): any => {
  interface validateTokenProps {
    token: string;
  }

  const validateToken = async (fields: validateTokenProps) => {
    const { data } = await axios.post('/invitations/validate-token', fields);
    return data;
  };
  return useMutation(validateToken);
};
