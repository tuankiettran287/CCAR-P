import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { build } from "esbuild";

const project = new URL(".", import.meta.url);
const source = await readFile(new URL("CCAR-P-160-cau-hoi.html", project), "utf8");
const articles = [...source.matchAll(/<article id="q(\d+)"[^>]*>[\s\S]*?<\/article>/g)];
if (articles.length !== 160 || articles.some((article, index) => Number(article[1]) !== index + 1)) {
  throw new Error("Expected all 160 questions in their original order.");
}

const bundle = await build({
  absWorkingDir: import.meta.dirname,
  entryPoints: ["src/App.jsx"],
  outdir: "build",
  bundle: true,
  write: false,
  minify: true,
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
});
const script = bundle.outputFiles.find((file) => file.path.endsWith(".js")).text;
const styles = bundle.outputFiles.find((file) => file.path.endsWith(".css")).text;
const html = [
  "<!doctype html>",
  '<html lang="vi">',
  "<head>",
  '<meta charset="utf-8">',
  '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
  "<title>CCAR-P · Luyện thi</title>",
  "<style>" + styles + "</style>",
  "</head>",
  "<body>",
  '<div id="root"></div>',
  '<noscript>Bật JavaScript để sử dụng app luyện thi CCAR-P.</noscript>',
  '<template id="question-bank">',
  ...articles.map(([article]) => article),
  "</template>",
  "<script>" + script.replace(/<\/script/gi, "<\\/script") + "</script>",
  "</body>",
  "</html>",
].join("\n");

const forVercel = process.argv.includes("--vercel");
if (forVercel) await mkdir(new URL("dist/", project), { recursive: true });
const outputPath = forVercel ? "dist/index.html" : "CCAR-P-Luyen-Thi.html";
const output = new URL(outputPath, project);
const temporary = new URL(outputPath + ".tmp", project);
await writeFile(temporary, html, "utf8");
await rename(temporary, output);
console.log("Built " + outputPath + " with 160 questions.");
