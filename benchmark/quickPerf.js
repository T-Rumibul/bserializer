import { deserializeData, serializeData } from "../dist/index.js";
import { performance } from "perf_hooks";

const testData = generateLargeDataset();

function generateLargeDataset() {
  const entries = 1_000
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
  return mixed
}
// Warm up
for (let i = 0; i < 2000; i++) serializeData(testData);

// Time actual serialization
const sStart = performance.now();
serializeData(testData);
const sEnd = performance.now();

console.log(`Serialize Time: ${(sEnd - sStart).toFixed(2)}ms`);


const serData = serializeData(testData)
// Warm up
for (let i = 0; i < 2000; i++) deserializeData(serData);

// Time actual deserialization
const start = performance.now();
deserializeData(serData);
const end = performance.now();

console.log(`Deserialize Time: ${(end - start).toFixed(2)}ms`);