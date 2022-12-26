import { ComponentType, useEffect, FC } from 'react';
import Router from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import { AuthLoading } from '../../components/common';
import { Frontend_Routes } from '@fest/shared';

/**
 * A HOC requiring email verification to access specific page.
 *
 * withAuthenticationRequired from @auth0/auth0-react package check's whether is authenticated in auth0 or not.
 * This one however, check's if authUser's record exists in our database, and their email is verified.
 */
export const withEmailVerificationRequired = <P extends object>(
  Component: ComponentType<P>
): FC<P> => {
  return withAuthenticationRequired(
    function WithEmailVerificationRequired(props: P): JSX.Element {
      const { authUser, isAuthLoading } = useAuth();

      useEffect(() => {
        if (isAuthLoading) return;
        if (!authUser?.emailVerified) {
          Router.push(Frontend_Routes.GET_STARTED_EMAIL_CONFIRM);
          return;
        }
      }, [isAuthLoading, authUser?.emailVerified]);

      return authUser?.emailVerified ? <Component {...props} /> : null;
    },
    {
      onRedirecting: () => <AuthLoading />,
    }
  );
};
