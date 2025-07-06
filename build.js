const fs = require('fs-extra');
const path = require('path');
const MarkdownIt = require('markdown-it');
const matter = require('gray-matter');

const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
});

const contentPostsDir = path.join(__dirname, 'content', 'posts');
const publicDir = path.join(__dirname, 'public'); // This is the OUTPUT directory
const publicPostsDir = path.join(publicDir, 'posts');
const publicDataDir = path.join(publicDir, 'data');
const publicImagesDir = path.join(publicDir, 'images');
const includesDir = path.join(__dirname, '_includes'); // New includes directory

async function buildSite() {
    console.log('Starting site build...');
    console.log(`Current working directory (process.cwd()): ${process.cwd()}`);
    console.log(`__dirname (build.js location): ${__dirname}`);

    // 1. Clean and prepare public directory (the output folder)
    console.log(`Ensuring public output directory at: ${publicDir}`);
    await fs.emptyDir(publicDir);
    await fs.ensureDir(publicPostsDir);
    await fs.ensureDir(publicDataDir);
    await fs.ensureDir(publicImagesDir);
    console.log('Cleaned and prepared public directory structure.');

    // 2. Read reusable header HTML
    const headerHtml = await fs.readFile(path.join(includesDir, 'header.html'), 'utf8');
    console.log('Read header include file.');

    // 3. Copy core static assets from the ROOT of the repository into the public/ OUTPUT directory
    const sourceIndexHtmlTemplate = path.join(__dirname, 'index.html');
    const sourceCssDir = path.join(__dirname, 'css');
    const sourceJsDir = path.join(__dirname, 'js');
    const sourceProfileImg = path.join(__dirname, 'images', 'profile.jpg');

    console.log(`Attempting to copy:`);
    console.log(`  - Source index.html template: ${sourceIndexHtmlTemplate}`);
    console.log(`  - Source css/ directory: ${sourceCssDir}`);
    console.log(`  - Source js/ directory: ${sourceJsDir}`);
    console.log(`  - Source profile.jpg: ${sourceProfileImg}`);

    // Verify source files/directories exist before copying
    if (!(await fs.pathExists(sourceIndexHtmlTemplate))) {
        throw new Error(`Source file not found: ${sourceIndexHtmlTemplate}. Ensure index.html is at the root of your repository.`);
    }
    if (!(await fs.pathExists(sourceCssDir))) {
        throw new Error(`Source directory not found: ${sourceCssDir}. Ensure css/ is at the root of your repository.`);
    }
    if (!(await fs.pathExists(sourceJsDir))) {
        throw new Error(`Source directory not found: ${sourceJsDir}. Ensure js/ is at the root of your repository.`);
    }
    if (!(await fs.pathExists(sourceProfileImg))) {
        throw new Error(`Source file not found: ${sourceProfileImg}. Ensure images/profile.jpg exists at the root of your repository.`);
    }

    // Read index.html content, inject header, then write to public/index.html
    let indexHtmlContent = await fs.readFile(sourceIndexHtmlTemplate, 'utf8');
    indexHtmlContent = indexHtmlContent.replace('<!-- HEADER_PLACEHOLDER -->', headerHtml);
    await fs.writeFile(path.join(publicDir, 'index.html'), indexHtmlContent);

    await fs.copy(sourceCssDir, path.join(publicDir, 'css'));
    await fs.copy(sourceJsDir, path.join(publicDir, 'js'));
    await fs.copy(sourceProfileImg, path.join(publicImagesDir, 'profile.jpg'));
    console.log('Copied core static assets and profile image.');

    // Array to store metadata for all posts
    const allPostsMetadata = [];

    // 4. Process each Markdown post
    const markdownFiles = await fs.readdir(contentPostsDir);
    console.log(`Found ${markdownFiles.length} markdown files in ${contentPostsDir}`);

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

            // HTML template for individual post page - now also includes headerHtml
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
    ${headerHtml} <!-- Injected header -->
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

    // 5. Sort posts metadata by date (most recent first) and write to JSON
    allPostsMetadata.sort((a, b) => new Date(b.date) - new Date(a.date));
    await fs.writeJson(path.join(publicDataDir, 'posts.json'), allPostsMetadata);
    console.log('Generated posts.json metadata.');

    console.log('Site build complete.');
}

buildSite().catch(err => {
    console.error('Build failed:', err);
    process.exit(1);
});
