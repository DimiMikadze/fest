import React from 'react';
import { CircularProgress, Stack } from '@mui/material';

const AuthLoading = () => {
  return (
    <Stack alignItems="center" m="auto" mt={20}>
      <CircularProgress />
    </Stack>
  );
};

export default AuthLoading;
