document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    fetchAndDisplayFeeds([
        'https://cryptoast.fr/feed/',
        'https://coinacademy.fr/feed/',
        'https://journalducoin.com/feed/'
    ]);
    setupSearchFilter();
    displayLoadingIndicator(true);
});

let allArticles = [];
let fetchOperationsCompleted = 0; // Counter for completed fetch operations

function displayLoadingIndicator(show) {
    const loader = document.getElementById('loader');
    if (!loader) {
        const loaderHTML = `<div id="loader">Loading...</div>`;
        document.body.insertAdjacentHTML('afterbegin', loaderHTML);
    } else {
        loader.style.display = show ? 'block' : 'none';
    }
}

function initializeTheme() {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.body.className = currentTheme;
    const themeSwitchButton = document.getElementById('theme-switch');
    themeSwitchButton.textContent = currentTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
    themeSwitchButton.addEventListener('click', toggleTheme);
}

function toggleTheme() {
    const newTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
    document.body.className = newTheme;
    localStorage.setItem('theme', newTheme);
    document.getElementById('theme-switch').textContent = newTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
}

function setupSearchFilter() {
    document.getElementById('search').addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase();
        filterAndDisplayArticles(searchTerm);
    });
}

async function fetchAndDisplayFeeds(feedUrls) {
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    feedUrls.forEach(url => {
        fetchFeed(url, proxyUrl).finally(() => {
            fetchOperationsCompleted++;
            if (fetchOperationsCompleted === feedUrls.length) {
                displayLoadingIndicator(false); // Hide loading indicator when all fetches are complete
            }
        });
    });
}

async function fetchFeed(url, proxyUrl) {
    try {
        const response = await fetch(`${proxyUrl}${encodeURIComponent(url)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const feedText = await response.text();
        const articles = parseFeed(feedText);
        allArticles = [...allArticles, ...articles];
        allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
        displayArticlesIncrementally(articles);
    } catch (error) {
        console.error("Error fetching or processing feed:", error);
    }
}

function parseFeed(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
        console.error("Error parsing XML:", xmlDoc.getElementsByTagName("parsererror")[0].innerText);
        return [];
    }
    return Array.from(xmlDoc.querySelectorAll('item')).map(item => ({
        title: item.querySelector('title')?.textContent || 'No Title',
        link: item.querySelector('link')?.textContent || '#',
        creator: item.querySelector('dc\\:creator')?.textContent || item.querySelector('creator')?.textContent || 'Unknown Author',
        pubDate: item.querySelector('pubDate')?.textContent || '',
        description: (item.querySelector('description')?.textContent || 'No description available').replace(/<p>L’article .*?<\/p>/, '').trim(),
        siteName: new URL(item.querySelector('link')?.textContent || '').hostname.replace(/^www\./, '').split('.')[0]
    }));
}

function displayArticlesIncrementally(newArticles) {
    const feedContainer = document.getElementById('feed');
    newArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate)).forEach(article => {
        const articleHTML = `<article>
            <h2><a href="${article.link}" target="_blank" rel="noopener noreferrer">${article.title}</a></h2>
            <p>${article.description}</p>
            <p>By ${article.creator} on ${new Date(article.pubDate).toLocaleDateString()} | ${article.siteName}</p>
        </article>`;
        feedContainer.insertAdjacentHTML('beforeend', articleHTML);
    });
}

function filterAndDisplayArticles(searchTerm) {
    const filteredArticles = allArticles.filter(({ title, description, creator }) => 
        title.toLowerCase().includes(searchTerm) ||
        description.toLowerCase().includes(searchTerm) ||
        creator.toLowerCase().includes(searchTerm)
    );
    displayArticlesIncrementally(filteredArticles);
}
