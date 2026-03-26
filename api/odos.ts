import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Path comes via query parameter from vercel.json rewrite
  const subpath = req.query.path
    ? '/' + (Array.isArray(req.query.path) ? req.query.path.join('/') : req.query.path)
    : ''

  // Reconstruct query string from raw URL (preserves brackets, no double-encoding)
  const rawUrl = req.url || ''
  const qIndex = rawUrl.indexOf('?')
  let queryString = ''
  if (qIndex !== -1) {
    queryString = rawUrl
      .slice(qIndex + 1)
      .split('&')
      .filter((p) => !p.startsWith('path='))
      .join('&')
  }

  const targetUrl = `https://api.odos.xyz${subpath}${queryString ? '?' + queryString : ''}`

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }

    const fetchOptions: RequestInit = {
      method: req.method || 'GET',
      headers,
    }

    if (req.method === 'POST' && req.body) {
      fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
    }

    const response = await fetch(targetUrl, fetchOptions)
    const data = await response.text()

    res.status(response.status)
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json')
    return res.send(data)
  } catch (error) {
    console.error('Odos proxy error:', error)
    return res.status(500).json({ error: 'Proxy failed' })
  }
}
