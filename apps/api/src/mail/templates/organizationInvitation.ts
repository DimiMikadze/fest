interface organizationInvitationProps {
  inviterName?: string;
  inviterEmail: string;
  organizationName: string;
  link: string;
}

export const organizationInvitation = ({
  inviterName,
  inviterEmail,
  organizationName,
  link,
}: organizationInvitationProps) => `
  <div>
    <h1>Join your team on Fest</h1>
    <p></p>

    <b>${
      inviterName && inviterName
    }(${inviterEmail}) has invited you to use Fest with them, in a team called ${organizationName}</b>

    <a href='${link}'>JOIN NOW</a>

  </div>
`;
