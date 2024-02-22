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
    console.log("Document loaded. Starting to fetch RSS feeds...");
    // Define an array of feed URLs
    const feedUrls = [
        'https://cryptoast.fr/feed/',
        'https://coinacademy.fr/feed/'
    ];
    fetchAndDisplayFeeds(feedUrls);
});

async function fetchAndDisplayFeeds(feedUrls) {
    const proxyUrl = 'https://api.allorigins.win/get?url=';
    for (const feedUrl of feedUrls) {
        const encodedUrl = encodeURIComponent(feedUrl);
        console.log(`Fetching RSS feed from: ${proxyUrl + encodedUrl}`);
        try {
            const response = await fetch(proxyUrl + encodedUrl);
            const data = await response.json();
            if (data.contents) {
                const decodedXml = decodeBase64UTF8(data.contents.split(';base64,')[1]);
                parseXML(decodedXml);
            } else {
                console.log("No contents in the response:", data);
            }
        } catch (error) {
            console.error("Error fetching RSS feed:", error);
        }
    }
}

function decodeBase64UTF8(str) {
    return decodeURIComponent(atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

function parseXML(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    const items = xmlDoc.querySelectorAll('item');
    if (items.length > 0) {
        displayFeed(items);
    } else {
        console.error("No items found in the XML document.");
    }
}

function displayFeed(items) {
    const feedContainer = document.getElementById('feed');
    items.forEach((item, index) => {
        const title = item.querySelector('title') ? item.querySelector('title').textContent : 'No Title';
        const link = item.querySelector('link') ? item.querySelector('link').textContent : '#';
        const creatorElement = item.getElementsByTagNameNS("http://purl.org/dc/elements/1.1/", "creator");
        const creator = creatorElement.length > 0 ? creatorElement[0].textContent : 'Unknown Author';
        const pubDate = item.querySelector('pubDate') ? new Date(item.querySelector('pubDate').textContent).toLocaleDateString() : 'No Date';
        const description = item.querySelector('description') ? item.querySelector('description').textContent : 'No Description Available';

        console.log(`Processing item ${index + 1}: ${title}`);

        const articleHTML = `
            <article>
                <h2><a href="${link}" target="_blank">${title}</a></h2>
                <p>${description.substring(0, 100)}...</p>
                <p>By ${creator} on ${pubDate}</p>
            </article>
        `;

        feedContainer.innerHTML += articleHTML;
    });

    console.log("All items have been processed and displayed.");
}