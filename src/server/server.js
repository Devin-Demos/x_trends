import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting Twitter and Substack proxy servers...');

const twitterProxy = spawn('node', [path.join(__dirname, 'twitterProxy.js')]);
twitterProxy.stdout.on('data', (data) => {
  console.log(`Twitter Proxy: ${data}`);
});
twitterProxy.stderr.on('data', (data) => {
  console.error(`Twitter Proxy Error: ${data}`);
});

const substackProxy = spawn('node', [path.join(__dirname, 'substackProxy.js')]);
substackProxy.stdout.on('data', (data) => {
  console.log(`Substack Proxy: ${data}`);
});
substackProxy.stderr.on('data', (data) => {
  console.error(`Substack Proxy Error: ${data}`);
});

process.on('SIGINT', () => {
  console.log('Shutting down proxy servers...');
  twitterProxy.kill();
  substackProxy.kill();
  process.exit();
});

console.log('Proxy servers started. Press Ctrl+C to stop.');
