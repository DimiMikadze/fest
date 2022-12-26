import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import { useRouter } from 'next/router';
import { Error as ErrorIcon } from '@mui/icons-material';
import {
  Stack,
  Typography,
  TextField,
  Box,
  InputAdornment,
  CircularProgress,
  Button,
  Alert,
} from '@mui/material';
import { AuthLoading } from '../../components/common';
import {
  useSendEmailConfirmation,
  useValidateEmailByCode,
  useValidateEmailByToken,
} from '../../services';
import { useAuth } from '../../context/AuthContext';
import { EMAIL_CONFIRMATION_CODE_LENGTH, Frontend_Routes } from '@fest/shared';
import { GetStartedLayout } from '../../components/get-started';

const GetStartedEmailConfirm = () => {
  const { isAuthLoading, authUser, refetchAuthUser } = useAuth();
  const router = useRouter();

  // For displaying, loading, success and error state, when re-sending the confirmation code.
  const [isEmailReSended, setIsEmailReSended] = useState(false);
  const [isEmailResendLoading, setIsEmailResendLoading] = useState(false);

  const {
    mutateAsync: mutationSendEmailConfirmation,
    isSuccess: isSuccessSendEmailConfirmation,
    isError: isErrorEmailConfirmation,
  } = useSendEmailConfirmation();
  const {
    mutateAsync: mutationValidateEmailByCode,
    isSuccess: isSuccessValidateEmailByCode,
    isError: isErrorValidateEmailByCode,
    error: errorValidateEmailByCode,
    isLoading: isLoadingValidateEmailByCode,
    reset: resetValidateEmailByCode,
  } = useValidateEmailByCode();
  const {
    mutateAsync: mutationValidateEmailByToken,
    isSuccess: isSuccessValidateEmailByToken,
    isError: isErrorValidateEmailByToken,
    error: errorValidateEmailByToken,
    isLoading: isLoadingValidateEmailByToken,
    reset: resetValidateEmailByToken,
  } = useValidateEmailByToken();

  /**
   * Redirect a user to the home page, if their email address is already verified.
   */
  useEffect(() => {
    if (authUser?.emailVerified) {
      console.log(
        "authUser's email is already verified, redirecting to the home or organization creation page"
      );
      authUser?.currentOrganization
        ? router.push(Frontend_Routes.HOME)
        : router.push(Frontend_Routes.GET_STARTED_ORGANIZATION);
      return;
    }
  }, [authUser?.emailVerified, authUser?.currentOrganization, router]);

  /**
   * Helper function to send an email confirmation
   * Fired when user clicks on re-send code button or when token is present in the URL's query string
   */
  const sendEmailConfirmation = useCallback(
    async (isFiredManually = false) => {
      if (isFiredManually) setIsEmailResendLoading(true);

      await mutationSendEmailConfirmation();
      await refetchAuthUser();

      if (isFiredManually) {
        setIsEmailResendLoading(false);

        if (!isEmailReSended) setIsEmailReSended(true);
      }
    },
    [mutationSendEmailConfirmation, refetchAuthUser, isEmailReSended]
  );

  /**
   * Sends an email verification link to the user on the page load, if we haven't sent it already.
   */
  useEffect(() => {
    if (isAuthLoading) return;
    if (authUser?.emailVerified) return;
    if (authUser?.emailVerificationLinkSent !== false) return;

    (async () => {
      console.log('Sending email verification link on the page load.');
      sendEmailConfirmation();
    })();
  }, [
    authUser?.emailVerificationLinkSent,
    authUser?.emailVerified,
    isAuthLoading,
    sendEmailConfirmation,
  ]);

  /**
   * Response handler of email validation with a code.
   */
  useEffect(() => {
    if (isAuthLoading) return;
    if (isLoadingValidateEmailByCode) return;
    if (authUser?.emailVerified) return;

    (async () => {
      if (isSuccessValidateEmailByCode) {
        await refetchAuthUser();
        console.log('Code validation succeeded and email confirmed');
        return;
      }
    })();
  }, [
    isAuthLoading,
    isSuccessValidateEmailByCode,
    refetchAuthUser,
    isLoadingValidateEmailByCode,
    authUser?.emailVerified,
  ]);

  /**
   * Response handler of email validation with a token.
   */
  useEffect(() => {
    if (isAuthLoading) return;
    if (isLoadingValidateEmailByToken) return;
    if (authUser?.emailVerified) return;

    (async () => {
      // Refetch authUser and redirect them to the home page if email validation has succeeded.
      if (isSuccessValidateEmailByToken) {
        await refetchAuthUser();
        console.log('Token validation succeeded and email confirmed');
        return;
      }
    })();
  }, [
    isAuthLoading,
    isSuccessValidateEmailByToken,
    refetchAuthUser,
    isLoadingValidateEmailByToken,
    authUser?.emailVerified,
  ]);

  /**
   * Responsible for validating user's email address if a token is present in the query string.
   */
  useEffect(() => {
    if (isAuthLoading) return;

    const token = router.query?.t as string;
    if (!token) return;

    console.log('Email confirm: Found token in the URL');
    // Remove token from the URL.
    router.replace(Frontend_Routes.GET_STARTED_EMAIL_CONFIRM, undefined, {
      shallow: true,
    });

    console.log('Validating token: ', token);
    mutationValidateEmailByToken(token);
  }, [
    refetchAuthUser,
    isSuccessValidateEmailByToken,
    router.query,
    router,
    mutationValidateEmailByToken,
    isAuthLoading,
  ]);

  /**
   * Checks confirmation code validity when 6 characters are filled out in the input.
   */
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const value = e.target.value;

    if (isErrorValidateEmailByCode) resetValidateEmailByCode();
    if (isErrorValidateEmailByToken) resetValidateEmailByToken();

    if (value.length === 6) {
      mutationValidateEmailByCode(value);
    }
  };

  /**
   * Renders Loading or Error icon in the input field.
   */
  const renderInputIcon = () => {
    if (isLoadingValidateEmailByCode) {
      return {
        endAdornment: (
          <InputAdornment position="start">
            <CircularProgress size={20} />
          </InputAdornment>
        ),
      };
    }

    if (isErrorValidateEmailByCode) {
      return {
        endAdornment: (
          <InputAdornment position="start">
            <ErrorIcon color="error" />
          </InputAdornment>
        ),
      };
    }

    return {};
  };

  // If the users email is already verified useEffect hook will redirect them to the home page.
  if (authUser?.emailVerified) return <AuthLoading />;

  return (
    <GetStartedLayout>
      {isLoadingValidateEmailByToken ? (
        <Stack direction="row" alignItems="center">
          <Box mr={2}>
            <CircularProgress size={16} /> {}
          </Box>
          <Typography>Confirming email address.</Typography>
        </Stack>
      ) : (
        <>
          <Typography variant="h4" gutterBottom>
            Confirm Your Email
          </Typography>

          <Typography align="center">
            Enter your confirmation code. We&apos;ve sent it to{' '}
            <b>{authUser.email}</b>.
          </Typography>

          <TextField
            focused
            label="Confirmation code"
            fullWidth
            type="text"
            onChange={onChange}
            name="code"
            placeholder={`Enter ${EMAIL_CONFIRMATION_CODE_LENGTH}-digit code`}
            inputProps={{ maxLength: EMAIL_CONFIRMATION_CODE_LENGTH }}
            disabled={
              isLoadingValidateEmailByToken || isLoadingValidateEmailByCode
            }
            InputProps={renderInputIcon()}
            error={isErrorValidateEmailByCode}
            helperText={
              isErrorValidateEmailByCode &&
              errorValidateEmailByCode?.response?.data?.message
            }
          />

          {isErrorValidateEmailByToken && (
            <Alert severity="error" sx={{ width: '100%' }}>
              {errorValidateEmailByToken?.response?.data?.message}
            </Alert>
          )}

          <Stack direction="row" alignItems="center">
            {!isEmailReSended && !isEmailResendLoading && (
              <>
                <Typography variant="body2" align="center">
                  Can&apos;t find the email?
                </Typography>

                <Button
                  sx={{ textTransform: 'none' }}
                  onClick={() => sendEmailConfirmation(true)}
                >
                  Resend code
                </Button>
              </>
            )}

            {isEmailResendLoading && (
              <Typography variant="body2" align="center">
                Sending..
              </Typography>
            )}

            {isEmailReSended &&
              !isEmailResendLoading &&
              isSuccessSendEmailConfirmation && (
                <Typography variant="body2" align="center">
                  Code has been sent successfully.
                </Typography>
              )}

            {!isEmailResendLoading && isErrorEmailConfirmation && (
              <Typography variant="body2" align="center">
                Failed to send code.
              </Typography>
            )}
          </Stack>
        </>
      )}
    </GetStartedLayout>
  );
};

export default withAuthenticationRequired(GetStartedEmailConfirm);
