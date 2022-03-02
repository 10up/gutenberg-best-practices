import React from 'react';
import Layout from '@theme-original/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { getCookie } from '../../helper';
import useIsBrowser from '@docusaurus/useIsBrowser';

export default function LayoutWrapper(props) {

    const isInBrowser = useIsBrowser();

    if ( !isInBrowser ) {
        return <Layout {...props} />;
    }

  const {
    siteConfig: { url, customFields: {googleSSOClientId} },
  } = useDocusaurusContext();

  const isAuthenticated = !! getCookie('10up-sso-login');

  if ( !isAuthenticated ) {

    const returnUrl = new URL( `${url}/login` );
    returnUrl.searchParams.set('return_to', window.location.href);

    const loginUrl = new URL('https://accounts.google.com/o/oauth2/auth/oauthchooseaccount');
    loginUrl.searchParams.set('response_type', 'code');
    loginUrl.searchParams.set('access_type', 'online');
    loginUrl.searchParams.set('client_id', `${googleSSOClientId}.apps.googleusercontent.com`);
    loginUrl.searchParams.set('redirect_uri', 'https://ssoproxy.10uplabs.com/wp-login.php?action=10up-login');
    loginUrl.searchParams.set('state', returnUrl);
    loginUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile');
    loginUrl.searchParams.set('flowName', 'GeneralOAuthFlow');

    window.location.replace( loginUrl );

    // ensure that the page is not rendered for non logged in users
    return null;
  } 

  return (
    <>
      <Layout {...props} />
    </>
  );
}
