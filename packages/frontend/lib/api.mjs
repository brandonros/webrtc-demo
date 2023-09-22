import { signalingServer } from './config.mjs'
import { delay } from './utilities.mjs'

export const set = async (key, value) => {
  const response = await fetch(`${signalingServer}/api/state/${key}`, {
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

export const waitFor = async (key, interval) => {
  for (;;) {
    const response = await fetch(`${signalingServer}/api/state/${key}`)
    if (response.status !== 200) {
      throw new Error(`Invalid status: ${response.status}`)
    }
    const responseBody = await response.json()
    const { value } = responseBody
    if (value !== null) {
      return value
    }
    await delay(interval)
  }
}
