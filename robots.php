<?php

/**
 * Dynamic robots.txt so the Sitemap: directive always points at the
 * current environment's own domain instead of a hardcoded one. Deployed at
 * /robots.txt via the rewrite rule in .htaccess / web.config, the same way
 * sitemap.php is deployed at /sitemap.xml.
 */

require __DIR__ . '/config.php';

header('Content-Type: text/plain; charset=UTF-8');

echo "User-agent: *\n";
echo "Allow: /\n";
echo "\n";
echo 'Sitemap: ' . site_base_url() . "/sitemap.xml\n";
