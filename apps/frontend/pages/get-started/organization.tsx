import { Button, Stack, TextField, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import React, { ChangeEvent, SyntheticEvent, useState } from 'react';
import { Frontend_Routes } from '@fest/shared';
import { GetStartedLayout } from '../../components/get-started';
import { useAuth } from '../../context/AuthContext';
import { useCreateOrganization } from '../../services';
import { withEmailVerificationRequired } from '../../utils';

const GetStartedOrganization = () => {
  const [name, setName] = useState('');
  const router = useRouter();

  const { authUser, refetchAuthUser } = useAuth();
  const {
    isLoading: isLoadingCreateOrganization,
    isError: isErrorCreateOrganization,
    error: errorCreateOrganization,
    mutateAsync: mutationCreateOrganization,
  } = useCreateOrganization();

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setName(e.target.value);
  };

  const onSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();

    try {
      await mutationCreateOrganization({ name, userId: authUser.id });
      await refetchAuthUser();
      console.log(
        'Organization has been created successfully, and authUser has been re-fetched'
      );
      return router.push(Frontend_Routes.GET_STARTED_INVITATIONS);
    } catch (error) {
      console.log('Error detected while creating an organization', error);
    }
  };

  return (
    <GetStartedLayout>
      <Typography variant="h4" gutterBottom>
        Create a new workspace
      </Typography>

      <Stack sx={{ width: '100%' }}>
        <form onSubmit={onSubmit}>
          <Stack spacing={2}>
            <TextField
              focused
              label="Company or Team name"
              fullWidth
              type="text"
              onChange={onChange}
              error={isErrorCreateOrganization}
              helperText={
                isErrorCreateOrganization &&
                errorCreateOrganization?.response?.data?.message
              }
            />

            <Button
              disabled={isLoadingCreateOrganization}
              fullWidth
              variant="contained"
              size="large"
              type="submit"
            >
              Create
            </Button>
          </Stack>
        </form>
      </Stack>
    </GetStartedLayout>
  );
};

export default withEmailVerificationRequired(GetStartedOrganization);
