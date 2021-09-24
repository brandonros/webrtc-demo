import {
  getStreamAndTracks,
  initProducer,
  onConsumer
} from './lib/producer.mjs'
import {
  signalingServerSet,
  signalingServerPollFor
} from './lib/signaling-server.mjs'
import {
  initConsumer
} from './lib/consumer.mjs'

const fillFormFromUrl = () => {
  const parsedUrl = new URL(window.location.href)
  const channelName = parsedUrl.searchParams.get('channelName')
  const mode = parsedUrl.searchParams.get('mode')
  const type = parsedUrl.searchParams.get('type')
  if (channelName) {
    document.querySelector('#channelName').value = channelName
  }
  if (mode) {
    document.querySelector('#mode').value = mode
  }
  if (type) {
    document.querySelector('#type').value = type
  }
}

const initEvents = () => {
  document.querySelector('#connect').addEventListener('click', async (event) => {
    const channelName = document.querySelector('#channelName').value
    const mode = document.querySelector('#mode').value
    const type = document.querySelector('#type').value
    if (mode === 'producer') {
      const { stream, tracks } = await getStreamAndTracks(type)
      if (type === 'videoAndAudio') {
        document.querySelector('#ourVideo').srcObject = stream
        document.querySelector('#ourVideo').play()
      }
      const { producer, producerDetails } = await initProducer(stream, tracks)
      await signalingServerSet(`producerDetails:${channelName}`, producerDetails)
      const consumerDetails = await signalingServerPollFor(`consumerDetails:${channelName}`)
      await onConsumer(producer, consumerDetails)
      // clean up
      await signalingServerSet(`producerDetails:${channelName}`, null)
      await signalingServerSet(`consumerDetails:${channelName}`, null)
    } else if (mode === 'consumer') {
      if (type === 'videoAndAudio') {
        const { stream, tracks } = await getStreamAndTracks(type)
        const producerDetails = await signalingServerPollFor(`producerDetails:${channelName}`)
        const { consumerDetails } = await initConsumer(producerDetails, stream, tracks)
        await signalingServerSet(`consumerDetails:${channelName}`, consumerDetails)
        document.querySelector('#ourVideo').srcObject = stream
        document.querySelector('#ourVideo').play()
      } else {
        const producerDetails = await signalingServerPollFor(`producerDetails:${channelName}`)
        const { consumerDetails } = await initConsumer(producerDetails)
        await signalingServerSet(`consumerDetails:${channelName}`, consumerDetails)
      }
    }
  })
}

fillFormFromUrl()
initEvents()
