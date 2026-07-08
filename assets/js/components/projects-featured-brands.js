/**
 * Envizon Studio - Projects page: Featured brands grid
 * Section-specific: owns only this grid's project data and scroll-reveal
 * timing. Card markup/styles/hover behavior all come from the shared
 * ProjectCard component (assets/js/components/project-card.js).
 */

import { renderProjectCard, initProjectCardGrid } from './project-card.js';

const brands = [
    {
        title: 'Popl',
        logo: 'assets/images/work/logos/popl.png',
        bgColor: 'linear-gradient(180deg, #2b1214 0%, #6b1f2b 100%)',
        accentColor: '#F4A825',
        tags: ['Strategy', 'Visual Identity', 'Web Design'],
        url: 'project.html'
    },
    {
        title: 'Zuddle',
        logo: 'assets/images/work/logos/zuddle-mark.png',
        bgColor: '#0d3025',
        accentColor: '#2DD4BF',
        tags: ['Brand Identity', 'Product Design', 'Web App'],
        url: 'project.html'
    },
    {
        title: 'Poly AI',
        logo: 'assets/images/work/logos/polyai-wordmark.png',
        bgColor: '#141414',
        accentColor: '#D6F84C',
        tags: ['AI Platform', 'Design System', 'Product Design'],
        url: 'project.html'
    },
    {
        title: 'Marketo',
        logo: 'assets/images/work/logos/marketo.png',
        bgColor: '#583fb2',
        accentColor: '#C4B5FD',
        tags: ['Marketing Automation', 'Rebranding', 'Web Design'],
        url: 'project.html'
    },
    {
        title: 'Zuddle',
        logo: 'assets/images/work/logos/zuddle-arrow.png',
        bgColor: '#f4f2ee',
        accentColor: '#1a1a1a',
        tags: ['Interaction Design', 'Iconography', 'Brand System'],
        url: 'project.html'
    },
    {
        title: 'Poly AI',
        logo: 'assets/images/work/logos/polyai-leaf.png',
        bgColor: '#deeceb',
        accentColor: '#0B4F4A',
        tags: ['Data Visualization', 'Platform UX', 'Product Design'],
        url: 'project.html'
    }
];

export function initProjectsFeaturedBrands(root = '#projectsFeaturedBrandsGrid'){
    const grid = document.querySelector(root);
    if (!grid) return;

    const fragment = document.createDocumentFragment();
    brands.forEach(brand => fragment.appendChild(renderProjectCard(brand)));
    grid.appendChild(fragment);

    initProjectCardGrid(Array.from(grid.querySelectorAll('.project-card')));
}
