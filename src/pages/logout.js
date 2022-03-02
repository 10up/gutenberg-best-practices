import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { deleteCookie } from '../helper';

export default function Logout() {

    const {
        siteConfig: { url },
      } = useDocusaurusContext();
    
    deleteCookie('10up-sso-login');

    window.location.replace( url );

    return null;
}