# webrtc-demo
Express signaling server + producer/consumer screen/video/audio sharing

## How to run

1. clone
1. `npx lerna bootstrap`
1. `npx lerna run start --stream`

## Example URLs

* Producer: http://localhost:3000/?channelName=videoCall1&mode=producer&type=videoAndAudio
* Consumer: http://localhost:3000/?channelName=videoCall1&mode=consumr&type=videoAndAudio

* Producer: http://localhost:3000/?channelName=screenShare1&mode=producer&type=screenShare
* Consumer: http://localhost:3000/?channelName=screenShare1&mode=consumr&type=screenShare
