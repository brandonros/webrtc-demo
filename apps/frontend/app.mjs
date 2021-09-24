import {
  getDisplayMedia,
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

document.querySelector('#connect').addEventListener('click', async (event) => {
  const channelName = document.querySelector('#channelName').value
  const mode = document.querySelector('#mode').value
  if (mode === 'producer') {
    const { stream, track } = await getDisplayMedia()
    const { producer, producerDetails } = await initProducer(stream, track)
    await signalingServerSet(`producerDetails:${channelName}`, producerDetails)
    const consumerDetails = await signalingServerPollFor(`consumerDetails:${channelName}`)
    await onConsumer(producer, consumerDetails)
    // clean up
    await signalingServerSet(`producerDetails:${channelName}`, null)
    await signalingServerSet(`consumerDetails:${channelName}`, null)
  } else if (mode === 'consumer') {
    const producerDetails = await signalingServerPollFor(`producerDetails:${channelName}`)
    const { consumerDetails } = await initConsumer(producerDetails)
    await signalingServerSet(`consumerDetails:${channelName}`, consumerDetails)
  }
})
