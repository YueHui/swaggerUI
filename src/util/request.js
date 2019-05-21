import fetch from 'dva/fetch';


function parseJSON(response) {
	return response.json();
}

function checkStatus(response) {
	if (response.status >= 200 && response.status < 300) {
		return response;
	}
	const error = new Error(response.statusText);
	error.response = response;
	throw error;
}


/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [postData] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, postData) {
		
	return fetch(url, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(postData)
	}).then(checkStatus)
	.then(parseJSON)
	.then((data) => {
		if (typeof data == "string") {
			data = JSON.parse(data);
		}
		if (data) {
			return data.data;
		} else {
			return;
		}

	})
}

export function get(url,data){
	return fetch(url,{
		method: 'GET',
		credentials: 'include',
	}).then(checkStatus)
		.then(parseJSON)
		.then((data) => {
			return data;

		})
}
