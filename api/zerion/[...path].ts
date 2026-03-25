import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Extract everything after /api/zerion
  const { url } = req
  const path = url?.replace(/^\/api\/zerion/, '') || ''
  const targetUrl = `https://api.zerion.io/v1${path}`

  // Handle CORS preflight
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Accept, Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    const response = await fetch(targetUrl, {
      method: req.method || 'GET',
      headers: {
        Authorization: req.headers.authorization || '',
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })

    const data = await response.text()

    res.status(response.status)
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json')
    return res.send(data)
  } catch (error) {
    console.error('Zerion proxy error:', error)
    return res.status(500).json({ error: 'Proxy failed' })
  }
}
