import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

export const useCreateOrganization = (): any => {
  interface createOrganizationProps {
    name: string;
    userId: string;
  }

  const createOrganization = async (fields: createOrganizationProps) => {
    const { data } = await axios.post('/organizations/create', fields);
    return data;
  };

  return useMutation(createOrganization);
};

export const useAddMemberAfterInvite = (): any => {
  interface addMemberAfterInviteProps {
    userId: string;
    organizationId: string;
  }

  const addMemberAfterInvite = async (fields: addMemberAfterInviteProps) => {
    const { data } = await axios.post(
      '/organizations/add-member-after-invite',
      fields
    );
    return data;
  };

  return useMutation(addMemberAfterInvite);
};
