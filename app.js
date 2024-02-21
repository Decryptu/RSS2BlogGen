document.addEventListener('DOMContentLoaded', () => {
    console.log("Document loaded. Fetching RSS feed...");
    fetchRSSFeed();
});

async function fetchRSSFeed() {
    const proxyUrl = 'https://api.allorigins.win/get?url=';
    const feedUrl = encodeURIComponent('https://cryptoast.fr/feed/');
    console.log("Attempting to fetch RSS feed...");
    
    try {
        const response = await fetch(proxyUrl + feedUrl);
        console.log("RSS feed fetched. Processing response...");
        const data = await response.json();
        console.log("Response processed. Parsing XML...");
        
        if (data.contents) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data.contents, "text/xml");
            console.log("XML parsed. Displaying feed...");
            displayFeed(xmlDoc);
        } else {
            console.log("No contents found in the response:", data);
        }
    } catch (error) {
        console.error("Error fetching RSS feed:", error);
    }
}

function displayFeed(xmlDoc) {
    const items = xmlDoc.querySelectorAll('item');
    if (items.length > 0) {
        console.log(`Found ${items.length} items. Rendering...`);
    } else {
        console.log("No items found in the XML document.");
        return;
    }

    const feedContainer = document.getElementById('feed');
    feedContainer.innerHTML = ''; // Clear existing feed content

    items.forEach((item, index) => {
        console.log(`Processing item ${index + 1}...`);

        const title = item.querySelector('title').textContent;
        const link = item.querySelector('link').textContent;
        const creator = item.querySelector('dc\\:creator').textContent;
        const pubDate = new Date(item.querySelector('pubDate').textContent).toLocaleDateString();
        const description = item.querySelector('description').textContent;
        const thumbnailSrc = description.match(/src="([^"]+)"/) ? description.match(/src="([^"]+)"/)[1] : '';

        const articleHTML = `
            <article>
                <img src="${thumbnailSrc}" alt="Article Thumbnail">
                <div>
                    <h2><a href="${link}" target="_blank">${title}</a></h2>
                    <p>${description.substring(0, 100)}...</p>
                    <p>By ${creator} on ${pubDate}</p>
                </div>
            </article>
        `;

        feedContainer.innerHTML += articleHTML;
        console.log(`Item ${index + 1} processed and displayed.`);
    });
    console.log("All items rendered.");
}
