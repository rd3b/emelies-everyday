import fs from "fs";
import path from "path";
import fetch from "node-fetch";

const OUT_DIR = path.resolve("data");
const NOTES_URL = "https://emelieseveryday.substack.com/api/v1/notes?limit=100";

function ensureDir(dir){ if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true}); }

function normalizeText(html){
  return String(html || "")
    .replace(/
+/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/s+/g, " ")
    .trim();
}

function toSlug(s){
  return s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
}

async function main(){
  ensureDir(OUT_DIR);
  const res = await fetch(NOTES_URL, { headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" }});
  const json = await res.json();
  fs.writeFileSync(path.join(OUT_DIR,"notes_raw.json"), JSON.stringify(json, null, 2));

  const entries = (json.items || []).filter(it => it && it.context && it.context.users && it.context.users[0] && it.context.users[0].handle === "emelieseveryday");

  const notes = [];
  for (const item of entries){
    if (["note","text","image","link","doc","paragraph"].includes(item.type)) {
      const id = item.entity_key || (item.id ? `i-${item.id}` : `ts-${Date.now()}`);
      const publishedAt = (item.context && item.context.timestamp) || item.created_at || item.updated_at || null;
      const title = normalizeText(item.title || item.text || item.caption || "").slice(0, 80) || "Note";
      const excerpt = normalizeText((item.text || item.caption || item.title || "").slice(0, 300));
      const body = item.html || item.body_html || item.text || item.caption || "";
      const url = item.url || null;
      notes.push({ id, slug: `${toSlug(title)}-${id}`, title, publishedAt, excerpt, body, url, rawType: item.type });
    }
  }

  notes.sort((a,b)=> new Date(b.publishedAt||0) - new Date(a.publishedAt||0));
  fs.writeFileSync(path.join(OUT_DIR,"notes.json"), JSON.stringify({ count: notes.length, items: notes }, null, 2));
  console.log(`Saved ${notes.length} notes to data/notes.json`);
}

main().catch(err=>{ console.error(err); process.exit(1); });
