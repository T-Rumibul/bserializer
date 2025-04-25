import fs from "fs";
import path from "path";
const raw = fs.readFileSync(path.resolve(import.meta.dirname, '..', 'benchmark', 'benchmark_output.txt'), "utf8");

const datasets = raw.split("📊 Results for Dataset:").slice(1);

const rows = [
    "Tool",
  "Serialize Time",
  "Size",
  "Compressed Size",
  "Deserialize Time",
  "Heap Used",
  "Heap Total",
];

const tools = ["JSON", "Custom", "BSON", "MsgPack"];

const markdownOutput = [];

for (const block of datasets) {
  const lines = block.trim().split("\n");
  const title = lines[0].trim();

  const toolStats = {};

  // Find lines with │ <label> │ <value> │
  for (const line of lines) {
    const match = line.match(/│\s*([A-Za-z]+) ([^│]+?)\s*│\s*'?(.*?)'?\s*│/);
    if (!match) continue;

    const [, tool, metric, value] = match;

    if (!toolStats[tool]) toolStats[tool] = {};
    toolStats[tool][metric.trim()] = value.trim();
  }

  // Markdown table
  const header =
    `\n### ${title}\n\n` +
    `|               | ${rows.join(" | ")} |\n` +
    `|---------------|${rows.map(() => "----------------").join("|")}|\n`;

  const body = tools
    .map(tool => {
      const values = rows.map(metric => toolStats[tool]?.[metric] || "—");
      return `| ${tool.padEnd(13)} | ${values.join(" | ")} |`;
    })
    .join("\n");

  markdownOutput.push(header + body);
}

fs.writeFileSync("benchmark_summary.md", markdownOutput.join("\n\n"), "utf-8");
console.log("✅ Benchmark summary written to benchmark_summary.md");