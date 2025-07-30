/* eslint-disable */
/* tslint:disable */

/**
 * Mock Service Worker (2.10.4).
 * @see https://github.com/mswjs/msw
 * - Please do NOT modify this file.
 * - Please do NOT serve this file on production.
 */

const INTEGRITY_CHECKSUM = '7e6c1b4e93f0f6764a0d7e9df63f9ae5'
const IS_MOCKED_RESPONSE = Symbol('isMockedResponse')
const activeClientIds = new Set()

self.addEventListener('install', function () {
  self.skipWaiting()
})

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('message', async function (event) {
  const clientId = event.source.id

  if (!clientId || !event.data) {
    return
  }

  const allClients = await self.clients.matchAll({
    type: 'window',
  })

  switch (event.data.type) {
    case 'MOCK_ACTIVATE': {
      activeClientIds.add(clientId)

      sendToClient(clientId, {
        type: 'MOCKING_ENABLED',
        payload: true,
      })
      break
    }

    case 'MOCK_DEACTIVATE': {
      activeClientIds.delete(clientId)
      break
    }

    case 'INTEGRITY_CHECK_REQUEST': {
      sendToClient(clientId, {
        type: 'INTEGRITY_CHECK_RESPONSE',
        payload: INTEGRITY_CHECKSUM,
      })
      break
    }

    case 'MOCK_REQUEST': {
      const { request, clientId: requestClientId } = event.data.payload

      const response = await resolveMainRequest(request)

      if (requestClientId) {
        sendToClient(requestClientId, {
          type: 'MOCK_RESPONSE',
          payload: {
            ...response,
            requestId: request.id,
          },
        })
      }
      break
    }
  }
})

self.addEventListener('fetch', function (event) {
  const { request } = event

  if (
    request.mode === 'navigate' &&
    request.method === 'GET' &&
    request.url === self.location.href
  ) {
    event.respondWith(
      new Response(
        `
<!DOCTYPE html>
<html>
  <head>
    <title>Mock Service Worker</title>
  </head>
  <body>
    <h1>Mock Service Worker</h1>
    <p>The worker is ready and intercepting requests.</p>
  </body>
</html>
        `,
        {
          status: 200,
          statusText: 'OK',
          headers: {
            'Content-Type': 'text/html',
          },
        }
      )
    )

    return
  }

  const acceptHeader = request.headers.get('accept') || ''

  if (
    acceptHeader.includes('text/html') ||
    acceptHeader.includes('text/css') ||
    acceptHeader.includes('application/javascript')
  ) {
    return
  }

  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') {
    return
  }

  if (request.mode === 'no-cors') {
    return
  }

  if (!activeClientIds.size) {
    return
  }

  event.respondWith(resolveMainRequest(request))
})

async function resolveMainRequest(request) {
  const url = new URL(request.url)
  const requestClone = request.clone()

  const allClients = await self.clients.matchAll({
    type: 'window',
  })

  if (!allClients.length) {
    return fetch(request)
  }

  for (const client of allClients) {
    if (!activeClientIds.has(client.id)) {
      continue
    }

    try {
      const response = await getResponse(requestClone, client.id)

      if (response.type === 'MOCK_NOT_FOUND') {
        continue
      }

      return response
    } catch (error) {
      continue
    }
  }

  return fetch(request)
}

async function getResponse(request, clientId) {
  return new Promise((resolve, reject) => {
    const requestId = crypto.randomUUID()
    const requestClone = request.clone()

    sendToClient(clientId, {
      type: 'MOCK_REQUEST',
      payload: {
        id: requestId,
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
        credentials: request.credentials,
        mode: request.mode,
        referrer: request.referrer,
        keepalive: request.keepalive,
        cache: request.cache,
        redirect: request.redirect,
        integrity: request.integrity,
        destination: request.destination,
        bodyUsed: request.bodyUsed,
        body: requestClone.body,
      },
    })

    const responseListener = (event) => {
      if (event.data.type !== 'MOCK_RESPONSE') {
        return
      }

      const { payload } = event.data

      if (payload.requestId !== requestId) {
        return
      }

      self.removeEventListener('message', responseListener)

      if (payload.type === 'MOCK_NOT_FOUND') {
        resolve(payload)
        return
      }

      const mockedResponse = new Response(payload.body, {
        status: payload.status,
        statusText: payload.statusText,
        headers: payload.headers,
      })

      Object.defineProperty(mockedResponse, IS_MOCKED_RESPONSE, {
        value: true,
        enumerable: false,
      })

      resolve(mockedResponse)
    }

    self.addEventListener('message', responseListener)

    setTimeout(() => {
      self.removeEventListener('message', responseListener)
      reject(new Error('MSW request timeout'))
    }, 5000)
  })
}

function sendToClient(clientId, message) {
  const client = self.clients.get(clientId)

  if (!client) {
    return
  }

  client.postMessage(message)
}