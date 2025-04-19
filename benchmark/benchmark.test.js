// benchmark.test.ts
import fs from "fs";
import path from "path";
import { performance } from "perf_hooks";
import { serializeData, deserializeData, writeToFile, readFromFile } from "../dist/index.js"; // adjust path as needed
import zlib from "zlib";

const testData = generateLargeDataset();

function generateLargeDataset() {
  const arr = [];
  for (let i = 0; i < 100_000; i++) {
    arr.push({
      id: i,
      name: `user_${i}`,
      score: Math.random() * 100,
      isActive: i % 2 === 0,
      preferences: {
        theme: i % 2 === 0 ? 'dark' : 'light',
        language: 'en',
      },
      tags: ['tag1', 'tag2', 'tag3'],
    });
  }
  return arr;
}
const results  = {};

function formatBytes(bytes ) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function logMemory(label ) {
  const { heapUsed, heapTotal } = process.memoryUsage();
  results[`${label}_heapUsed`] = heapUsed;
  results[`${label}_heapTotal`] = heapTotal;
}

describe("Benchmark: JSON vs Custom Binary", () => {
  test("Serialize, compress, write, read, decompress, deserialize", () => {
    // JSON: serialize
    const jsonStart = performance.now();
    const jsonStr = JSON.stringify(testData);
    const jsonBuf = Buffer.from(jsonStr, "utf8");
    const jsonDuration = performance.now() - jsonStart;
    results.json_serialize_ms = jsonDuration.toFixed(3);
    results.json_bytes = jsonBuf.length;

    const jsonCompressed = zlib.gzipSync(jsonBuf);
    fs.writeFileSync("benchmark/json_output.gz", jsonCompressed);
    results.json_compressed_bytes = jsonCompressed.length;

    logMemory("json");

    // Custom: serialize
    const customStart = performance.now();
    const customBuf = serializeData(testData);
    const customDuration = performance.now() - customStart;
    results.custom_serialize_ms = customDuration.toFixed(3);
    results.custom_bytes = customBuf.length;

    const customCompressed = zlib.gzipSync(customBuf);
    fs.writeFileSync("benchmark/custom_output.gz", customCompressed);
    results.custom_compressed_bytes = customCompressed.length;

    logMemory("custom");

    // Write raw file sizes from disk
    const jsonFileSize = fs.statSync("benchmark/json_output.gz").size;
    const customFileSize = fs.statSync("benchmark/custom_output.gz").size;
    results.json_disk_bytes = jsonFileSize;
    results.custom_disk_bytes = customFileSize;

    // JSON: deserialize
    const jsonDeStart = performance.now();
    const parsed = JSON.parse(jsonBuf.toString("utf8"));
    const jsonDeDuration = performance.now() - jsonDeStart;
    results.json_deserialize_ms = jsonDeDuration.toFixed(3);

    // Custom: deserialize
    const customDeStart = performance.now();
    const offsetRef = { offset: 0 };
    const deserialized = deserializeData(customBuf, offsetRef);
    const customDeDuration = performance.now() - customDeStart;
    results.custom_deserialize_ms = customDeDuration.toFixed(3);

  

    // log to console for quick view
    console.table({
      'JSON serialize (ms)': results.json_serialize_ms,
      'Custom serialize (ms)': results.custom_serialize_ms,
      'JSON deserialize (ms)': results.json_deserialize_ms,
      'Custom deserialize (ms)': results.custom_deserialize_ms,
      'JSON size': formatBytes(results.json_bytes),
      'Custom size': formatBytes(results.custom_bytes),
      'JSON compressed': formatBytes(results.json_compressed_bytes),
      'Custom compressed': formatBytes(results.custom_compressed_bytes),
      'JSON heapUsed': formatBytes(results.json_heapUsed),
      'Custom heapUsed': formatBytes(results.custom_heapUsed),

    });
  });
});