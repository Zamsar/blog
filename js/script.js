document.addEventListener('DOMContentLoaded', () => {
    console.log("Zamir's Dev Log: JavaScript loaded!");
    loadPosts();
});

async function loadPosts() {
    try {
        const response = await fetch('/data/posts.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const allPosts = await response.json();
        // Sort by date (most recent first) and take the top 5
        const recentPosts = allPosts.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

        const timelineContent = document.getElementById('timeline-content');
        timelineContent.innerHTML = ''; // Clear any existing content

        recentPosts.forEach((post, index) => {
            const isEven = index % 2 === 0; // For desktop alternating layout
            const timelineItem = document.createElement('div');
            timelineItem.className = `timeline-item mb-8 flex items-center w-full`; // Base classes

            // Determine desktop alignment
            const desktopAlignmentClass = isEven ? 'md:justify-end' : 'md:flex-row-reverse md:justify-start';

            timelineItem.innerHTML = `
                <div class="order-1 w-full md:w-5/12 ${desktopAlignmentClass}"></div>
                <div class="z-20 flex items-center order-1 bg-purple-700 shadow-xl w-8 h-8 rounded-full timeline-circle">
                    <h1 class="mx-auto font-semibold text-lg text-white">${post.id}</h1>
                </div>
                <div class="order-1 bg-gray-800 rounded-lg shadow-xl w-full md:w-5/12 px-6 py-4 border border-purple-600 hover:border-purple-400 transition duration-300 timeline-item-container ${isEven ? 'right-aligned' : 'left-aligned'}">
                    <h3 class="mb-3 font-bold text-gray-100 text-xl">${post.title}</h3>
                    <p class="text-sm leading-snug tracking-wide text-gray-300 text-opacity-100">${post.description}</p>
                    <a href="/posts/${post.slug}.html" class="mt-4 inline-block text-purple-500 hover:text-purple-300 font-medium text-sm transition-colors duration-200">
                        Read More &rarr;
                    </a>
                    <span class="block text-xs text-gray-500 mt-2">${new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
            `;
            timelineContent.appendChild(timelineItem);
        });

        setupAnimations(); // Call animation setup after posts are loaded
    } catch (error) {
        console.error('Error loading posts:', error);
        document.getElementById('timeline-content').innerHTML = '<p class="text-center text-red-500">Failed to load posts. Check console for details.</p>';
    }
}

function setupAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.timeline-item').forEach(item => {
        observer.observe(item);
    });
}