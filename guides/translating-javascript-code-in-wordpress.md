# Handling translations in JavaScript Code

- Rename Theme / plugin to match textdomain
- From within the docker container (`10updocker shell`) move to the theme directory (`cd wp-content/themes/tenup-theme/`)
- Run `make-pot` cli command and exclude `node_modules` and `dist` directories `wp i18n make-pot . languages/tenup-theme.pot --exclude=node_modules/ --exclude=dist/`
-
