import { Stack } from '@mui/material';
import { Divider } from '@mui/material';
import React, { ReactNode } from 'react';
import { LogOutButton, Link } from '.';
import { useAuth } from '../../context/AuthContext';

interface AppLayoutPros {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutPros) => {
  const { authUser } = useAuth();

  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mx={2}
        py={2}
      >
        <Link href="/">
          <b>{authUser.currentOrganization.name}</b>
        </Link>

        <LogOutButton />
      </Stack>

      <Divider orientation="horizontal" flexItem />

      {children}
    </>
  );
};

export default AppLayout;
