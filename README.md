# webrtc-demo
Express signaling server + producer/consumer screen/video/audio sharing

## How to run

1. clone
1. `npm install`
1. `npm run start --workspace=backend`
1. `npm run server --workspace=frontend`

## Example URLs

* Producer: http://localhost:8080/?channelName=videoCall1&mode=producer&type=videoAndAudio
* Consumer: http://localhost:8080/?channelName=videoCall1&mode=consumr&type=videoAndAudio

* Producer: http://localhost:8080/?channelName=screenShare1&mode=producer&type=screenShare
* Consumer: http://localhost:8080/?channelName=screenShare1&mode=consumr&type=screenShare
