# es-sse

A Server-Sent Events (SSE) parsing library built with modern design patterns

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![npm version](https://badge.fury.io/js/es-sse.svg)](https://badge.fury.io/js/es-sse)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

## Features

- 🔄 Modern SSE parsing implementation
- 🛡️ TypeScript support
- 🧪 Comprehensive test coverage
- 🚀 Zero dependencies
- 📦 Lightweight and fast

## Installation

```bash
# npm
npm install es-sse

# pnpm
pnpm add es-sse

# yarn
yarn add es-sse
```

## Usage

```typescript
import { parseSSE } from 'es-sse';

// Parse a single event
const eventChunk = 'event: test-event\ndata: test-data\n\n';
const result = parseSSE(eventChunk);

// Result will be:
// {
//   data: [{
//     event: 'test-event',
//     data: 'test-data'
//   }],
//   restString: ''
// }

// Handle incomplete events with restString
let buffer = '';
const chunks = [
  'event: first\ndata: first-data\n\nevent: second\ndata: second-data\n\nevent: third\ndata: third',
  '-data\n\n'
];

// Process chunks
for (const chunk of chunks) {
  buffer += chunk;
  const result = parseSSE(buffer);
  
  // Process complete events
  for (const event of result.data) {
    console.log('Received event:', event);
  }
  
  // Keep the rest for next iteration
  buffer = result.restString;
}

// Final buffer state
console.log('Remaining buffer:', buffer); // Should be empty
```
