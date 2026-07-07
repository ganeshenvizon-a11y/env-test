document.addEventListener('DOMContentLoaded', () => {
    const placeholder = document.querySelector('footer.footer');
    if (!placeholder) return;
    if (placeholder.dataset.loaded === 'true') return;

    fetch('components/footer.html')
        .then(res => res.text())
        .then(html => {
            // Check again in case of parallel execution
            if (placeholder.dataset.loaded === 'true') return;
            
            placeholder.innerHTML = html;
            placeholder.dataset.loaded = 'true';
        })
        .catch(err => console.error("Error loading footer component:", err));
});
