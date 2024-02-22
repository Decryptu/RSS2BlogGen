document.addEventListener('DOMContentLoaded', () => {
    const feedUrls = [
        'https://cryptoast.fr/feed/',
        'https://coinacademy.fr/feed/'
    ];
    console.log("Starting to fetch feeds...");
    fetchAndDisplayFeeds(feedUrls);
});

async function fetchAndDisplayFeeds(feedUrls) {
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    for (const feedUrl of feedUrls) {
        console.log(`Fetching feed: ${feedUrl}`);
        try {
            const response = await fetch(`${proxyUrl}${encodeURIComponent(feedUrl)}`);
            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status} for ${feedUrl}`);
                continue;
            }
            const xmlText = await response.text();
            console.log(`Fetched feed successfully: ${feedUrl}`);
            parseAndDisplayFeed(xmlText);
        } catch (error) {
            console.error(`Error fetching RSS feed: ${feedUrl}`, error.message);
        }
    }
}

function parseAndDisplayFeed(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    
    // Check for parser errors
    if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
        console.error("Error parsing XML", xmlDoc.getElementsByTagName("parsererror")[0].textContent);
        return;
    }

    const items = xmlDoc.querySelectorAll('item');
    console.log(`Found ${items.length} items in the feed`);
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
        let creator = item.querySelector('dc\\:creator')?.textContent || item.querySelector('creator')?.textContent || 'Unknown Author';
        
        // Decode HTML entities in the creator's name
        const textarea = document.createElement('textarea');
        textarea.innerHTML = creator;
        creator = textarea.value;

        const pubDate = new Date(item.querySelector('pubDate')?.textContent).toLocaleDateString() || 'No Date';
        const description = item.querySelector('description')?.textContent || 'No description available';

        const articleHTML = `
            <article>
                <h2><a href="${link}" target="_blank" rel="noopener noreferrer">${title}</a></h2>
                <p>${description}</p>
                <p>By ${creator} on ${pubDate}</p>
            </article>
        `;
        console.log(`Displaying article: ${title}`);
        feedContainer.insertAdjacentHTML('beforeend', articleHTML);
    });
}
