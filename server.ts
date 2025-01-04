import http from 'http';
import dotenv from 'dotenv';
import scrapeData from './scrapeData';

const hostname = '127.0.0.1';
const port = 3000;

dotenv.config();

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, world!\n');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  scrapeData();
});