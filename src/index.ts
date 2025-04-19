import fs from 'fs';
import zlib from 'zlib';
import { serializeData } from './serialize.ts';
import { deserializeData } from './deserialize.ts';

export function writeToFile(filePath: string, data: unknown) {
  const buffer = serializeData(data);
  const compressed = zlib.gzipSync(buffer);
  fs.writeFileSync(filePath, compressed);
  console.log(`✅ Written to ${filePath}`);
}

export function readFromFile(filePath: string): unknown {
  const compressed = fs.readFileSync(filePath);
  const buffer = zlib.gunzipSync(compressed);
  return deserializeData(buffer);
}


export {
    serializeData,
    deserializeData
}