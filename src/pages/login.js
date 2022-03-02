import { setCookie } from '../helper';
import useIsBrowser from '@docusaurus/useIsBrowser';

export default function Login() {

    const isInBrowser = useIsBrowser();

    if ( !isInBrowser ) {
        return null;
    }

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    
    setCookie({ name: '10up-sso-login', value: JSON.stringify({fullName: urlParams.get('full_name')}) } )

    window.location.replace( urlParams.get('return_to') );

    return null;
}