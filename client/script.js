import CameraHandler from './cameraHandler.js';
import ImageHandler from './imageHandler.js';
import API from './api.js';

const videoCaptureButton = document.getElementById('video-capture-button');
const streamWrapper = document.getElementById('stream-wrapper');
const VIDEO_ELEMENT_ID = 'video-element';
const CANVAS_ELEMENT_ID = 'canvas-element';
const HEATMAP_ELEMENT_ID = 'heatmap-element';

const VIDEO_ELEMENT_HEIGHT = 240;
const VIDEO_ELEMENT_WIDTH = 320;

videoCaptureButton.addEventListener('click', async () => {
	const listedDevices = await CameraHandler.getListedDevice();
	const deviceIDs = listedDevices.map((device) => device.deviceId);
	startLoadingStreams(deviceIDs);
});

function startLoadingStreams(deviceIDs) {
	deviceIDs.forEach(async (deviceID, index) => {
		const { videoElementID, canvasElementID, heatMapElementID } = createStreamElement(index);
		const stream = await CameraHandler.getStreamFromDeviceID(deviceID);
		loadStreamToVideo(videoElementID, stream);

		startCapturingFrames(videoElementID, canvasElementID, heatMapElementID);
	});
}

function startCapturingFrames(videoElementID, canvasElementID, heatMapElementID) {
	setInterval(async () => {
		const imageURL = ImageHandler.captureFrame(videoElementID, canvasElementID);
		try {
			const requestID = await API.sendImageToServer(imageURL);
			const count = await API.getCountFromServer(requestID);

			createHeatMapData(heatMapElementID, count);
		} catch (error) {
			console.log(error);
		}
	}, 5000);
}

function createStreamElement(id) {
	const wrapper = document.createElement('div');
	wrapper.className = 'row justify-content-center col-sm-auto';
	wrapper.style = 'width: 100%; border: 0px';

	const videoWrapper = document.createElement('div');
	videoWrapper.className = 'form-group row col-sm-6';
	videoWrapper.style = 'margin: 0px; border: 0px';
	wrapper.appendChild(videoWrapper);

	const videoContainer = document.createElement('div');
	videoContainer.className = 'form-group col';
	videoContainer.style = 'margin: 0px; border: 0px';
	videoWrapper.appendChild(videoContainer);

	const videoElement = document.createElement('video');
	videoElement.id = `${VIDEO_ELEMENT_ID}-${id}`;
	videoElement.width = VIDEO_ELEMENT_WIDTH;
	videoElement.height = VIDEO_ELEMENT_HEIGHT;

	videoContainer.appendChild(videoElement);

	const canvasWrapper = document.createElement('div');
	canvasWrapper.className = 'form-group row col-sm-6';
	canvasWrapper.style = 'margin: 0px; border: 0px';
	wrapper.appendChild(canvasWrapper);

	const canvasContainer = document.createElement('div');
	canvasContainer.className = 'form-group col';
	canvasContainer.style = 'margin: 0px; border: 0px';
	canvasWrapper.appendChild(canvasContainer);

	const canvasElement = document.createElement('canvas');
	canvasElement.id = `${CANVAS_ELEMENT_ID}-${id}`;
	canvasElement.width = VIDEO_ELEMENT_WIDTH;
	canvasElement.height = VIDEO_ELEMENT_HEIGHT;
	canvasElement.style = 'display: none';
	canvasContainer.appendChild(canvasElement);

	const heatMapContainer = document.createElement('div');
	heatMapContainer.className = 'form-group col';
	heatMapContainer.style = 'margin: 0px; border: 0px';
	canvasWrapper.appendChild(heatMapContainer);

	const heatMapElement = document.createElement('div');
	heatMapElement.id = `${HEATMAP_ELEMENT_ID}-${id}`;
	heatMapElement.width = 320;
	heatMapElement.height = 240;
	heatMapContainer.appendChild(heatMapElement);

	streamWrapper.appendChild(wrapper);

	return {
		videoElementID: videoElement.id,
		canvasElementID: canvasElement.id,
		heatMapElementID: heatMapElement.id,
	};
}

function loadStreamToVideo(videoID, stream) {
	const element = document.getElementById(videoID);
	element.srcObject = stream;
	element.play();
}

function createHeatMapData(heatMapElementID, count) {
	var data = [
		{
			z: [[count]],
			colorscale: [
				[0, 'green'],
				[0.1, 'green'],
				[0.1, 'rgb(253, 237, 176)'],
				[0.2, 'rgb(249, 198, 139)'],
				[0.3, 'rgb(244, 159, 109)'],
				[0.4, 'rgb(234, 120, 88)'],
				[0.5, 'rgb(218, 83, 82)'],
				[0.6, 'rgb(191, 54, 91)'],
				[0.7, 'rgb(158, 35, 98)'],
				[0.8, 'rgb(120, 26, 97)'],
				[0.9, 'rgb(83, 22, 84)'],
				[1.0, 'rgb(47, 15, 61)'],
			],
			type: 'heatmap',
			zmin: 0,
			zmax: 10,
		},
	];

	Plotly.newPlot(heatMapElementID, data);
}
