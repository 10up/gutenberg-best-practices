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
			if ( value ) {
				return JSON.parse(decodeURIComponent(value.trim()));
			} else {
				return null;
			}
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
	const {
		name = '',
		value = '',
		path = '/',
		expire = '',
	} = options;

	if (typeof name !== 'string' || name === '') {
		//  eslint-disable-next-line no-console
		console.warn('The cookie name parameter is not valid');
		return;
	}

	document.cookie = `${name}=${encodeURIComponent(value)}; path=${path}; Secure; ${expire}`;
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
		expire: 'expires=Thu, 01 Jan 1970 00:00:01 GMT',
	});
}
