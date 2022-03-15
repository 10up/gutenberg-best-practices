import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { deleteCookie } from '../helper';
import useIsBrowser from '@docusaurus/useIsBrowser';


export default function Logout() {

    const isInBrowser = useIsBrowser();

    if ( !isInBrowser ) {
        return null;
    }

    deleteCookie('10up-sso-login');

    return (
        <p>You have been logged out successfully.</p>
    );
}