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
    console.log("Document loaded. Starting to fetch RSS feed...");
    fetchRSSFeed();
});

async function fetchRSSFeed() {
    const proxyUrl = 'https://api.allorigins.win/get?url=';
    const feedUrl = encodeURIComponent('https://coinacademy.fr/feed/');
    console.log(`Fetching RSS feed from: ${proxyUrl + feedUrl}`);

    try {
        const response = await fetch(proxyUrl + feedUrl);
        console.log("RSS feed fetched. Processing response...");
        const data = await response.json();
        console.log("Response processed, parsing XML...");
        console.log("Raw response data:", data);

        if (data.contents) {
            const decodedXml = decodeBase64UTF8(data.contents.split(';base64,')[1]);
            console.log("Decoded XML:", decodedXml);
            parseXML(decodedXml);
        } else {
            console.log("No contents in the response:", data);
        }
    } catch (error) {
        console.error("Error fetching RSS feed:", error);
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
    console.log("XML Document:", xmlDoc);

    const items = xmlDoc.querySelectorAll('item');
    console.log(`Found ${items.length} 'item' elements.`);

    if (items.length > 0) {
        displayFeed(items);
    } else {
        console.error("No items found in the XML document. Check if the path to <item> elements is correct.");
    }
}

function displayFeed(items) {
    const feedContainer = document.getElementById('feed');
    feedContainer.innerHTML = '';

    items.forEach((item, index) => {
        const title = item.querySelector('title') ? item.querySelector('title').textContent : 'No Title';
        const link = item.querySelector('link') ? item.querySelector('link').textContent : '#';
        const creatorElement = item.getElementsByTagNameNS("http://purl.org/dc/elements/1.1/", "creator");
        const creator = creatorElement.length > 0 ? creatorElement[0].textContent : 'Unknown Author';
        const pubDate = item.querySelector('pubDate') ? new Date(item.querySelector('pubDate').textContent).toLocaleDateString() : 'No Date';
        
        // Handling both 'description' and 'content:encoded' elements
        let descriptionContent = item.querySelector('description') ? item.querySelector('description').textContent : '';
        const contentEncoded = item.querySelector('content\\:encoded') ? item.querySelector('content\\:encoded').textContent : '';
        
        // Prefer 'content:encoded' if available, otherwise use 'description'
        const description = contentEncoded || descriptionContent;
        descriptionContent = description.length > 200 ? description.substring(0, 200) + '...' : description;

        console.log(`Processing item ${index + 1}: ${title}`);

        const articleHTML = `
            <article>
                <h2><a href="${link}" target="_blank">${title}</a></h2>
                <p>${descriptionContent}</p>
                <p>By ${creator} on ${pubDate}</p>
            </article>
        `;

        feedContainer.innerHTML += articleHTML;
    });

    console.log("All items have been processed and displayed.");
}
