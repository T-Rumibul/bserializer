import fs from "fs";
import { performance } from "perf_hooks";
import zlib from "zlib";
import { BSON } from "bson";
import msgpack from "@msgpack/msgpack";
import { serializeData, deserializeData } from "../dist/index.js"; // adjust path as needed

const OUTPUT_DIR = "benchmark";
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

function formatBytes(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function generateLargeDataset() {
  const entries = 1_000_00;
  const obj_depth = 50;
  const mixed = [];
  for (let i = 0; i < entries; i++) {
    mixed.push({
      id: i,
      name: `user_${i}`,
      score: Math.random() * 100,
      isActive: i % 2 === 0,
      preferences: {
        theme: i % 2 === 0 ? "dark" : "light",
        language: "en",
      },
      tags: ["tag1", "tag2", "tag3"],
    });
  }

  const flatNumbers = Array.from({ length: entries }, (_, i) => i);

  let nested= {};
  let nested_arr = []
  let current = nested;
  for (let i = 0; i < obj_depth; i++) {
    current[`key${i}`] = {};
    current = current[`key${i}`];
  }
  for(let i = 0; i < entries; i++) {
    nested_arr.push(nested)
  }
  const labels = [`Mixed Array ${entries} entries`, `Flat Numbers ${entries} entries`, `Empy Nested Object Depth ${obj_depth} ${entries} entries`]
  return {
    [labels[0]]: mixed,
    [labels[1]]: flatNumbers,
    [labels[2]]: nested_arr,
  };
}

function logMemory(label, results) {
  try {
    const { heapUsed, heapTotal } = process.memoryUsage();
    results[`${label} Heap Used`] = formatBytes(heapUsed);
    results[`${label} Heap Total`] = formatBytes(heapTotal);
  } catch {
    results[`${label} Heap Used`] = "ERROR";
    results[`${label} Heap Total`] = "ERROR";
  }
}

describe("Benchmark by dataset: JSON vs Custom vs BSON vs MsgPack", () => {
  const testData = generateLargeDataset();

  for (let [label, dataset] of Object.entries(testData)) {
    test(`${label} — Benchmark`, async () => {
      const results= {};

      // JSON
      try {
        const start = performance.now();
        const jsonStr = JSON.stringify(dataset);
        const jsonBuf = Buffer.from(jsonStr, "utf8");
        results["JSON Serialize Time"] = `${(performance.now() - start).toFixed(2)} ms`;
        results["JSON Size"] = formatBytes(jsonBuf.length);

        const compressed = zlib.gzipSync(jsonBuf);
        fs.writeFileSync(`${OUTPUT_DIR}/${label.replace(/\s+/g, "_")}_json.gz`, compressed);
        results["JSON Compressed Size"] = formatBytes(compressed.length);

        const deStart = performance.now();
        JSON.parse(jsonBuf.toString("utf8"));
        results["JSON Deserialize Time"] = `${(performance.now() - deStart).toFixed(2)} ms`;

        logMemory("JSON", results);
      } catch {
        results["JSON Serialize Time"] = "ERROR";
        results["JSON Deserialize Time"] = "ERROR";
        results["JSON Size"] = "ERROR";
        results["JSON Compressed Size"] = "ERROR";
        results["JSON Heap Used"] = "ERROR";
        results["JSON Heap Total"] = "ERROR";
      }

      // Custom Binary
      try {
        const start = performance.now();
        const buf = serializeData(dataset);
        results["Custom Serialize Time"] = `${(performance.now() - start).toFixed(2)} ms`;
        results["Custom Size"] = formatBytes(buf.length);

        const compressed = zlib.gzipSync(buf);
        fs.writeFileSync(`${OUTPUT_DIR}/${label.replace(/\s+/g, "_")}_custom.gz`, compressed);
        results["Custom Compressed Size"] = formatBytes(compressed.length);

        const deStart = performance.now();
        deserializeData(buf, { offset: 0 });
        results["Custom Deserialize Time"] = `${(performance.now() - deStart).toFixed(2)} ms`;

        logMemory("Custom", results);
      } catch(e) {
        console.log(e)
        results["Custom Serialize Time"] = "ERROR";
        results["Custom Deserialize Time"] = "ERROR";
        results["Custom Size"] = "ERROR";
        results["Custom Compressed Size"] = "ERROR";
        results["Custom Heap Used"] = "ERROR";
        results["Custom Heap Total"] = "ERROR";
      }

      // BSON
      try {
        // BSON can't take array as a root object
        if(Array.isArray(dataset)) dataset = {dataset}
        const start = performance.now();
        const buf = BSON.serialize(dataset);
        results["BSON Serialize Time"] = `${(performance.now() - start).toFixed(2)} ms`;
        results["BSON Size"] = formatBytes(buf.length);

        const compressed = zlib.gzipSync(buf);
        fs.writeFileSync(`${OUTPUT_DIR}/${label.replace(/\s+/g, "_")}_bson.gz`, compressed);
        results["BSON Compressed Size"] = formatBytes(compressed.length);

        const deStart = performance.now();
        BSON.deserialize(buf);
        results["BSON Deserialize Time"] = `${(performance.now() - deStart).toFixed(2)} ms`;

        logMemory("BSON", results);
      } catch(e) {
        results["BSON Serialize Time"] = "ERROR";
        results["BSON Deserialize Time"] = "ERROR";
        results["BSON Size"] = "ERROR";
        results["BSON Compressed Size"] = "ERROR";
        results["BSON Heap Used"] = "ERROR";
        results["BSON Heap Total"] = "ERROR";
      }

      // MessagePack
      try {
        const start = performance.now();
        const buf = Buffer.from(msgpack.encode(dataset));
        results["MsgPack Serialize Time"] = `${(performance.now() - start).toFixed(2)} ms`;
        results["MsgPack Size"] = formatBytes(buf.length);

        const compressed = zlib.gzipSync(buf);
        fs.writeFileSync(`${OUTPUT_DIR}/${label.replace(/\s+/g, "_")}_msgpack.gz`, compressed);
        results["MsgPack Compressed Size"] = formatBytes(compressed.length);

        const deStart = performance.now();
        msgpack.decode(buf);
        results["MsgPack Deserialize Time"] = `${(performance.now() - deStart).toFixed(2)} ms`;

        logMemory("MsgPack", results);
      } catch(e) {
        
        results["MsgPack Serialize Time"] = "ERROR";
        results["MsgPack Deserialize Time"] = "ERROR";
        results["MsgPack Size"] = "ERROR";
        results["MsgPack Compressed Size"] = "ERROR";
        results["MsgPack Heap Used"] = "ERROR";
        results["MsgPack Heap Total"] = "ERROR";
      }

      console.log(`\n📊 Results for Dataset: ${label}`);
      console.table(results);
    }, 30000);
  }
});