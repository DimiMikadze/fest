import { Button, TextField, Typography } from '@mui/material';
import React, { ChangeEvent, SyntheticEvent, useState } from 'react';
import { GetStartedLayout } from '../../components/get-started';
import { Link } from '../../components/common';
import { withOrganizationRequired } from '../../utils';
import { useCreateInvitation } from '../../services';
import { Frontend_Routes } from '@fest/shared';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';

const GetStartedInvitations = () => {
  const { authUser } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');

  const {
    mutateAsync: mutationCreateInvitation,
    isError: isErrorCreateInvitation,
    error: errorCreateInvitation,
    isLoading: isLoadingCreateInvitation,
  } = useCreateInvitation();

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const onSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();

    try {
      await mutationCreateInvitation({
        email,
        organizationId: authUser.currentOrganization.id,
        inviterId: authUser.id,
      });
      console.log('Invite has been sent successfully.');
      return router.push(Frontend_Routes.HOME);
    } catch (error) {
      console.log('Invitation sending failed', error);
    }
  };

  return (
    <GetStartedLayout>
      <Typography variant="h4" gutterBottom>
        Invite teammate
      </Typography>

      <TextField
        focused
        label="Email Address"
        fullWidth
        placeholder="name@example.com"
        onChange={onChange}
        error={isErrorCreateInvitation}
        helperText={
          isErrorCreateInvitation &&
          errorCreateInvitation?.response?.data?.message
        }
      />

      <Button
        fullWidth
        variant="contained"
        size="large"
        onClick={onSubmit}
        disabled={isLoadingCreateInvitation}
      >
        Send Invitation
      </Button>

      <Link href="/" underline="none">
        Skip this step
      </Link>
    </GetStartedLayout>
  );
};

export default withOrganizationRequired(GetStartedInvitations);
