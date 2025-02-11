# Tolog

Tolog is an open-source todo and journal app, similar to [Logseq](https://logseq.com/). Our goal is to provide a simple and intuitive interface to manage your thoughts and get things done.

## Features

- [x] Daily journal (stored locally)
- [ ] Comprehensive development tests
- [ ] Markdown support
- [ ] Integrated daily todo list
- [ ] Comprehensive search
- [ ] Git Based Daily Changes
- [ ] Improved Interface

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Icon Generation
To generate the application icons:

1. The source icon is an SVG file located at `src/assets/journal-icon.svg`
2. Generate PNG from SVG: `bash convert -background none src/assets/journal-icon.svg public/icon.png`

Note: Requires ImageMagick to be installed (`brew install imagemagick` on macOS).

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