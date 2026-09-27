---
name: brand
description: Apply the default AI Ecosystem visual identity to generated content.
inputs:
  content:
    type: string
    required: true
outputs:
  content:
    type: string
    required: true
tools: []
---

# Brand

Apply the default AI Ecosystem visual identity consistently to generated content. Prefer clear,
restrained layouts, strong legibility, semantic colour use, and accessible focus and status cues.

The exact semantic palette is supporting bundle data in `references/theme.json`. It is not
currently retrievable through a public Knowledge tool, so do not claim to have loaded it unless it
was supplied with this Skill. Do not invent logos, imagery, fonts, or additional brand assets.
