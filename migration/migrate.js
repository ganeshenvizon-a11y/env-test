import fs from 'node:fs';
import path from 'node:path';
import { config } from './config.js';
import { parseBlogHtml } from './parser.js';
import { findPostByTitle, createDraftPost, buildDraftPayload } from './wordpress.js';
import { logSuccess, logError } from './logger.js';

function parseArgs(argv) {
  const args = { test: false, dryRun: false, file: null, files: null };
  for (const arg of argv) {
    if (arg === '--test') args.test = true;
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg.startsWith('--file=')) args.file = arg.slice('--file='.length);
    else if (arg.startsWith('--files=')) args.files = arg.slice('--files='.length).split(',').map((f) => f.trim()).filter(Boolean);
  }
  return args;
}

function listHtmlFiles() {
  return fs
    .readdirSync(config.paths.htmlBlogsDir)
    .filter((f) => f.toLowerCase().endsWith('.html'))
    .sort();
}

function readHtml(filename) {
  return fs.readFileSync(path.join(config.paths.htmlBlogsDir, filename), 'utf-8');
}

function printExtractionPreview(extracted, payload) {
  const imgSrcs = [...extracted.content.matchAll(/<img[^>]*src="([^"]+)"/g)].map((m) => m[1]);

  console.log('\n--- Extraction Preview -------------------------------------------');
  console.log(`File:              ${extracted.filename}`);
  console.log(`Title:             ${extracted.title}`);
  console.log(`Hero Subtitle:     ${extracted.heroSubtitle || '(none found)'}`);
  console.log(`Meta Description:  ${extracted.metaDescription || '(none found)'}`);
  console.log(`Generated Excerpt: ${extracted.excerpt || '(none found)'}`);
  console.log(`Updated Image Paths (${imgSrcs.length}):`);
  imgSrcs.forEach((src) => console.log(`  - ${src}`));
  console.log('\nContent Preview (first 500 chars):');
  console.log(extracted.content.slice(0, 500) + (extracted.content.length > 500 ? '…' : ''));
  console.log('\nWordPress Payload:');
  console.log(JSON.stringify(payload, null, 2));
  console.log('---------------------------------------------------------------------\n');
}

// Duplicate check + draft creation for an already-parsed file. Shared by test and bulk modes.
async function migrateExtracted(extracted) {
  const existing = await findPostByTitle(extracted.title);
  if (existing) {
    const details = `Skipped: a post titled "${extracted.title}" already exists (id=${existing.id}, status=${existing.status})`;
    console.log(`SKIP  ${extracted.filename} — ${details}`);
    logSuccess({ filename: extracted.filename, title: extracted.title, status: 'skipped', details });
    return { filename: extracted.filename, title: extracted.title, status: 'skipped', details };
  }

  const created = await createDraftPost(extracted);
  const details = `Created draft post id=${created.id}`;
  console.log(`OK    ${extracted.filename} — ${details}`);
  logSuccess({ filename: extracted.filename, title: extracted.title, status: 'created', details });
  return { filename: extracted.filename, title: extracted.title, status: 'created', details };
}

async function migrateOneFile(filename) {
  const html = readHtml(filename);
  const extracted = parseBlogHtml(html, filename);
  return migrateExtracted(extracted);
}

async function runTestMode(args) {
  const files = listHtmlFiles();
  const targetFile = args.file || files[0];
  if (!files.includes(targetFile)) {
    throw new Error(`File not found in html-blogs/: ${targetFile}`);
  }

  console.log(
    `Running single-file test migration on: ${targetFile}${
      args.dryRun ? ' (dry run — no WordPress calls)' : ''
    }\n`
  );

  const html = readHtml(targetFile);
  const extracted = parseBlogHtml(html, targetFile);
  const payload = buildDraftPayload(extracted);
  printExtractionPreview(extracted, payload);

  if (args.dryRun) {
    console.log('Dry run complete. No WordPress API calls were made.');
    return;
  }

  const result = await migrateExtracted(extracted);
  console.log(`Single-file test result: ${result.status}`);
}

async function runBulkMode(args) {
  const allFiles = listHtmlFiles();
  let files = allFiles;

  if (args.files) {
    const missing = args.files.filter((f) => !allFiles.includes(f));
    if (missing.length) {
      throw new Error(`File(s) not found in html-blogs/: ${missing.join(', ')}`);
    }
    files = args.files;
  }

  const summary = { total: files.length, created: 0, skipped: 0, failed: 0 };

  for (const filename of files) {
    try {
      const result = await migrateOneFile(filename);
      if (result.status === 'created') summary.created += 1;
      else if (result.status === 'skipped') summary.skipped += 1;
    } catch (err) {
      summary.failed += 1;
      const message = err instanceof Error ? err.message : String(err);
      console.error(`FAIL  ${filename} — ${message}`);
      logError({ filename, title: '', status: 'failed', details: message });
    }
  }

  console.log('\n=== Migration Summary =================================');
  console.log(`Total HTML files processed: ${summary.total}`);
  console.log(`Successful migrations:      ${summary.created}`);
  console.log(`Skipped (duplicates):       ${summary.skipped}`);
  console.log(`Failed:                     ${summary.failed}`);
  console.log('=========================================================\n');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.test) {
    await runTestMode(args);
  } else {
    await runBulkMode(args);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
