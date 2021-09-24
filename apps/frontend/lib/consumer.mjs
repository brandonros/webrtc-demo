import iceServers from './ice-servers.mjs'

export const initConsumer = async (producerDetails) => {
  // set up consumer
  const consumer = new RTCPeerConnection({
    iceServers
  })
  const trackPromise = new Promise((resolve, reject) => {
    consumer.ontrack = (event) => {
      document.querySelector('#video').srcObject = event.streams[0]
      document.querySelector('#video').play()
      resolve()
    }
  })
  // wire up consumer to producer
  await consumer.setRemoteDescription(producerDetails.localDescription)
  for (let i = 0; i < producerDetails.iceCandidates.length; ++i) {
    const iceCandidate = producerDetails.iceCandidates[i]
    await consumer.addIceCandidate(new RTCIceCandidate(iceCandidate))
  }
  // make consumer accept remote offer
  await consumer.setLocalDescription(await consumer.createAnswer())
  // get ice candidates
  const icePromise = new Promise((resolve, reject) => {
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
  const iceCandidates = await icePromise
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
