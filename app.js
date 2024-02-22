document.addEventListener('DOMContentLoaded', () => {
    const feedUrls = [
        'https://cryptoast.fr/feed/',
        'https://coinacademy.fr/feed/'
    ];
    fetchAndDisplayFeeds(feedUrls);
});

async function fetchAndDisplayFeeds(feedUrls) {
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    const feedPromises = feedUrls.map(url => fetch(`${proxyUrl}${encodeURIComponent(url)}`).then(response => response.text()));
    const feeds = await Promise.all(feedPromises);

    const articles = [];
    feeds.forEach(feed => {
        const items = parseFeed(feed);
        articles.push(...items);
    });

    // Sort articles by date
    articles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    // Display sorted articles
    displayArticles(articles);
}

function parseFeed(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    const items = xmlDoc.querySelectorAll('item');
    return Array.from(items).map(item => {
        // Extract and decode the creator's name
        let creator = item.querySelector('dc\\:creator')?.textContent || 'Unknown Author';
        const textarea = document.createElement('textarea');
        textarea.innerHTML = creator;
        creator = textarea.value;

        return {
            title: item.querySelector('title')?.textContent || 'No Title',
            link: item.querySelector('link')?.textContent || '#',
            creator: creator,
            pubDate: item.querySelector('pubDate')?.textContent || '',
            description: item.querySelector('description')?.textContent || 'No description available'
        };
    });
}

function displayArticles(articles) {
    const feedContainer = document.getElementById('feed');
    feedContainer.innerHTML = ''; // Clear existing content
    articles.forEach(article => {
        const articleHTML = `
            <article>
                <h2><a href="${article.link}" target="_blank" rel="noopener noreferrer">${article.title}</a></h2>
                <p>${article.description}</p>
                <p>By ${article.creator} on ${new Date(article.pubDate).toLocaleDateString()}</p>
            </article>
        `;
        feedContainer.insertAdjacentHTML('beforeend', articleHTML);
    });
}
