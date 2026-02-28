// Creature generation prompt for Gemini structured output

export const CREATURE_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string', description: 'Creative creature name, often a portmanteau of the keywords' },
    body: {
      type: 'object',
      properties: {
        shape: { type: 'string', enum: ['ellipse', 'roundRect', 'blob'] },
        width: { type: 'number', description: '60-160' },
        height: { type: 'number', description: '60-160' },
        color: { type: 'string', description: 'Hex color for fill' },
        stroke: { type: 'string', description: 'Hex color for outline, darker shade of color' },
      },
      required: ['shape', 'width', 'height', 'color', 'stroke'],
    },
    eyes: {
      type: 'object',
      properties: {
        variant: { type: 'string', enum: ['googly', 'dot', 'cute'] },
        size: { type: 'number', description: '8-24' },
        spacing: { type: 'number', description: '20-50, distance between eyes' },
        offsetY: { type: 'number', description: 'Vertical offset from center, usually -10 to -25' },
      },
      required: ['variant', 'size', 'spacing', 'offsetY'],
    },
    mouth: {
      type: 'object',
      properties: {
        variant: { type: 'string', enum: ['smile', 'open', 'zigzag', 'flat'] },
        width: { type: 'number', description: '10-30' },
        offsetY: { type: 'number', description: 'Vertical offset, usually 10-25' },
      },
      required: ['variant', 'width', 'offsetY'],
    },
    additions: {
      type: 'array',
      description: 'Extra SVG elements for unique features (legs, horns, spots, tails, etc.)',
      items: {
        type: 'object',
        properties: {
          el: { type: 'string', enum: ['ellipse', 'circle', 'rect', 'path', 'line', 'polygon', 'polyline'] },
          props: { type: 'object', description: 'SVG attributes like cx, cy, r, d, points, x, y, width, height, rx, ry' },
          fill: { type: 'string' },
          stroke: { type: 'string' },
          strokeWidth: { type: 'number' },
        },
        required: ['el', 'props'],
      },
    },
    movement: {
      type: 'string',
      enum: ['waddle', 'bounce', 'drift', 'hop', 'slither', 'float'],
      description: 'Movement style for animation',
    },
  },
  required: ['name', 'body', 'eyes', 'mouth', 'additions', 'movement'],
}

const SYSTEM_PROMPT = `You are a creature designer for a 2D sandbox game. You create unique creatures as SVG specifications.

COORDINATE SYSTEM:
- Origin (0,0) is the center of the creature
- viewBox is "-100 -100 200 200"
- Negative Y = up, Positive Y = down
- Keep all elements within roughly -90 to 90 on both axes

BODY PRESETS (pick one):
- "ellipse": standard oval body
- "roundRect": blocky with rounded corners
- "blob": organic, amorphous shape

EYE PRESETS:
- "googly": white sclera + dark pupil + highlight (playful)
- "dot": simple filled circles (minimal)
- "cute": large dark circles with bright highlights (kawaii)

MOUTH PRESETS:
- "smile": curved upward arc
- "open": small oval (surprised)
- "zigzag": jagged line (mischievous)
- "flat": straight horizontal line (neutral)

ADDITIONS ARRAY:
Use this to give the creature unique features that distinguish it. Add 2-6 elements such as:
- Feet/legs (ellipses below the body, cy ~50-60)
- Horns/antennae (paths extending above, cy < -50)
- Spots/patterns (circles/ellipses on the body surface)
- Tail (path extending from body side)
- Wings (paths or polygons at sides)
- Leaf/nature features, crystals, flames, etc. inspired by the keywords

Allowed elements: ellipse, circle, rect, path, line, polygon, polyline.
Props are SVG attributes: cx, cy, r, rx, ry, x, y, width, height, d, points.

DESIGN RULES:
1. Name should be a creative portmanteau or mashup of the keywords
2. Colors should be inspired by the keywords (e.g. "fire" → warm reds/oranges)
3. Body size typically 80-140 width, 70-120 height
4. Always add at least 2 additions for visual interest
5. Choose a movement style that fits the creature's personality
6. Make each creature feel unique and characterful`

export function buildPrompt(keywords) {
  const keywordStr = Array.isArray(keywords) ? keywords.join(' + ') : keywords
  return `Design a creature inspired by these keywords: ${keywordStr}

Be creative with the name, colors, shape, and additions. The creature should visually evoke the essence of the keywords.`
}

export { SYSTEM_PROMPT }
