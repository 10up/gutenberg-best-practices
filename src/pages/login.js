import React from 'react';
import { setCookie } from '../helper';
import { useEffect } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function Login() {

    return <BrowserOnly fallback={<div>Authenticating...</div>}>
        {() => <VerifyLogin />}
    </BrowserOnly>;
}

function VerifyLogin() {
    const {
        siteConfig: { customFields: { tenupSSOProxy } },
    } = useDocusaurusContext();

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    const nonce = urlParams.get('nonce');
    const email = urlParams.get('email');

    useEffect(() => {
        if (nonce && email) {

            const verificationUrl = new URL(tenupSSOProxy);
            verificationUrl.searchParams.set('action', '10up-verify');
            verificationUrl.searchParams.set('nonce', nonce);
            verificationUrl.searchParams.set('email', email);

            // verify that the nonce is valid
            fetch(verificationUrl).then((response) => {
                if (response.status === 200) {
                    setCookie({ name: '10up-sso-login', value: JSON.stringify({ fullName: urlParams.get('full_name') }) });
                    window.location.replace(urlParams.get('return_to'));
                } else {
                    console.error('Login verification failed');
                }
            });
        }
    }, [nonce, email]);

    return null;
}