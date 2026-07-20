<?php

/**
 * Dynamic XML sitemap for the headless Envizon Studio frontend.
 *
 * Static pages are listed below. Blog posts and projects are pulled live
 * from the WordPress REST API — the same `/posts` and `/projects`
 * collection endpoints js/wp-utils.js and js/project-utils.js call from the
 * browser — so new, updated, or removed content shows up here with no
 * manual edits. WordPress's REST collection endpoints only return
 * `status=publish` items to unauthenticated requests, which already
 * excludes drafts and private posts; admin, search, and error pages are
 * simply never added to the lists below.
 *
 * Deployed at /sitemap.xml via the rewrite rule in .htaccess / web.config.
 *
 * The frontend's own domain is never hardcoded here — see
 * config.php's site_base_url(), which detects it from the request (or an
 * explicit override) so this file runs unmodified on localhost, staging,
 * and production.
 */

require __DIR__ . '/config.php';

header('Content-Type: application/xml; charset=UTF-8');

$siteUrl = site_base_url();

// Cache is namespaced per host so a codebase temporarily reachable from more
// than one domain (e.g. staging and production sharing the same files)
// never serves one environment's absolute URLs to the other.
$cacheFile = __DIR__ . '/sitemap-cache-' . preg_replace('/[^a-z0-9.-]/i', '_', parse_url($siteUrl, PHP_URL_HOST) ?: 'default') . '.xml';
const CACHE_TTL = 3600; // 1 hour — keeps crawls fast without hammering WP on every hit.

// Serve the cached copy if it's still fresh.
if (is_readable($cacheFile) && (time() - filemtime($cacheFile)) < CACHE_TTL) {
    readfile($cacheFile);
    exit;
}

/**
 * Fetches every item of a WordPress REST collection endpoint, walking
 * pages via the X-WP-TotalPages header (same approach as
 * wp-utils.js's fetchAllPosts). Requests only the fields the sitemap
 * needs. Any failure (network error, non-200, malformed body) stops
 * paging and returns whatever was already collected, so one bad page
 * never blocks the static pages from being emitted.
 */
function fetch_wp_collection(string $endpoint): array
{
    $items = [];
    $page = 1;
    $totalPages = 1;

    do {
        $url = $endpoint . '?per_page=100&page=' . $page . '&_fields=id,slug,modified_gmt,date_gmt';

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HEADER => true,
            CURLOPT_TIMEOUT => 8,
            CURLOPT_USERAGENT => 'EnvizonSitemapBot/1.0',
        ]);
        $response = curl_exec($ch);

        if ($response === false) {
            curl_close($ch);
            break;
        }

        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        curl_close($ch);

        if ($status !== 200) {
            break;
        }

        $headerText = substr($response, 0, $headerSize);
        $body = substr($response, $headerSize);

        $decoded = json_decode($body, true);
        if (!is_array($decoded)) {
            break;
        }

        $items = array_merge($items, $decoded);

        if (preg_match('/X-WP-TotalPages:\s*(\d+)/i', $headerText, $matches)) {
            $totalPages = (int) $matches[1];
        }

        $page++;
    } while ($page <= $totalPages && $page <= 50); // hard cap: 5000 items is far beyond current catalog size

    return $items;
}

function xml_escape(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_XML1, 'UTF-8');
}

function iso_date(?string $gmtDate): ?string
{
    if (!$gmtDate) {
        return null;
    }
    $timestamp = strtotime($gmtDate . ' UTC');
    return $timestamp ? gmdate('c', $timestamp) : null;
}

function url_entry(string $loc, ?string $lastmod, string $changefreq, string $priority): string
{
    $xml = "  <url>\n";
    $xml .= '    <loc>' . xml_escape($loc) . "</loc>\n";
    if ($lastmod) {
        $xml .= '    <lastmod>' . xml_escape($lastmod) . "</lastmod>\n";
    }
    $xml .= "    <changefreq>{$changefreq}</changefreq>\n";
    $xml .= "    <priority>{$priority}</priority>\n";
    $xml .= "  </url>\n";
    return $xml;
}

// Static pages actually reachable on the site. blog-single.html and
// project.html are templates, not pages in their own right — they only
// resolve to real content via ?id=/?slug=, so their canonical instances are
// added below from the REST API instead of listed here.
$staticPages = [
    ['file' => 'index.html', 'loc' => '/', 'changefreq' => 'weekly', 'priority' => '1.0'],
    ['file' => 'about.html', 'loc' => '/about.html', 'changefreq' => 'monthly', 'priority' => '0.8'],
    ['file' => 'services.html', 'loc' => '/services.html', 'changefreq' => 'monthly', 'priority' => '0.8'],
    ['file' => 'services_branding.html', 'loc' => '/services_branding.html', 'changefreq' => 'monthly', 'priority' => '0.7'],
    ['file' => 'services_digital.html', 'loc' => '/services_digital.html', 'changefreq' => 'monthly', 'priority' => '0.7'],
    ['file' => 'services_motion.html', 'loc' => '/services_motion.html', 'changefreq' => 'monthly', 'priority' => '0.7'],
    ['file' => 'services_strategy.html', 'loc' => '/services_strategy.html', 'changefreq' => 'monthly', 'priority' => '0.7'],
    ['file' => 'projects.html', 'loc' => '/projects.html', 'changefreq' => 'weekly', 'priority' => '0.8'],
    ['file' => 'clients.html', 'loc' => '/clients.html', 'changefreq' => 'monthly', 'priority' => '0.6'],
    ['file' => 'careers.html', 'loc' => '/careers.html', 'changefreq' => 'monthly', 'priority' => '0.6'],
    ['file' => 'blog.html', 'loc' => '/blog.html', 'changefreq' => 'daily', 'priority' => '0.8'],
    ['file' => 'contact.html', 'loc' => '/contact.html', 'changefreq' => 'monthly', 'priority' => '0.6'],
    ['file' => 'privacy-policy.html', 'loc' => '/privacy-policy.html', 'changefreq' => 'yearly', 'priority' => '0.3'],
];

$xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
$xml .= "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n";

foreach ($staticPages as $page) {
    $path = __DIR__ . '/' . $page['file'];
    $lastmod = is_readable($path) ? gmdate('c', filemtime($path)) : null;
    $xml .= url_entry($siteUrl . $page['loc'], $lastmod, $page['changefreq'], $page['priority']);
}

// Blog posts — canonical URL matches the href js/blog.js builds for every
// card: blog-single.html?id={id}.
foreach (fetch_wp_collection(WP_API_BASE . '/posts') as $post) {
    if (empty($post['id'])) {
        continue;
    }
    $lastmod = iso_date($post['modified_gmt'] ?? $post['date_gmt'] ?? null);
    $xml .= url_entry($siteUrl . '/blog-single.html?id=' . $post['id'], $lastmod, 'monthly', '0.6');
}

// Projects — canonical URL matches buildProjectCardData() in
// js/project-utils.js: project.html?slug={slug}. A project without a slug
// can't be linked to (see isRenderableProject in that file), so it's
// skipped here too.
foreach (fetch_wp_collection(WP_API_BASE . '/projects') as $project) {
    if (empty($project['slug'])) {
        continue;
    }
    $lastmod = iso_date($project['modified_gmt'] ?? $project['date_gmt'] ?? null);
    $xml .= url_entry($siteUrl . '/project.html?slug=' . rawurlencode($project['slug']), $lastmod, 'monthly', '0.7');
}

$xml .= "</urlset>\n";

@file_put_contents($cacheFile, $xml);

echo $xml;
