interface userAcceptedInviteProps {
  fullName?: string;
  email: string;
}

export const userAcceptedInvite = ({
  fullName,
  email,
}: userAcceptedInviteProps) => `
  <div>
    <h1>${fullName || email} has accepted your invitation</h1>
  </div>
`;
