import { readdir, writeFile, access } from "node:fs/promises";

const BASE_URL = "https://blog.irkham.my.id";
const HALAMAN_STATIS = ["index.html", "profil.html"];
const BUKAN_ARTIKEL = new Set(["template-artikel.html", "index.html", "profil.html"]);

const ada = async (f) => access(f).then(() => true, () => false);

const urls = ["/"];

for (const f of HALAMAN_STATIS) {
  if (f !== "index.html" && (await ada(f))) urls.push("/" + f);
}

const artikelHtml = (await readdir("artikel"))
  .filter((f) => f.endsWith(".md"))
  .map((f) => f.replace(/\.md$/, ".html"))
  .filter((f) => !BUKAN_ARTIKEL.has(f));

for (const f of artikelHtml) {
  if (await ada(f)) urls.push("/" + f);
}

const isi = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schema/sitemap/0.9">
${urls
  .map((u) => `  <url>\n    <loc>${BASE_URL}${encodeURI(u)}</loc>\n  </url>`)
  .join("\n")}
</urlset>
`;

await writeFile("sitemap.xml", isi);
console.log(`sitemap.xml dibuat dengan ${urls.length} URL`);
