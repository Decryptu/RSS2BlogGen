document.addEventListener('DOMContentLoaded', () => {
    // Existing code to fetch and display RSS feed
    fetchRSSFeed();

    // Add search functionality
    const searchInput = document.getElementById('search');
    searchInput.addEventListener('keyup', function() {
        const query = this.value.toLowerCase();
        const articles = document.querySelectorAll('article');
        
        articles.forEach(article => {
            const title = article.querySelector('h2').textContent.toLowerCase();
            const description = article.querySelector('p').textContent.toLowerCase();
            const author = article.querySelector('p:nth-child(3)').textContent.toLowerCase(); // Adjust if necessary

            // Check if the article matches the search query
            if (title.includes(query) || description.includes(query) || author.includes(query)) {
                article.style.display = ''; // Show matching articles
            } else {
                article.style.display = 'none'; // Hide non-matching articles
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const feedUrls = [
        'https://cryptoast.fr/feed/',
        'https://coinacademy.fr/feed/'
    ];
    fetchAndDisplayFeeds(feedUrls);
});

async function fetchAndDisplayFeeds(feedUrls) {
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    for (const feedUrl of feedUrls) {
        try {
            const response = await fetch(`${proxyUrl}${encodeURIComponent(feedUrl)}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const text = await response.text();
            parseXML(text);
        } catch (error) {
            console.error("Error fetching RSS feed:", error.message);
        }
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
    feedContainer.innerHTML = ''; // Clear existing feed items before adding new ones
    items.forEach((item) => {
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
        feedContainer.innerHTML += articleHTML;
    });
}
