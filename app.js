document.addEventListener('DOMContentLoaded', () => {
    const feedUrls = [
        'https://cryptoast.fr/feed/',
        'https://coinacademy.fr/feed/'
    ];
    fetchAndDisplayFeeds(feedUrls);
});

async function fetchAndDisplayFeeds(feedUrls) {
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    const feeds = await Promise.all(feedUrls.map(url => 
        fetch(`${proxyUrl}${encodeURIComponent(url)}`).then(response => 
            response.text()
        )
    ));

    const allArticles = feeds.flatMap(feed => parseFeed(feed))
        .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate)); // Sort articles by date

    displayArticles(allArticles);
}

function parseFeed(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    const items = xmlDoc.querySelectorAll('item');
    return Array.from(items).map(item => {
        const title = item.querySelector('title')?.textContent || 'No Title';
        const link = item.querySelector('link')?.textContent || '#';
        let creator = item.querySelector('dc\\:creator')?.textContent;
        if (!creator) { // Fallback for different or missing namespaces
            creator = item.querySelector('creator')?.textContent || 'Unknown Author';
        }
        const pubDate = item.querySelector('pubDate')?.textContent || '';
        const description = item.querySelector('description')?.textContent || 'No description available';

        return { title, link, creator, pubDate, description };
    });
}

function displayArticles(articles) {
    const feedContainer = document.getElementById('feed');
    feedContainer.innerHTML = ''; // Clear existing articles
    articles.forEach(({ title, link, creator, pubDate, description }) => {
        const articleHTML = `
            <article>
                <h2><a href="${link}" target="_blank" rel="noopener noreferrer">${title}</a></h2>
                <p>${description}</p>
                <p>By ${creator} on ${new Date(pubDate).toLocaleDateString()}</p>
            </article>
        `;
        feedContainer.insertAdjacentHTML('beforeend', articleHTML);
    });
}
