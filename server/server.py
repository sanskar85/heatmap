import cv2
import numpy as np
from collections import Counter
import base64
##################################################
from flask import Flask, jsonify, request
from flask_cors import CORS
import os

import uuid

app = Flask(__name__)
CORS(app)


@app.route('/api/data/<request_id>', methods=['GET'])
def get_data(request_id):
    filePath = "static/"+request_id
    net = cv2.dnn.readNet('config/yolov3.weights', 'config/yolov3.cfg')
    # to extract object name and append it to a list
    classes = []
    with open('config/coco.names', 'r') as f:
        classes = f.read().splitlines()

    # cap=cv2.VideoCapture(0)
    img = cv2.imread(filePath)
    detected_obj_count = []
    # detected_label_count=[]
    # _,img=cv2.read()
    height, width, _ = img.shape
    blob = cv2.dnn.blobFromImage(
        img, 1/255, (416, 416), (0, 0, 0), swapRB=True, crop=False)
    net.setInput(blob)
    output_layer_names = net.getUnconnectedOutLayersNames()
    layerOutputs = net.forward(output_layer_names)
    boxes = []
    confidences = []
    class_ids = []
    for output in layerOutputs:
        for detection in output:
            scores = detection[5:]
            class_id = np.argmax(scores)
            confidence = scores[class_id]
            if confidence > 0.5:
                center_x = int(detection[0]*width)
                center_y = int(detection[1]*height)
                w = int(detection[2]*width)
                h = int(detection[3]*height)

                x = int(center_x-w/2)
                y = int(center_y-h/2)

                boxes.append([x, y, w, h])
                confidences.append((float(confidence)))
                class_ids.append(class_id)

    indexes = cv2.dnn.NMSBoxes(boxes, confidences, 0.5, 0.4)
    font = cv2.FONT_HERSHEY_PLAIN
    colors = np.random.uniform(0, 255, size=(len(boxes), 3))

    # to identify each object detected
    if len(indexes) > 0:
        for i in indexes.flatten():
            x, y, w, h = boxes[i]
            label = str(classes[class_ids[i]])
            confidence = str(round(confidences[i], 2))
            color = colors[i]
            cv2.rectangle(img, (x, y), (x+w, y+h), color, 2)
            # to put text in the upper left corner of the image
            cv2.putText(img, label+" "+confidence, (x, y+20),
                        font, 2, (255, 255, 255), 2)
            detected_obj_count.append(label)

    # cv2.imshow('Image',img)
    # cv2.waitKey(0)

    # key=cv2.waitKey(1)

    # img.release()
    cv2.destroyAllWindows()

    # print(detected_obj_count)
    def count_per(x):
        result = Counter(x)
        return result['person']

    temp = count_per(detected_obj_count)

    data_from_python = {"message": temp}
    if os.path.isfile(filePath):
        os.remove(filePath)
    return jsonify(data_from_python)


@app.route('/api/upload', methods=['POST'])
def upload_base64_file():
    data = request.get_json()
    if data is None:
        print("No valid request body, json missing!")
        return jsonify({'error': 'No valid request body, json missing!'})
    else:
        img_data = data['base64String']
        base64_data = img_data.split(',')
        img_data = base64.b64decode(base64_data[1])

        file_name = generateRandomID()+".jpg"
        img_file = open("static/"+file_name, 'wb')
        img_file.write(img_data)
        img_file.close()
        return jsonify({
            'request_id': file_name
        })


def generateRandomID():
    return uuid.uuid4().hex


if __name__ == '__main__':
    app.run(port=5000)
# 3
