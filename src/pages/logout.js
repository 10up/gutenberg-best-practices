import { deleteCookie } from '../helper';
import useIsBrowser from '@docusaurus/useIsBrowser';


export default function Logout() {

    const isInBrowser = useIsBrowser();

    if ( !isInBrowser ) {
        return null;
    }

    deleteCookie('10up-sso-login');

    window.location.replace('https://10up.com');

    return null;
}