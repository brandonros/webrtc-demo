const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const getDisplayMedia = async () => {
  const stream = await navigator.mediaDevices.getDisplayMedia()
  const tracks = stream.getTracks()
  const track = tracks[0]
  return {
    stream,
    track
  }
}

const initProducer = async (stream, track) => {
  // set up producer
  const producer = new RTCPeerConnection({
    iceServers: [
      {
        urls: ['stun:stun.l.google.com:19302']
      }
    ]
  })
  // get producer ice candidates
  const promise = new Promise((resolve, reject) => {
    const iceCandidates = []
    producer.onicecandidate = (event) => {
      if (event.candidate) {
        iceCandidates.push(event.candidate)
      } else {
        resolve(iceCandidates)
      }
    }
  })
  // add track to producer
  producer.addTrack(track, stream)
  // set producer local description
  await producer.setLocalDescription(await producer.createOffer())
  // wait for all producer ice candidates
  const iceCandidates = await promise
  // send to consumer
  const producerDetails = {
    iceCandidates,
    localDescription: producer.localDescription
  }
  return {
    producer,
    producerDetails
  }
}

const onConsumer = async (producer, consumerDetails) => {
  // wire up consumer to producer
  await producer.setRemoteDescription(consumerDetails.localDescription)
  for (let i = 0; i < consumerDetails.iceCandidates.length; ++i) {
    const iceCandidate = consumerDetails.iceCandidates[i]
    await producer.addIceCandidate(new RTCIceCandidate(iceCandidate))
  }
}

const initConsumer = async (producerDetails) => {
  // set up consumer
  const consumer = new RTCPeerConnection({
    iceServers: [
      {
        urls: ['stun:stun.l.google.com:19302']
      }
    ]
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

const set = async (key, value) => {
  const response = await fetch(`/api/state/${key}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      key,
      value
    })
  })
  if (response.status !== 204) {
    throw new Error(`Invalid status: ${response.status}`)
  }
}

const waitFor = async (key) => {
  for (;;) {
    const response = await fetch(`/api/state/${key}`)
    if (response.status !== 200) {
      throw new Error(`Invalid status: ${response.status}`)
    }
    const responseBody = await response.json()
    const { value } = responseBody
    if (value !== null) {
      return value
    }
    await delay(1000)
  }
}

document.querySelector('#connect').addEventListener('click', async (event) => {
  const channelName = document.querySelector('#channelName').value
  const mode = document.querySelector('#mode').value
  if (mode === 'producer') {
    const { stream, track } = await getDisplayMedia()
    const { producer, producerDetails } = await initProducer(stream, track)
    await set(`producerDetails:${channelName}`, producerDetails)
    const consumerDetails = await waitFor(`consumerDetails:${channelName}`)
    await onConsumer(producer, consumerDetails)
    // clean up
    await set(`producerDetails:${channelName}`, null)
    await set(`consumerDetails:${channelName}`, null)
  } else if (mode === 'consumer') {
    const producerDetails = await waitFor(`producerDetails:${channelName}`)
    const { consumerDetails } = await initConsumer(producerDetails)
    await set(`consumerDetails:${channelName}`, consumerDetails)
  }
})
