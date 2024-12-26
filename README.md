# Memly

Memly is an open-source note-taking application that uses markdown files for storing notes, similar to Logseq. It provides a clean and intuitive interface for managing your personal knowledge base.

## Features

- Markdown-based note-taking
- Local file storage
- Bidirectional linking
- Daily notes

## Development

### Icon Generation
To generate the application icons:

1. The source icon is an SVG file located at `src/assets/journal-icon.svg`
2. Generate PNG from SVG: `bash convert -background none src/assets/journal-icon.svg public/icon.png`

Note: Requires ImageMagick to be installed (`brew install imagemagick` on macOS).

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   This will start both the Vite dev server and Electron app in development mode.