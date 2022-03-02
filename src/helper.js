/**
 * getCookie
 *
 * @param {string} cookieName name of the cookie
 * @return {string|null} value of the cookie if the cookie exists
 */
export const getCookie = (cookieName) => {
	const cookies = document.cookie.split(';');

	for (let index = 0; index < cookies.length; index++) {
		const [name, value] = cookies[index].split('=');

		if (cookieName === name.trim()) {
			return decodeURIComponent(value.trim());
		}
	}

	return null;
};


/**
 * setCookie
 *
 * @param {Object} options cookie value options
 */
export function setCookie(options = {}) {
	// Manage options prop with fallbacks
	//  @param {string} name - name of the cookie
	//  @param {string} value - value that should be stored in the cookie
	//  @param {number} seconds - seconds that will be used for the max age. Defaults to Ten years
	//  @param {string} path - path for which the cookie will be set for. Defaults to '/'
	//  @param {boolean} force - set regardless of GDPR tracking cookie. Defaults to false
	const {
		name = '',
		value = '',
		path = '/',
	} = options;

	if (typeof name !== 'string' || name === '') {
		//  eslint-disable-next-line no-console
		console.warn('The cookie name parameter is not valid');
		return;
	}

	document.cookie = `${name}=${encodeURIComponent(value)}; path=${path}; Secure`;
}

/**
 * deleteCookie
 *
 * @param {string} cookieName name of the cookie
 */
export function deleteCookie(cookieName) {
	setCookie({
		name: cookieName,
		value: '',
		seconds: -1,
		force: true,
	});
}
