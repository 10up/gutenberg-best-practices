import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { deleteCookie } from '../helper';
import useIsBrowser from '@docusaurus/useIsBrowser';


export default function Logout() {

    const isInBrowser = useIsBrowser();

    if ( !isInBrowser ) {
        return null;
    }

    const {
        siteConfig: { url },
      } = useDocusaurusContext();
    
    deleteCookie('10up-sso-login');

    window.location.replace( url );

    return null;
}