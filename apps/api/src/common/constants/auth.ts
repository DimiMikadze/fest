/**
 * Expiration period of the code for the email confirmation.
 */
export const EMAIL_CONFIRMATION_CODE_EXPIRY = 1; // in hours

/**
 * Expiration period of the token for the email verification.
 */
export const EMAIL_CONFIRMATION_TOKEN_EXPIRY = '1d'; // "10h", "7d" or number in milliseconds

/**
 * Expiration period of the token for team invitations
 */
export const ORGANIZATION_INVITATION_TOKEN_EXPIRY = '30d';

/**
 * Relations order for the users to correctly transform the user's record data.
 */
export const USER_RELATIONS = {
  organizations: {
    include: {
      organization: true,
    },
  },
};
