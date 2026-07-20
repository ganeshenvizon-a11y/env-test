<?php

/**
 * Shared server-side config for this site's PHP entry points (sitemap.php,
 * robots.php). Mirrors the pattern of js/config.js: one place to point at
 * environment-specific values instead of hardcoding them per file.
 */

// The WordPress REST API backend. This is a separate, fixed CMS endpoint —
// not the frontend's own hosting domain — so it stays constant across
// localhost/staging/production. Mirrors js/config.js CONFIG.API_BASE; keep
// the two in sync if the WordPress install ever moves.
define('WP_API_BASE', 'https://gr8land.store/envizonnew/wordpress/wp-json/wp/v2');

/**
 * Optional override for the frontend's own public URL (no trailing slash).
 * Leave as null to auto-detect from the incoming request — that already
 * works unmodified on localhost, staging, and production. Set this only if
 * the site sits behind a proxy/CDN that doesn't forward the real host
 * correctly.
 */
define('SITE_BASE_URL_OVERRIDE', null);

/**
 * Resolves the current environment's own base URL from the incoming
 * request unless SITE_BASE_URL_OVERRIDE is set. This is the single source
 * of truth every canonical URL / sitemap entry / robots.txt directive is
 * built from, so the same code produces correct, environment-specific URLs
 * on localhost, staging, and production without any per-deploy edit.
 */
function site_base_url(): string
{
    if (SITE_BASE_URL_OVERRIDE) {
        return rtrim(SITE_BASE_URL_OVERRIDE, '/');
    }

    $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['SERVER_PORT'] ?? 80) == 443)
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');

    $host = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? 'localhost';

    return rtrim(($isHttps ? 'https' : 'http') . '://' . $host, '/');
}
