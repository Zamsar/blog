document.addEventListener('DOMContentLoaded', () => {
    console.log("Zamir's Dev Log: JavaScript loaded!");
    
    // Determine which page we are on and load content accordingly
    if (document.getElementById('timeline-content')) {
        loadRecentPosts(); // For homepage timeline
    }
    if (document.getElementById('all-posts-grid')) {
        loadAllPosts(); // For dedicated all posts page
    }
});

async function fetchPostsData() {
    try {
        const response = await fetch('/data/posts.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching posts data:', error);
        return null;
    }
}

async function loadRecentPosts() {
    const allPosts = await fetchPostsData();
    if (!allPosts) return;

    // Sort by date (most recent first) and take the top 5
    const recentPosts = allPosts.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    const timelineContent = document.getElementById('timeline-content');
    if (!timelineContent) return; // Ensure element exists
    timelineContent.innerHTML = ''; // Clear any existing content

    recentPosts.forEach((post, index) => {
        const timelineItem = document.createElement('div');
        timelineItem.className = `timeline-item timeline-entry w-full`; // Base classes for animation and flex container

        timelineItem.innerHTML = `
            <div class="timeline-circle">
                <h1 class="font-semibold text-lg text-white">${index + 1}</h1>
            </div>
            <div class="timeline-card">
                <h3 class="mb-3 font-bold text-gray-100 text-xl">${post.title}</h3>
                <p class="text-sm leading-snug tracking-wide text-gray-300 text-opacity-100 mb-2">${post.description}</p>
                <a href="/posts/${post.slug}.html" class="inline-block text-purple-500 hover:text-purple-300 font-medium text-sm transition-colors duration-200">
                    Read More &rarr;
                </a>
                <span class="block text-xs text-gray-500 mt-2">${new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>
        `;
        timelineContent.appendChild(timelineItem);
    });

    setupAnimations(); // Call animation setup after posts are loaded
}

async function loadAllPosts() {
    const allPosts = await fetchPostsData();
    if (!allPosts) return;

    // Sort all posts by date (most recent first)
    const sortedPosts = allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

    const allPostsGrid = document.getElementById('all-posts-grid');
    if (!allPostsGrid) return; // Ensure element exists
    allPostsGrid.innerHTML = ''; // Clear any existing content

    sortedPosts.forEach(post => {
        const postCard = document.createElement('article');
        postCard.className = `bg-gray-800 rounded-xl shadow-lg post-card overflow-hidden timeline-item`; // Reusing timeline-item for animation
        
        postCard.innerHTML = `
            <div class="p-8">
                <h3 class="text-2xl font-semibold text-purple-400 mb-3">${post.title}</h3>
                <p class="text-gray-300 mb-4 text-base leading-relaxed">${post.description}</p>
                <a href="/posts/${post.slug}.html" class="block mt-4 text-purple-500 hover:text-purple-300 font-medium text-lg flex items-center group">
                    Read Post
                    <svg class="w-6 h-6 ml-2 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </a>
                <span class="block text-xs text-gray-500 mt-2">${new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>
        `;
        allPostsGrid.appendChild(postCard);
    });

    setupAnimations(); // Apply animations to all posts on this page too
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