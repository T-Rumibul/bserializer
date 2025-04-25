# Data Serializer

A TypeScript-based serialization/deserialization library built for exploration and learning.

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


# Mixed Array 100000 entries

|               | Serialize Time | Size | Compressed Size | Deserialize Time | Heap Used | Heap Total |
|---------------|----------------|----------------|----------------|----------------|----------------|----------------|
| JSON          | 94.04 ms | 14.59 MB | 1.58 MB | 112.15 ms | 94.13 MB | 124.13 MB |
| Custom        | 612.77 ms | 17.70 MB | 1.58 MB | 335.87 ms | 108.61 MB | 142.39 MB |
| BSON          | 797.34 ms | 15.76 MB | 1.64 MB | 595.68 ms | 166.28 MB | 190.45 MB |
| MsgPack       | 306.57 ms | 10.12 MB | 1.35 MB | 323.97 ms | 200.08 MB | 231.47 MB |


# Flat Numbers 100000 entries

|               | Serialize Time | Size | Compressed Size | Deserialize Time | Heap Used | Heap Total |
|---------------|----------------|----------------|----------------|----------------|----------------|----------------|
| JSON          | 2.03 ms | 0.56 MB | 0.20 MB | 2.19 ms | 203.71 MB | 233.63 MB |
| Custom        | 8.75 ms | 0.86 MB | 0.12 MB | 3.41 ms | 208.68 MB | 235.93 MB |
| BSON          | 44.46 ms | 1.04 MB | 0.28 MB | 4.49 ms | 213.66 MB | 238.24 MB |
| MsgPack       | 19.48 ms | 0.35 MB | 0.20 MB | 11.17 ms | 218.25 MB | 239.01 MB |


# Empy Nested Object Depth 50 100000 entries

|               | Serialize Time | Size | Compressed Size | Deserialize Time | Heap Used | Heap Total |
|---------------|----------------|----------------|----------------|----------------|----------------|----------------|
| JSON          | 581.69 ms | 47.02 MB | 0.21 MB | 842.08 ms | 294.89 MB | 330.49 MB |
| Custom        | 4186.99 ms | 66.28 MB | 0.32 MB | 1073.71 ms | 365.73 MB | 389.75 MB |
| BSON          | ERROR | ERROR | ERROR | ERROR | ERROR | ERROR |
| MsgPack       | 3557.09 ms | 32.52 MB | 0.14 MB | 4098.36 ms | 365.95 MB | 399.46 MB |
---

## How It Works

### Serialization Rules
- **Numbers**: Stored as `double` by default. Fixed-point decimals (e.g., `3.14`) are scaled to integers for precision.
- **Strings/Keys**: UTF-8 encoded with 1-byte length headers.
- **Objects**: Stored as `[count][key-value pairs]`.
- **Special Types**: `undefined` and `null` have dedicated type codes.

### Compression
Uses `zlib.gzipSync` for file writes and `zlib.gunzipSync` for reads.

---


## License

ISC.