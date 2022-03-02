import { setCookie } from '../helper';

export default function Login() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    
    setCookie({ name: '10up-sso-login', value: JSON.stringify({fullName: urlParams.get('full_name')}) } )

    window.location.replace( urlParams.get('return_to') );

    return null;
}