# NSMP SDK Browser Plugin

Browser extension for working with NSMP SDK and a local development server.

## Requirements

- Node.js
- Chrome 120+, Firefox 115+, or Safari 17+ (macOS)

## Setup

```bash
npm install
npm run icons:generate
```

## Development

```bash
npm run dev              # Chrome
npm run dev:firefox
npm run dev:safari
```

## Build

```bash
npm run build            # Chrome
npm run build:firefox
npm run build:safari
npm run compile
```

## Package

```bash
npm run zip
npm run zip:firefox
npm run zip:safari
```

## Configuration

Open extension options and set the local server port (default `8123`, `0` disables the server).

Project mappings can be configured in options or from the extension popup on NSD pages.

See `specification.md` for full behavior details.
