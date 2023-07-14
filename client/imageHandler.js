function captureFrame(videoElementID, canvasElementID) {
	console.log('Capturing frame', videoElementID, canvasElementID);
	const videoElement = document.getElementById(videoElementID);
	const canvasElement = document.getElementById(canvasElementID);
	const context = canvasElement.getContext('2d');
	context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
	const imageDataURL = canvasElement.toDataURL('image/jpg');
	//console.log(imageDataURL);
	const imgElement = document.createElement('img');
	imgElement.src = imageDataURL;
	return imageDataURL;
}

function captureMultipleCameraFrame(elements) {
	for (let i = 0; i < elements.length; i++) {
		const { videoElement, canvasElement } = elements[i];
		const imageURL = captureFrame(videoElement, canvasElement);
		sendImageToServer(imageURL);
	}
}

function sendImageToServer(imageDataURL) {
	// const data = {
	// 	image: imageDataURL,
	// };
	// const url = '/api/image';
	// const options = {
	// 	method: 'POST',
	// 	body: JSON.stringify(data),
	// 	headers: {
	// 		'Content-Type': 'application/json',
	// 	},
	// };
	console.log('Sending image to server');
}

const ImageHandler = {
	captureFrame,
	captureMultipleCameraFrame,
	sendImageToServer,
};

export default ImageHandler;
