import { delay } from './utilities.mjs'

export const signalingServerSet = async (key, value) => {
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

export const signalingServerPollFor = async (key) => {
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
