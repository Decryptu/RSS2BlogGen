document.addEventListener('DOMContentLoaded', () => {
    console.log("Document loaded. Starting to fetch RSS feed...");
    fetchRSSFeed();
});

async function fetchRSSFeed() {
    const proxyUrl = 'https://api.allorigins.win/get?url=';
    const feedUrl = encodeURIComponent('https://cryptoast.fr/feed/');
    console.log(`Fetching RSS feed from: ${proxyUrl + feedUrl}`);

    try {
        const response = await fetch(proxyUrl + feedUrl);
        console.log("RSS feed fetched. Processing response...");

        const data = await response.json();
        console.log("Response processed, parsing XML...");
        console.log("Raw response data:", data);

        if (data.contents) {
            parseXML(data.contents);
        } else {
            console.log("No contents in the response:", data);
        }
    } catch (error) {
        console.error("Error fetching RSS feed:", error);
    }
}

function parseXML(xmlString) {
    console.log("Parsing XML data...");
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
    feedContainer.innerHTML = ''; // Clear existing content

    items.forEach((item, index) => {
        console.log(`Processing item ${index + 1}...`);

        const title = item.querySelector('title').textContent;
        const link = item.querySelector('link').textContent;
        const creator = item.querySelector('dc\\:creator').textContent;
        const pubDate = new Date(item.querySelector('pubDate').textContent).toLocaleDateString();
        const description = item.querySelector('description').textContent;

        console.log(`Item ${index + 1} details:`, { title, link, creator, pubDate, description });

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
