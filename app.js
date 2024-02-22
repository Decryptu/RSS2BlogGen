document.addEventListener('DOMContentLoaded', () => {
    fetchRSSFeed();
});

async function fetchRSSFeed() {
    const proxyUrl = 'https://api.allorigins.win/get?url=';
    const feedUrl = encodeURIComponent('https://cryptoast.fr/feed/');
    try {
        const response = await fetch(`${proxyUrl}${feedUrl}`);
        const data = await response.json();
        if (data.contents) {
            parseXML(data.contents);
        } else {
            console.log("No RSS feed content found.");
        }
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

function parseXML(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    const items = xmlDoc.getElementsByTagName('item');

    if (items.length === 0) {
        console.log("No items found in the XML document. Check if the path to <item> elements is correct.");
        return;
    }

    displayFeed(items);
}

function displayFeed(items) {
    const feedContainer = document.getElementById('feed');
    feedContainer.innerHTML = '';

    for (let item of items) {
        const title = item.getElementsByTagName('title')[0].textContent;
        const link = item.getElementsByTagName('link')[0].textContent;
        const creator = item.getElementsByTagName('dc:creator')[0].textContent;
        const pubDate = new Date(item.getElementsByTagName('pubDate')[0].textContent).toLocaleDateString();
        // Extract description and clean it up for display
        const description = new DOMParser().parseFromString(item.getElementsByTagName('description')[0].textContent, "text/html").body.textContent;
        // Fallback thumbnail example, replace with actual extraction logic
        const thumbnailSrc = "https://example.com/thumbnail.jpg";

        const articleHTML = `
            <article>
                <img src="${thumbnailSrc}" alt="Thumbnail">
                <div>
                    <h2><a href="${link}" target="_blank">${title}</a></h2>
                    <p>${description.substring(0, 100)}...</p>
                    <p>By ${creator} on ${pubDate}</p>
                </div>
            </article>
        `;

        feedContainer.innerHTML += articleHTML;
    }
    console.log(`${items.length} items displayed.`);
}
