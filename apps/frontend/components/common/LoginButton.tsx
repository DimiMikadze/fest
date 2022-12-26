import { useAuth0 } from '@auth0/auth0-react';
import { Button, ButtonProps } from '@mui/material';
import { Google as GoogleIcon, Email as EmailIcon } from '@mui/icons-material';

interface LoginButtonProps extends ButtonProps {
  connection?: null | 'google-oauth2'; // null is auth0
  screenHint?: 'login' | 'signup';
  display?: 'popup' | 'page';
  children: string;
  // It must be whitelisted in the "Allowed Callback URLs" field in our Auth0 Application's settings.
  redirectUri?: string;
  displayIcon?: boolean;
}

const LoginButton = ({
  connection = null,
  screenHint = 'login',
  display = 'popup',
  children,
  redirectUri,
  displayIcon,
  ...buttonProps
}: LoginButtonProps) => {
  const { loginWithRedirect, loginWithPopup } = useAuth0();

  const options = {
    screen_hint: screenHint,
    ...(connection && { connection }),
    ...(redirectUri && { redirect_uri: redirectUri }),
  };

  return (
    <Button
      startIcon={displayIcon && (connection ? <GoogleIcon /> : <EmailIcon />)}
      variant="outlined"
      onClick={() =>
        display === 'popup'
          ? loginWithPopup(options)
          : loginWithRedirect(options)
      }
      {...buttonProps}
    >
      {children}
    </Button>
  );
};

export default LoginButton;
