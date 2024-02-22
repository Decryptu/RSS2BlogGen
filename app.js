document.addEventListener('DOMContentLoaded', () => {
    const feedUrls = [
        'https://cryptoast.fr/feed/',
        'https://coinacademy.fr/feed/'
    ];
    fetchAndDisplayFeeds(feedUrls); // Ensure this matches the function name
});

async function fetchAndDisplayFeeds(feedUrls) {
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    const feedPromises = feedUrls.map(async (feedUrl) => {
        try {
            const response = await fetch(`${proxyUrl}${encodeURIComponent(feedUrl)}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const text = await response.text();
            return text;
        } catch (error) {
            console.error("Error fetching RSS feed:", error.message);
            return null; // Return null to filter out failed requests later
        }
    });

    // Wait for all feeds to be fetched before parsing to reduce perceived loading time
    const feeds = await Promise.all(feedPromises);
    feeds.forEach(feed => {
        if (feed) parseXML(feed); // Parse only successfully fetched feeds
    });
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
    // Optimize by building HTML string in a loop and then setting innerHTML once
    let articlesHTML = '';
    items.forEach((item) => {
        const title = item.querySelector('title')?.textContent || 'No Title';
        const link = item.querySelector('link')?.textContent || '#';
        // Attempt to correctly extract the dc:creator, accounting for potential CDATA and namespace issues
        const creator = item.querySelector('dc\\:creator, creator')?.textContent.replace('<![CDATA[', '').replace(']]>', '') || 'Unknown Author';
        const pubDate = new Date(item.querySelector('pubDate')?.textContent).toLocaleDateString() || 'No Date';
        const description = item.querySelector('description')?.textContent || 'No description available';

        articlesHTML += `
            <article>
                <h2><a href="${link}" target="_blank" rel="noopener noreferrer">${title}</a></h2>
                <p>${description}</p>
                <p>By ${creator} on ${pubDate}</p>
            </article>
        `;
    });
    feedContainer.innerHTML = articlesHTML; // Update the DOM once with all articles
}
