import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Copy migration/.env.example to migration/.env and fill it in.`
    );
  }
  return value;
}

export const config = {
  wordpress: {
    baseUrl: process.env.WP_BASE_URL || 'https://gr8land.store/envizonnew/wordpress/wp-json/wp/v2',
    username: () => requireEnv('WP_USERNAME'),
    appPassword: () => requireEnv('WP_APP_PASSWORD'),
  },
  paths: {
    root: __dirname,
    projectRoot: path.join(__dirname, '..'),
    htmlBlogsDir: path.join(__dirname, 'html-blogs'),
    blogImagesDir: path.join(__dirname, '..', 'assets', 'images', 'blog-img'),
    logsDir: path.join(__dirname, 'logs'),
    successLog: path.join(__dirname, 'logs', 'success.log'),
    errorLog: path.join(__dirname, 'logs', 'error.log'),
  },
  images: {
    // Old HTML references like ../images/blog/foo.jpg get rewritten to this web path.
    newWebPath: 'assets/images/blog-img',
  },
};
