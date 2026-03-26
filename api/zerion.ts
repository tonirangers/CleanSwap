import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Client sends the full Zerion API path as ?url=/wallets/0x.../positions/...
  const zerionPath = req.query.url
    ? (Array.isArray(req.query.url) ? req.query.url[0] : req.query.url)
    : req.query.path
      ? '/' + (Array.isArray(req.query.path) ? req.query.path.join('/') : req.query.path)
      : ''

  const targetUrl = `https://api.zerion.io/v1${zerionPath}`

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Accept, Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    console.log('[Zerion Proxy] →', targetUrl)

    const response = await fetch(targetUrl, {
      method: req.method || 'GET',
      headers: {
        Authorization: req.headers.authorization || '',
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })

    const data = await response.text()
    console.log('[Zerion Proxy] ←', response.status)

    res.status(response.status)
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json')
    return res.send(data)
  } catch (error) {
    console.error('Zerion proxy error:', error)
    return res.status(500).json({ error: 'Proxy failed' })
  }
}
