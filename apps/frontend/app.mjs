import {
  getStreamAndTracks,
  initProducer,
  onConsumer
} from './lib/producer.mjs'
import {
  set,
  waitFor
} from './lib/api.mjs'
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
    try {
      const channelName = document.querySelector('#channelName').value
      const mode = document.querySelector('#mode').value
      const type = document.querySelector('#type').value
      if (mode === 'producer') {
        const { stream, tracks } = await getStreamAndTracks(type)
        if (type === 'videoAndAudio') {
          document.querySelector('#ourVideo').srcObject = stream
        }
        const { producer, producerDetails } = await initProducer(stream, tracks)
        await set(`producerDetails:${channelName}`, producerDetails)
        const consumerDetails = await waitFor(`consumerDetails:${channelName}`, 1000)
        await onConsumer(producer, consumerDetails)
        // clean up
        await set(`producerDetails:${channelName}`, null)
        await set(`consumerDetails:${channelName}`, null)
      } else if (mode === 'consumer') {
        if (type === 'videoAndAudio') {
          const { stream, tracks } = await getStreamAndTracks(type)
          document.querySelector('#ourVideo').srcObject = stream
          const producerDetails = await waitFor(`producerDetails:${channelName}`, 1000)
          const { consumerDetails } = await initConsumer(producerDetails, stream, tracks)
          await set(`consumerDetails:${channelName}`, consumerDetails)
        } else {
          const producerDetails = await waitFor(`producerDetails:${channelName}`, 1000)
          const { consumerDetails } = await initConsumer(producerDetails)
          await set(`consumerDetails:${channelName}`, consumerDetails)
        }
      }
    } catch (err) {
      alert(err)
    }
  })
}

fillFormFromUrl()
initEvents()
