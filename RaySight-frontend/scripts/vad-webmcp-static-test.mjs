import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../src/services/webMcpTools.ts', import.meta.url), 'utf8');
assert.equal((source.match(/name: 'vad_/g) || []).length, 10, 'ten VAD domain tools are required');
assert.equal((source.match(/name: 'securedme_/g) || []).length, 2, 'two shared SecuredMe tools are required');
assert.match(source, /typeof document/);
assert.match(source, /HUMAN_APPROVAL_REQUIRED_OR_EXPIRED/);
assert.match(source, /idempotencyKey/);
assert.match(source, /additionalProperties: false/);
console.log('VAD WebMCP static contract passed.');
