# Tolog

[![Tests](https://github.com/super3/tolog/actions/workflows/test.yml/badge.svg)](https://github.com/super3/tolog/actions/workflows/test.yml)
[![Coverage](https://codecov.io/gh/super3/tolog/branch/main/graph/badge.svg?label=Coverage)](https://codecov.io/gh/super3/tolog)

Tolog is an open-source todo and journal app, similar to [Logseq](https://logseq.com/). Our goal is to provide a simple and intuitive interface to manage your thoughts and get things done.

## Features

- [x] Daily journal (stored locally)
- [x] Comprehensive development tests
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
4. Run tests:
   ```bash
   npm run test
   ```
   This will run the test suite using Vitest.
5. Generate test coverage report:
   ```bash
   npm run test:coverage
   ```
   This will generate a detailed test coverage report in HTML, JSON and text formats.