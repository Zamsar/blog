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
        const posts = await response.json();
        const timelineContent = document.getElementById('timeline-content');
        
        posts.forEach((post, index) => {
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
                    <a href="${post.link}" class="mt-4 inline-block text-purple-500 hover:text-purple-300 font-medium text-sm transition-colors duration-200">
                        Read More &rarr;
                    </a>
                    <span class="block text-xs text-gray-500 mt-2">${post.date}</span>
                </div>
            `;
            timelineContent.appendChild(timelineItem);
        });

        setupAnimations(); // Call animation setup after posts are loaded
    } catch (error) {
        console.error('Error loading posts:', error);
        // Optionally display an error message on the page
        document.getElementById('timeline-content').innerHTML = '<p class="text-center text-red-500">Failed to load posts. Please try again later.</p>';
    }
}

function setupAnimations() {
    const observerOptions = {
        root: null, // relative to the viewport
        rootMargin: '0px',
        threshold: 0.1 // callback fires when 10% of item is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, observerOptions);

    // Observe each timeline item
    document.querySelectorAll('.timeline-item').forEach(item => {
        observer.observe(item);
    });
}
