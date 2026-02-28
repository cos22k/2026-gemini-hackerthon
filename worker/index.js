// Cloudflare Worker: POST { keywords } → Gemini → creature spec JSON

import { SYSTEM_PROMPT, CREATURE_SCHEMA, buildPrompt } from '../src/creatures/prompt.js'

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS })
    }

    if (request.method !== 'POST') {
      return Response.json({ error: 'POST required' }, { status: 405, headers: CORS_HEADERS })
    }

    try {
      const { keywords } = await request.json()
      if (!keywords || (Array.isArray(keywords) && keywords.length === 0)) {
        return Response.json({ error: 'keywords required' }, { status: 400, headers: CORS_HEADERS })
      }

      const apiKey = env.GEMINI_API_KEY
      if (!apiKey) {
        return Response.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500, headers: CORS_HEADERS })
      }

      const geminiResponse = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ parts: [{ text: buildPrompt(keywords) }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: CREATURE_SCHEMA,
            temperature: 1.2,
          },
        }),
      })

      if (!geminiResponse.ok) {
        const errText = await geminiResponse.text()
        console.error('Gemini API error:', errText)
        return Response.json(
          { error: 'Gemini API error', status: geminiResponse.status },
          { status: 502, headers: CORS_HEADERS },
        )
      }

      const geminiData = await geminiResponse.json()
      const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text
      if (!text) {
        return Response.json(
          { error: 'Empty response from Gemini' },
          { status: 502, headers: CORS_HEADERS },
        )
      }

      const creatureSpec = JSON.parse(text)

      return Response.json(creatureSpec, {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    } catch (err) {
      console.error('Worker error:', err)
      return Response.json(
        { error: 'Internal error', message: err.message },
        { status: 500, headers: CORS_HEADERS },
      )
    }
  },
}
