import { useAuth0 } from '@auth0/auth0-react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import axios from 'axios';
import {
  useAddMemberAfterInvite,
  useCreateUserBasedOnAuth0User,
  useGetAuthUser,
  useUpdateUser,
} from '../services';
import {
  AuthProviders,
  findAuthProviderFromAuth0Id,
  Frontend_Routes,
  InvitationTokenDecoded,
} from '@fest/shared';
import { useRouter } from 'next/router';
import { AuthLoading } from '../components/common';

interface AuthContextProps {
  isAuthLoading?: boolean;
  isAuthenticated?: boolean;
  authError?: string;
  auth0Error?: any;
  authUser?: any;
  setAuthUser?: any;
  refetchAuthUser?: any;
  setInvitationTokenDecoded?: (decoded: null | InvitationTokenDecoded) => void;
  setIsAuthLoading?: (isLoading: boolean) => void;
}

const AuthContext = createContext<AuthContextProps>({});

/**
 * Links auth0 user with a user in our database.
 * In auth0 we only store user's email and password.
 * Email verification is done on our end.
 */
export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [authUser, setAuthUser] = useState(null);
  const [authError, setAuthError] = useState('');
  const [invitationTokenDecoded, setInvitationTokenDecoded] =
    useState<InvitationTokenDecoded | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const {
    user: auth0User,
    error: auth0Error,
    isAuthenticated: auth0IsAuthenticated,
    isLoading: auth0IsLoading,
    getAccessTokenSilently: auth0GetAccessTokenSilently,
  } = useAuth0();

  const { refetch: getAuthUser } = useGetAuthUser();
  const { mutateAsync: createUserMutation } = useCreateUserBasedOnAuth0User();
  const { mutateAsync: updateUserMutation } = useUpdateUser();
  const { mutateAsync: addMemberAfterInviteMutation } =
    useAddMemberAfterInvite();

  /**
   * Re-fetches authUser information from the API and sets it in the state.
   */
  const refetchAuthUser = useCallback(async () => {
    const { data: refreshAuthUser } = await getAuthUser();
    console.log('refetchAuthUser', refreshAuthUser);
    setAuthUser(refreshAuthUser);
  }, [getAuthUser]);

  /**
   * Responsible for assigning a user to the organization after accepting the invite
   */
  useEffect(() => {
    if (!invitationTokenDecoded) return;
    if (!authUser) return;
    if (
      authUser.currentOrganization?.id === invitationTokenDecoded.organizationId
    ) {
      return;
    }
    // If email from the token isn't equal to the email which the user has used while authenticating
    // with auth0, we will not assign a user to the organization.
    if (invitationTokenDecoded.email !== authUser.email) {
      console.log(
        'Assigning a user to the organization failed due to email mismatch',
        authUser.email,
        invitationTokenDecoded.email
      );
      setAuthError(
        `Please login with ${invitationTokenDecoded.email} to accept the invitation.`
      );
      return;
    }

    // Add member to the organization in the db, reset invitation token, and refetch the authUser record.
    (async () => {
      try {
        await addMemberAfterInviteMutation({
          userId: authUser.id,
          organizationId: invitationTokenDecoded.organizationId,
          inviterEmail: invitationTokenDecoded.inviterEmail,
        });
        await refetchAuthUser();
        setInvitationTokenDecoded(null);
        console.log(
          'Member has been added successfully to the organization, authUser: ',
          authUser
        );
        setIsAuthLoading(false);
        router.push(Frontend_Routes.HOME);
      } catch (error) {
        console.log('Adding member after invite mutation has failed', error);
        setIsAuthLoading(false);
      }
    })();
  }, [
    invitationTokenDecoded,
    authUser,
    addMemberAfterInviteMutation,
    refetchAuthUser,
    router,
  ]);

  /**
   * Checks if a user is authenticated in auth0
   * Gets the accessToken from the auth0 and sets in axios headers
   * Gets the user record from our db or creates a new one
   */
  useEffect(() => {
    if (auth0IsLoading) {
      console.log('Auth0 Loading...');
      return;
    }

    if (auth0Error) {
      console.log('Auth0 error', auth0Error);
      setAuthUser(null);
      setIsAuthLoading(false);
      return;
    }

    if (!auth0IsAuthenticated) {
      console.log('Auth0 is not authenticated.');
      setAuthUser(null);
      setIsAuthLoading(false);
      return;
    }

    if (!auth0User) {
      console.log("Auth0 Can't find user");
      setAuthUser(null);
      setIsAuthLoading(false);
      return;
    }

    (async () => {
      // Before we send any request with axios, we need to get accessToken auth0 and
      // set it into the each request headers, so the API can authorize requests.
      // And the baseUrl, so we don't have to write our API url in each request.
      axios.interceptors.request.use(
        async (config) => {
          if (!config.headers['Authorization']) {
            const accessToken = await auth0GetAccessTokenSilently();
            config.headers['Authorization'] = `Bearer ${accessToken}`;
          }
          return config;
        },
        (error) => {
          console.log('Setting accessToken in axios interceptor failed', error);
          return Promise.reject(error);
        }
      );

      // Find out authProvider by looking auth0 users id.
      // its either email and password from auth0, or social login with Google.
      const authProvider: AuthProviders = findAuthProviderFromAuth0Id(
        auth0User.sub
      );

      // Check if there's a user in our db with the auth0 user's email address.
      const { data: existingAuthUser } = await getAuthUser();

      // Generate fullName from the data provided by auth0
      const fullName =
        auth0User.given_name && auth0User.family_name
          ? `${auth0User.given_name} ${auth0User.family_name}`
          : auth0User.name;

      // If there isn't, create a new one, based on the values that auth0 provides.
      if (!existingAuthUser) {
        const userToCreate = {
          [`${authProvider}Id`]: auth0User.sub,
          email: auth0User.email,
          ...(fullName && { fullName }),
          ...(auth0User.picture && { avatar: auth0User.picture }),
          // If a user has authenticated with Social (Google). It means their email is already verified.
          ...(authProvider === AuthProviders.GOOGLE && { emailVerified: true }),
        };
        const newlyCreatedUser = await createUserMutation(userToCreate);
        console.log('Successfully created a new auth user: ', newlyCreatedUser);
        setAuthUser(newlyCreatedUser);
        setIsAuthLoading(false);
        return;
      }

      // However, if we've got a record, we need to check if the providers id is defined on their record
      // To find out if they have previously logged in with the current provider. If true, we don't need to update their record.
      if (existingAuthUser[`${authProvider}Id`]) {
        console.log(
          `Successfully found auth user with the ${authProvider} provider:`,
          existingAuthUser
        );
        setAuthUser(existingAuthUser);
        setIsAuthLoading(false);
        return;
      }

      // Otherwise we need to update their record to link the new provider.
      const updatedUser = await updateUserMutation({
        userId: existingAuthUser.id,
        fields: {
          [`${authProvider}Id`]: auth0User.sub,
          ...(!existingAuthUser.fullName && fullName && { fullName }),
          ...(!existingAuthUser.picture &&
            auth0User.picture && { avatar: auth0User.picture }),
          // Edge case, when a user has signed up with email and password, but have not verified their email.
          // And then they tried to sign up with social (Google). In this case we need to verify their email
          // and reset email confirmation fields.
          ...(!existingAuthUser.emailVerified &&
            authProvider === AuthProviders.GOOGLE && {
              emailVerified: true,
              emailVerificationCode: null,
              emailVerificationToken: null,
              emailVerificationCodeExpires: null,
            }),
        },
      });
      console.log('Successfully updated authUser record', updatedUser);
      setAuthUser(updatedUser);

      // If invitationTokenDecoded is present then another useEffect responsible for
      // assigning a user tot the organization will stop the loading when needed
      if (!invitationTokenDecoded) {
        setIsAuthLoading(false);
      }
    })();
  }, [
    auth0IsAuthenticated,
    auth0Error,
    auth0IsLoading,
    auth0User,
    auth0GetAccessTokenSilently,
    createUserMutation,
    getAuthUser,
    updateUserMutation,
    invitationTokenDecoded,
  ]);

  const renderChildren = () => {
    if (isAuthLoading) {
      return <AuthLoading />;
    }

    return auth0Error || children;
  };

  return (
    <AuthContext.Provider
      value={{
        authUser,
        authError,
        auth0Error,
        isAuthenticated: auth0IsAuthenticated,
        isAuthLoading,
        setAuthUser,
        refetchAuthUser,
        setInvitationTokenDecoded,
        setIsAuthLoading,
      }}
    >
      {renderChildren()}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
