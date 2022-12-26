import { AppProps } from 'next/app';
import { AppState, Auth0Provider } from '@auth0/auth0-react';
import Router from 'next/router';
import Head from 'next/head';
import axios from 'axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider, EmotionCache } from '@emotion/react';

import { AuthProvider } from '../context/AuthContext';
import { createEmotionCache, theme } from '../utils';

const queryClient = new QueryClient();

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;

function CustomApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>

      <Auth0Provider
        domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN}
        clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID}
        audience={process.env.NEXT_PUBLIC_AUTH0_API_AUDIENCE}
        redirectUri={typeof window !== 'undefined' && window.location.origin}
        onRedirectCallback={(appState: AppState) => {
          Router.replace(appState?.returnTo || '/');
        }}
        scope="openid email profile"
      >
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <AuthProvider>
              <Component {...pageProps} />
            </AuthProvider>

            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />
          </ThemeProvider>

          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </Auth0Provider>
    </CacheProvider>
  );
}

export default CustomApp;
