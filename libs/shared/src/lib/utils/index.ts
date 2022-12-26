import { AuthProviders } from '../types';

export const findAuthProviderFromAuth0Id = (id: string): AuthProviders => {
  if (id.startsWith(AuthProviders.GOOGLE)) {
    return AuthProviders.GOOGLE;
  }

  return AuthProviders.AUTH0;
};

export const isObjectEmpty = (obj: { [key: string]: unknown }) => {
  for (const i in obj) return false;
  return true;
};

export const isValidEmail = (email: string) => {
  const regex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(email);
};

export const isNotEmptyArray = (array: unknown[]) => {
  return array && array.length;
};
