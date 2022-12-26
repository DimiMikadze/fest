import { Stack } from '@mui/material';
import { Box } from '@mui/system';
import { Divider } from '@mui/material';
import React, { ReactNode } from 'react';
import { LogOutButton } from '../common';
import { LogoIcon } from '../common/icons';

interface GetStartedLayoutPros {
  children: ReactNode;
  hideLogOutButton?: boolean;
}

const GetStartedLayout = ({
  children,
  hideLogOutButton = false,
}: GetStartedLayoutPros) => {
  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mx={2}
        py={2}
      >
        <Box>
          <LogoIcon color="black" />
        </Box>

        {!hideLogOutButton && <LogOutButton />}
      </Stack>

      <Divider orientation="horizontal" flexItem />

      <Box mb={8} />

      <Stack spacing={2} maxWidth={440} alignItems="center" m="auto">
        {children}
      </Stack>
    </>
  );
};

export default GetStartedLayout;
