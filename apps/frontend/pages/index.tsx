import type { NextPage } from 'next';
import { AppLayout } from '../components/common';
import { useAuth } from '../context/AuthContext';
import { withOrganizationRequired } from '../utils';

const Home: NextPage = () => {
  const { authUser } = useAuth();

  if (!authUser) return <div>Not authenticated..</div>;

  return (
    <AppLayout>
      <h3>User profile</h3>

      <ul>
        <li>
          FullName: <b>{authUser.fullName}</b>
        </li>
        <li>
          Email: <b>{authUser.email}</b>
        </li>
      </ul>
      <h3>Current Organization</h3>
      <ul>
        <li>
          Name: <b>{authUser.currentOrganization.name}</b> | Role:{' '}
          <b>{authUser.currentOrganization.role}</b>
        </li>
      </ul>
      <h3>All Organizations</h3>
      <ul>
        {authUser.organizations.map((org) => (
          <li key={org.id}>
            Name: <b>{org.name}</b> | Role: <b>{org.role}</b>
          </li>
        ))}
      </ul>
    </AppLayout>
  );
};

export default withOrganizationRequired(Home);
