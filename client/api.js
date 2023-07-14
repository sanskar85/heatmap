function getCountFromServer(request_id) {
	const url = 'http://127.0.0.1:5000/api/data/' + request_id;
	return new Promise((resolve, reject) => {
		fetch(url)
			.then((response) => response.json())
			.then((data) => {
				const count = data.message;
				resolve(count);
			})
			.catch((error) => {
				reject('Error Uploading Image');
			});
	});
}

function sendImageToServer(imageDataURL) {
	const url = 'http://127.0.0.1:5000/api/upload';

	return new Promise((resolve, reject) => {
		fetch(url, {
			method: 'POST',
			body: JSON.stringify({
				base64String: imageDataURL,
			}),
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then((response) => response.json())
			.then((data) => {
				const requestID = data.request_id;
				resolve(requestID);
			})
			.catch((error) => {
				reject('Error Uploading Image');
			});
	});
}

const API = {
	sendImageToServer,
	getCountFromServer,
};

export default API;
