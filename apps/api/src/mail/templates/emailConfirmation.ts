interface emailConfirmationProps {
  code: string;
  link: string;
}

export const emailConfirmation = ({ code, link }: emailConfirmationProps) => `
  <div>
    <h1>You're almost there</h1>
    <p>To confirm your email, simply go back to the browser window where you started creating your Fest account and enter this code</p>

    <b>${code}</b>

    <p>Or make it even quicker by clicking the button below</p>

    <a href='${link}'>Confirm your email</a>

    <p>If you didn't create an account in Fest, please ignore this message</p>
  </div>
`;
