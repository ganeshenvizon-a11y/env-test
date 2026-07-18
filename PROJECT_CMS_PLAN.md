# Project Portfolio CMS - Architecture & Development Guide

## Overview

This project extends an existing **Headless WordPress Blog CMS** to support a **Project Portfolio CMS** using the **same WordPress installation**.

The frontend remains a completely static website built with:

- HTML
- CSS
- Vanilla JavaScript
- PHP (Forms Only)

WordPress is used **only as a Headless CMS**.

---

# Existing Architecture

```
Static Frontend
        │
        ▼
JavaScript Fetch
        │
        ▼
WordPress REST API
        │
        ▼
WordPress CMS
```

---

# Existing Blog System

The blog system is already complete.

Pages:

```
blog.html
blog-single.html
```

Implemented Features

- Dynamic Blog Listing
- Dynamic Blog Single
- Search
- Pagination
- Featured Article
- Related Articles
- Previous / Next Navigation
- Sidebar
- Reading Time
- Categories
- Tags
- Hero
- SEO Metadata

The Projects CMS **must follow the exact same architecture**.

---

# Projects CMS

Frontend Pages

```
projects.html
project.html
```

Backend

```
WordPress
└── Projects (Custom Post Type)
```

---

# Current Plugin Structure

```
wp-content/
└── plugins/
    └── envizon-headless/
        ├── envizon-headless.php
        ├── post-types/
        │   └── projects.php
        └── api/
            └── projects-api.php
```

Do not move functionality into the WordPress theme.

All custom functionality belongs inside the custom plugin.

---

# JavaScript Structure

Current

```
js/

blog.js
blog-single.js
blog-sidebar.js
blog-related-articles.js
blog-reading-progress.js
blog-share.js
blog-article-nav.js

config.js
wp-utils.js
```

Projects should follow the same pattern.

```
js/

projects.js
project.js
project-sidebar.js
project-nav.js
```

Reuse:

- config.js
- wp-utils.js

Do not duplicate existing utilities.

---

# REST API

Projects Endpoint

```
/wp-json/wp/v2/projects
```

Current Response

```
title.rendered
content.rendered
excerpt.rendered
featured_image

acf.client_name
acf.hero_subtitle
acf.short_description
acf.featured_project
acf.project_website
```

The API may be extended in the future.

Avoid breaking existing endpoints.

---

# Project Content

Projects use:

- Gutenberg Editor
- ACF Free

NOT ACF Pro.

Do not use:

- Flexible Content
- Repeater Fields
- Clone Fields

The main project content is authored using Gutenberg blocks.

---

# Project Editor

Hero Data

- Title
- Featured Image
- Excerpt

ACF Fields

- Client Name
- Hero Subtitle
- Short Description
- Featured Project
- Project Website

Main Content

Gutenberg Blocks

---

# Development Rules

## Do NOT

- Redesign pages
- Modify existing CSS unnecessarily
- Rewrite working blog functionality
- Duplicate utility functions
- Add unnecessary dependencies
- Break the existing architecture
- Create a second CMS
- Move frontend into WordPress themes

---

## Always

- Follow the existing coding style.
- Keep JavaScript modular.
- Keep functions small.
- Reuse existing utilities.
- Preserve responsive behavior.
- Handle API failures gracefully.
- Write production-ready code.
- Explain implementation before coding.

---

# Development Workflow

Every task should follow this order.

1. Explain approach.
2. Identify affected files.
3. Implement only one feature.
4. Wait for verification.
5. Continue to next phase.

Never implement multiple unrelated features in one step.

---

# Development Phases

## Phase 1

Projects Listing

- Fetch Projects
- Render Cards

---

## Phase 2

Project Single

- Fetch by Slug
- Render Hero
- Render Gutenberg Content

---

## Phase 3

Categories

- Project Categories
- Filters

---

## Phase 4

Search

Search Projects

---

## Phase 5

Pagination

Projects Listing Pagination

---

## Phase 6

Related Projects

- Same Category
- Similar Services

---

## Phase 7

Previous / Next Navigation

Project Navigation

---

## Phase 8

Performance

- Lazy Loading
- Image Optimization
- API Optimization

---

# Code Quality Requirements

Every implementation should be:

- Modular
- Readable
- Reusable
- Maintainable
- Scalable

Avoid hardcoding project-specific logic.

Everything should support unlimited future projects.

---

# AI Instructions

Before implementing any feature:

1. Read this document.
2. Understand the existing architecture.
3. Preserve the coding style.
4. Implement only the requested phase.
5. Do not anticipate future phases.
6. Do not modify unrelated files.
7. Ask for clarification if architecture changes are required.

This document is the source of truth for the Project Portfolio CMS.