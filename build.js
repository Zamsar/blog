const fs = require('fs-extra');
const path = require('path');
const MarkdownIt = require('markdown-it');
const matter = require('gray-matter'); // For front matter parsing

const md = new MarkdownIt({
    html: true, // Enable HTML tags in source
    linkify: true, // Autoconvert URL-like texts to links
    typographer: true // Enable some typographic replacements
});

const contentPostsDir = path.join(__dirname, 'content', 'posts');
const publicDir = path.join(__dirname, 'public');
const publicPostsDir = path.join(publicDir, 'posts');
const publicDataDir = path.join(publicDir, 'data');
const publicImagesDir = path.join(publicDir, 'images');

async function buildSite() {
    console.log('Starting site build...');

    // 1. Clean and prepare public directory
    await fs.emptyDir(publicDir);
    await fs.ensureDir(publicPostsDir);
    await fs.ensureDir(publicDataDir);
    await fs.ensureDir(publicImagesDir);
    console.log('Cleaned and prepared public directory structure.');

    // 2. Copy core static assets (index.html, css/, js/, images/) into public/
    await fs.copy(path.join(__dirname, 'public', 'index.html'), path.join(publicDir, 'index.html'));
    await fs.copy(path.join(__dirname, 'public', 'css'), path.join(publicDir, 'css'));
    await fs.copy(path.join(__dirname, 'public', 'js'), path.join(publicDir, 'js'));
    // Copy the profile image
    await fs.copy(path.join(__dirname, 'images', 'profile.jpg'), path.join(publicImagesDir, 'profile.jpg'));
    console.log('Copied core static assets and profile image.');

    // Array to store metadata for all posts
    const allPostsMetadata = [];

    // 3. Process each Markdown post
    const markdownFiles = await fs.readdir(contentPostsDir);

    for (const file of markdownFiles) {
        if (path.extname(file) === '.md') {
            const slug = path.basename(file, '.md');
            const markdownFilePath = path.join(contentPostsDir, file);
            const outputHtmlFilePath = path.join(publicPostsDir, `${slug}.html`);

            const fileContent = await fs.readFile(markdownFilePath, 'utf8');
            const { data, content } = matter(fileContent); // Parse front matter and content

            // Validate essential front matter
            if (!data.title || !data.date || !data.description) {
                console.warn(`Skipping ${file}: Missing required front matter (title, date, or description).`);
                continue;
            }

            // Add post metadata to array
            allPostsMetadata.push({
                id: allPostsMetadata.length + 1, // Simple ID generation
                title: data.title,
                description: data.description,
                date: data.date,
                slug: slug
            });

            const htmlContent = md.render(content); // Render markdown body to HTML

            // Basic HTML template for individual post page
            const postPageHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.title} - Zamir.dev</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/style.css">
    <style>
        /* Basic prose styling for markdown content */
        .prose {
            color: #C9D1D9; /* Light gray text */
            line-height: 1.75;
        }
        .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
            color: #E2E8F0; /* Lighter headings */
            margin-top: 1.5em;
            margin-bottom: 0.5em;
            font-weight: 600;
        }
        .prose h1 { font-size: 2.25em; }
        .prose h2 { font-size: 1.75em; }
        .prose h3 { font-size: 1.5em; }
        .prose p {
            margin-bottom: 1em;
        }
        .prose a {
            color: #A78BFA; /* Purple links */
            text-decoration: underline;
        }
        .prose code {
            background-color: #1a202c; /* Darker background for inline code */
            padding: 0.2em 0.4em;
            border-radius: 0.3em;
            font-size: 0.875em;
            color: #C084FC; /* Purple for code */
        }
        .prose pre {
            background-color: #1a202c; /* Darker background for code blocks */
            padding: 1em;
            border-radius: 0.5em;
            overflow-x: auto;
            color: #C9D1D9; /* Light gray for code text */
        }
        .prose pre code {
            background-color: transparent;
            padding: 0;
            border-radius: 0;
            font-size: 1em;
            color: inherit;
        }
        .prose ul, .prose ol {
            margin-left: 1.5em;
            margin-bottom: 1em;
        }
        .prose li {
            margin-bottom: 0.5em;
        }
    </style>
</head>
<body class="min-h-screen flex flex-col bg-gray-950 text-gray-200">
    <header class="bg-gray-900 text-white p-6 border-b border-purple-800 fixed w-full z-30">
        <div class="container mx-auto flex justify-between items-center">
            <a href="/" class="text-3xl md:text-4xl font-extrabold tracking-wide text-purple-400">Zamir.dev</a>
            <nav class="space-x-4 md:space-x-6">
                <a href="/#timeline" class="text-base md:text-lg font-medium text-gray-300 hover:text-purple-400 transition duration-200">Timeline</a>
                <a href="/#about" class="text-base md:text-lg font-medium text-gray-300 hover:text-purple-400 transition duration-200">About</a>
                <a href="/#contact" class="text-base md:text-lg font-medium text-gray-300 hover:text-purple-400 transition duration-200">Contact</a>
            </nav>
        </div>
    </header>
    <main class="flex-grow pt-24 container mx-auto px-4 py-16 max-w-4xl">
        <article class="bg-gray-900 p-8 md:p-12 rounded-lg shadow-xl border border-purple-800">
            <h1 class="text-4xl md:text-5xl font-bold mb-4 text-purple-400">${data.title}</h1>
            <p class="text-gray-400 text-sm mb-8">Published: ${new Date(data.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <div class="prose max-w-none">
                ${htmlContent}
            </div>
        </article>
    </main>
    <footer class="bg-gray-900 text-gray-400 py-10 px-4 mt-16 rounded-t-2xl shadow-inner border-t border-purple-800">
        <div class="container mx-auto flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <p class="text-md mb-4 md:mb-0">&copy; 2025 Zamir. All rights reserved.</p>
            <div class="flex space-x-8">
                <a href="#" class="text-gray-400 hover:text-purple-400 transition duration-200 text-sm">Privacy</a>
                <a href="#" class="text-gray-400 hover:text-purple-400 transition duration-200 text-sm">Terms</a>
            </div>
        </div>
    </footer>
</body>
</html>
            `;
            await fs.writeFile(outputHtmlFilePath, postPageHtml);
            console.log(`Generated ${outputHtmlFilePath}`);
        }
    }

    // 4. Sort posts metadata by date (most recent first) and write to JSON
    allPostsMetadata.sort((a, b) => new Date(b.date) - new Date(a.date));
    await fs.writeJson(path.join(publicDataDir, 'posts.json'), allPostsMetadata);
    console.log('Generated posts.json metadata.');

    console.log('Site build complete.');
}

buildSite().catch(err => {
    console.error('Build failed:', err);
    process.exit(1);
});