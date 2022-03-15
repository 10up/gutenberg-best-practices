import React from 'react';
import Layout from '@theme-original/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { deleteCookie, getCookie } from '../../helper';
import { useEffect, useState } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

export default function LayoutWrapper(props) {

	return <BrowserOnly fallback={<div>Authenticating...</div>}>
		{() => <VerifyLogin {...props} />}
	</BrowserOnly>;
}

function VerifyLogin(props) {
	const {
		siteConfig: { url, customFields: { googleSSOClientId, tenupSSOProxy } },
	} = useDocusaurusContext();
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	const authCookie = getCookie('10up-sso-login');
	const hasCookie = !!authCookie;

	useEffect(() => {
		if ( hasCookie ) {
			const nonce = authCookie.nonce;
			const email = authCookie.email;

			const verificationUrl = new URL(tenupSSOProxy);
			verificationUrl.searchParams.set('action', '10up-verify');
			verificationUrl.searchParams.set('nonce', nonce);
			verificationUrl.searchParams.set('email', email);

			fetch(verificationUrl).then((response) => {
				if (response.status === 200) {
					setIsAuthenticated(true);
				} else {
					console.error('Login verification failed');
					deleteCookie('10up-sso-login');
				}
			});
		}
	}, [authCookie]);

	function redirectToLogin() {
		const returnUrl = new URL(`${url}/login`);
		returnUrl.searchParams.set('return_to', window.location.href);

		const ssoUrl = new URL(tenupSSOProxy);
		ssoUrl.searchParams.set('action', '10up-login');

		const loginUrl = new URL('https://accounts.google.com/o/oauth2/auth/oauthchooseaccount');
		loginUrl.searchParams.set('response_type', 'code');
		loginUrl.searchParams.set('access_type', 'online');
		loginUrl.searchParams.set('client_id', `${googleSSOClientId}.apps.googleusercontent.com`);
		loginUrl.searchParams.set('redirect_uri', ssoUrl);
		loginUrl.searchParams.set('state', returnUrl);
		loginUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile');
		loginUrl.searchParams.set('flowName', 'GeneralOAuthFlow');

		window.location.replace(loginUrl);

		// ensure that the page is not rendered for non logged in users
		return null;
	}

	if (!hasCookie) {
		redirectToLogin();
	}

	if ( !isAuthenticated ) {
		return <div>Authenticating...</div>;
	}

	return (
		<>
			<Layout {...props} />
		</>
	);
}