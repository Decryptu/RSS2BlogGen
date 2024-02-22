document.addEventListener('DOMContentLoaded', () => {
    const feedUrls = [
        'https://cryptoast.fr/feed/',
        'https://coinacademy.fr/feed/'
    ];
    fetchAndDisplayFeeds(feedUrls);
});

async function fetchAndDisplayFeeds(feedUrls) {
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    // Fetch feeds concurrently to improve load time
    const feedPromises = feedUrls.map(feedUrl => fetchFeed(proxyUrl, feedUrl));
    const feeds = await Promise.all(feedPromises);
    feeds.forEach(feed => {
        if (feed) parseXML(feed); // Parse and display each feed if successfully fetched
    });
}

async function fetchFeed(proxyUrl, feedUrl) {
    try {
        const response = await fetch(`${proxyUrl}${encodeURIComponent(feedUrl)}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.text();
    } catch (error) {
        console.error("Error fetching RSS feed:", error);
        return null;
    }
}

function parseXML(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    const items = xmlDoc.querySelectorAll('item');
    if (items.length === 0) {
        console.error("No items found in the XML document.");
        return;
    }
    displayFeed(items);
}

function displayFeed(items) {
    const feedContainer = document.getElementById('feed');
    items.forEach(item => {
        const title = item.querySelector('title')?.textContent || 'No Title';
        const link = item.querySelector('link')?.textContent || '#';
        const creator = item.querySelector('dc\\:creator')?.textContent || 'Unknown Author';
        const pubDate = new Date(item.querySelector('pubDate')?.textContent).toLocaleDateString() || 'No Date';
        const description = item.querySelector('description')?.textContent || 'No description available';

        const articleHTML = `
            <article>
                <h2><a href="${link}" target="_blank" rel="noopener noreferrer">${title}</a></h2>
                <p>${description}</p>
                <p>By ${creator} on ${pubDate}</p>
            </article>
        `;
        // Append each article to the container to ensure all feeds are displayed
        feedContainer.insertAdjacentHTML('beforeend', articleHTML);
    });
}
