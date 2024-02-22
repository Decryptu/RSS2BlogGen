document.addEventListener('DOMContentLoaded', () => {
    const feedUrls = [
        'https://cryptoast.fr/feed/',
        'https://coinacademy.fr/feed/',
        'https://journalducoin.com/feed/'
    ];
    initializeTheme();
    fetchAndDisplayFeeds(feedUrls);
    setupSearchFilter();
});

let allArticles = [];

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
    feedUrls.forEach(url => fetchFeed(url, proxyUrl));
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
        displayArticles(allArticles);
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

function displayArticles(articles) {
    const feedContainer = document.getElementById('feed');
    feedContainer.innerHTML = articles.map(({ title, link, creator, pubDate, description, siteName }) => {
        const pubDateDisplay = pubDate ? new Date(pubDate).toLocaleDateString() : 'No Date';
        return `
            <article>
                <h2><a href="${link}" target="_blank" rel="noopener noreferrer">${title}</a></h2>
                <p>${description}</p>
                <p>By ${creator} on ${pubDateDisplay} | ${siteName}</p>
            </article>
        `;
    }).join('');
}

function filterAndDisplayArticles(searchTerm) {
    const filteredArticles = allArticles.filter(({ title, description, creator }) => 
        title.toLowerCase().includes(searchTerm) ||
        description.toLowerCase().includes(searchTerm) ||
        creator.toLowerCase().includes(searchTerm)
    );
    displayArticles(filteredArticles);
}
