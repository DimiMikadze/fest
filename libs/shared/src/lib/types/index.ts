export enum AuthProviders {
  GOOGLE = 'google',
  AUTH0 = 'auth0',
}

export interface InvitationTokenDecoded {
  email: string;
  organizationId: string;
  organizationName: string;
  inviterId: string;
  inviterEmail: string;
}
