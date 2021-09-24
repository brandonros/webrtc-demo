import iceServers from './ice-servers.mjs'

export const initConsumer = async (producerDetails, stream, tracks) => {
  // set up consumer
  const consumer = new RTCPeerConnection({
    iceServers
  })
  // on incoming track
  const trackPromise = new Promise((resolve, reject) => {
    consumer.ontrack = (event) => {
      document.querySelector('#theirVideo').srcObject = event.streams[0]
      document.querySelector('#theirVideo').play()
      resolve()
    }
  })
  // add outgoing tracks
  if (stream && tracks) {
    for (let i = 0; i < tracks.length; ++i) {
      const track = tracks[i]
      consumer.addTrack(track, stream)
    }
  }
  // wire up consumer to producer
  await consumer.setRemoteDescription(producerDetails.localDescription)
  for (let i = 0; i < producerDetails.iceCandidates.length; ++i) {
    const iceCandidate = producerDetails.iceCandidates[i]
    await consumer.addIceCandidate(new RTCIceCandidate(iceCandidate))
  }
  // make consumer accept remote offer
  await consumer.setLocalDescription(await consumer.createAnswer())
  // get ice candidates
  const iceCandidatesPromise = new Promise((resolve, reject) => {
    const iceCandidates = []
    consumer.onicecandidate = (event) => {
      if (event.candidate) {
        iceCandidates.push(event.candidate)
      } else {
        resolve(iceCandidates)
      }
    }
  })
  // wait for ice candidates
  const iceCandidates = await iceCandidatesPromise
  // send to producer
  const consumerDetails = {
    localDescription: consumer.localDescription,
    iceCandidates
  }
  // wait for track
  await trackPromise
  return {
    consumer,
    consumerDetails
  }
}
