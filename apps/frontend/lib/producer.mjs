import iceServers from './ice-servers.mjs'

export const getStreamAndTracks = async (type) => {
  const stream = type === 'screenShare' ?
    await navigator.mediaDevices.getDisplayMedia() :
    await navigator.mediaDevices.getUserMedia({audio: true, video: true})
  const tracks = stream.getTracks()
  return {
    stream,
    tracks
  }
}

export const initProducer = async (stream, tracks, type) => {
  // set up producer
  const producer = new RTCPeerConnection({
    iceServers
  })
  // get producer ice candidates
  const iceCandidatesPromise = new Promise((resolve, reject) => {
    const iceCandidates = []
    producer.onicecandidate = (event) => {
      if (event.candidate) {
        iceCandidates.push(event.candidate)
      } else {
        resolve(iceCandidates)
      }
    }
  })
  // on incoming tracks
  const trackPromise = new Promise((resolve, reject) => {
    producer.ontrack = (event) => {
      document.querySelector('#video').srcObject = event.streams[0]
      document.querySelector('#video').play()
      resolve()
    }
  })
  // add tracks to producer
  for (let i = 0; i < tracks.length; ++i) {
    const track = tracks[i]
    producer.addTrack(track, stream)
  }
  // set producer local description
  await producer.setLocalDescription(await producer.createOffer())
  // wait for all producer ice candidates
  const iceCandidates = await iceCandidatesPromise
  // send to consumer
  const producerDetails = {
    iceCandidates,
    localDescription: producer.localDescription
  }
  // wait for track
  if (type === 'videoAndAudio') {
    await trackPromise
  }
  return {
    producer,
    producerDetails
  }
}

export const onConsumer = async (producer, consumerDetails) => {
  // wire up consumer to producer
  await producer.setRemoteDescription(consumerDetails.localDescription)
  for (let i = 0; i < consumerDetails.iceCandidates.length; ++i) {
    const iceCandidate = consumerDetails.iceCandidates[i]
    await producer.addIceCandidate(new RTCIceCandidate(iceCandidate))
  }
}
