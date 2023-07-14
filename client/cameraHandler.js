async function getListedDevice() {
	const devices = await navigator.mediaDevices.enumerateDevices();

	return devices.filter((device) => device.kind === 'videoinput');
}

function getStreamFromDeviceID(deviceID) {
	const constraints = {
		video: {
			deviceId: deviceID,
		},
	};

	return navigator.mediaDevices.getUserMedia(constraints);
}

const CameraHandler = {
	getListedDevice,
	getStreamFromDeviceID,
};

export default CameraHandler;
