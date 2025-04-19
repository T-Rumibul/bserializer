# Data Serializer

A TypeScript-based serialization/deserialization library built for exploration and learning. Slower than Node.js' native JSON methods better use something like BSON

---

## Features

- **Supports common data types**:  
  `string`, `number`, `boolean`, `null`, `undefined`, `object`, `array`, and custom handling for fixed-point decimals.
- **Compression-ready**: Built-in zlib integration for file I/O.
- **Type-safe**: Written in TypeScript with explicit type codes.

---

## Installation

```bash
npm install bserializer
```

*Requires Node.js v18+.*

---

## Usage

### Serialize & Deserialize Data
```typescript
import { serializeData, deserializeData } from "bserializer";

const data = { foo: [42, "bar", true], baz: null };
const serialized = serializeData(data);
const deserialized = deserializeData(serialized); // { foo: [42, "bar", true], baz: null }
```

### File I/O with Compression
```typescript
import { writeToFile, readFromFile } from "bserializer";

// Write
writeToFile("data.bin", { planets: ["🌍", "🚀", 3.1415] });

// Read
const loadedData = readFromFile("data.bin"); // { planets: ["🌍", "🚀", 3.1415] }
```

---

## Benchmark


| Metric                  | JSON         | Custom       |
|-------------------------|--------------|--------------|
| **Serialize Time (ms)** | 98.7         | 1117.9       |
| **Deserialize Time (ms)** | 107.4      | 2264.9       |
| **Payload Size**        | 14.59 MB     | 13.41 MB     |
| **Compressed Size**     | 1.58 MB      | 1.54 MB      |
| **Heap Used**           | 72.10 MB     | 76.08 MB     |

---

## How It Works

### Serialization Rules
- **Numbers**: Stored as `double` by default. Fixed-point decimals (e.g., `3.14`) are scaled to integers for precision.
- **Strings/Keys**: UTF-8 encoded with 1-byte length headers.
- **Objects**: Keys limited to 255 bytes. Stored as `[count][key-value pairs]`.
- **Special Types**: `undefined` and `null` have dedicated type codes.

### Compression
Uses `zlib.gzipSync` for file writes and `zlib.gunzipSync` for reads.

---

## When to Use This

- I don't know, better use something like BSON.

---

## License

ISC.