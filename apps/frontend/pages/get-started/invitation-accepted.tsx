import React, { useEffect, useState } from 'react';
import { Typography } from '@mui/material';
import { GetStartedLayout } from '../../components/get-started';
import { Frontend_Routes } from '@fest/shared';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { AuthLoading, LoginButton } from '../../components/common';
import { useValidateToken } from '../../services';

const GetStartedInvitationAccepted = () => {
  const router = useRouter();
  const { isAuthLoading, setInvitationTokenDecoded } = useAuth();
  const [urlToken, setUrlToken] = useState('');

  const {
    mutateAsync: mutationValidateToken,
    isError: isErrorValidateToken,
    error: errorValidateToken,
    isLoading: isLoadingValidateToken,
    data: dataValidateToken,
  } = useValidateToken();

  /**
   * Responsible for getting the token from the URL and for its validation.
   */
  useEffect(() => {
    if (isAuthLoading) return;
    if (!router.isReady) return;
    const tokenFromTheUrl = router.query?.t as string;
    if (!tokenFromTheUrl) return;

    setUrlToken(tokenFromTheUrl);

    console.log('Invitation accepted: Found token in the URL');
    router.replace(Frontend_Routes.GET_STARTED_INVITATION_ACCEPTED, undefined, {
      shallow: true,
    });

    (async () => {
      try {
        const invitation = await mutationValidateToken({
          token: tokenFromTheUrl,
        });
        console.log('Setting invitationTokenDecoded', invitation);
        setInvitationTokenDecoded(invitation);
      } catch (error) {
        console.log('Token validation failed', error);
      }
    })();
  }, [router, isAuthLoading, mutationValidateToken, setInvitationTokenDecoded]);

  if (isLoadingValidateToken) return <AuthLoading />;

  if (isErrorValidateToken) {
    return (
      <GetStartedLayout hideLogOutButton>
        <Typography variant="h4" gutterBottom>
          {errorValidateToken?.response?.data?.message}
        </Typography>
      </GetStartedLayout>
    );
  }

  if (router.isReady && !urlToken) {
    return (
      <GetStartedLayout hideLogOutButton>
        <Typography variant="h4" gutterBottom>
          Token missing in the URL
        </Typography>
      </GetStartedLayout>
    );
  }

  if (!dataValidateToken) return;

  return (
    <GetStartedLayout hideLogOutButton>
      <Typography variant="h4" gutterBottom>
        Join {dataValidateToken?.organizationName} on Fest
      </Typography>

      <Typography variant="body2" gutterBottom>
        Fest is the platform for seamless communication and collaboration
      </Typography>

      <Typography variant="body2" gutterBottom>
        {dataValidateToken?.inviterEmail} has already joined.
      </Typography>

      <LoginButton
        size="large"
        fullWidth
        displayIcon
        connection="google-oauth2"
        screenHint="signup"
      >
        Continue with Google
      </LoginButton>
      <LoginButton size="large" fullWidth displayIcon screenHint="signup">
        Continue with Email
      </LoginButton>
    </GetStartedLayout>
  );
};

export default GetStartedInvitationAccepted;
