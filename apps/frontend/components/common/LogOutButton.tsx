import { useAuth0 } from '@auth0/auth0-react';
import Button from '@mui/material/Button';
import { useAuth } from '../../context/AuthContext';

const LogoutButton = () => {
  const { logout: logoutAuth0 } = useAuth0();
  const { setIsAuthLoading } = useAuth();

  const logout = async () => {
    setIsAuthLoading(true);
    return logoutAuth0({
      returnTo: window.location.origin,
    });
  };

  return <Button onClick={logout}>Log Out</Button>;
};

export default LogoutButton;
