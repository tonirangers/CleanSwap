import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Extract the path after /api/zerion
  const { url } = req
  const path = url?.replace(/^\/api\/zerion/, '') || ''
  const targetUrl = `https://api.zerion.io/v1${path}`

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

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Accept, Content-Type')

    if (req.method === 'OPTIONS') {
      return res.status(200).end()
    }

    res.status(response.status)
    res.setHeader('Content-Type', 'application/json')
    return res.send(data)
  } catch (error) {
    console.error('Zerion proxy error:', error)
    return res.status(500).json({ error: 'Proxy failed' })
  }
}
