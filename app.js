document.addEventListener('DOMContentLoaded', () => {
    fetchRSSFeed();
});

async function fetchRSSFeed() {
    const proxyUrl = 'https://api.allorigins.win/get?url=';
    const feedUrl = encodeURIComponent('https://cryptoast.fr/feed/');
    try {
        const response = await fetch(proxyUrl + feedUrl);
        const data = await response.json();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data.contents, "text/xml");
        displayFeed(xmlDoc);
    } catch (error) {
        console.error("Fetch error: ", error);
    }
}

function displayFeed(xmlDoc) {
    const items = xmlDoc.querySelectorAll('item');
    const feedContainer = document.getElementById('feed');

    items.forEach(item => {
        const title = item.querySelector('title').textContent;
        const link = item.querySelector('link').textContent;
        const description = new DOMParser().parseFromString(item.querySelector('description').textContent, "text/html").body.textContent;
        const creator = item.querySelector('dc\\:creator').textContent;
        const pubDate = new Date(item.querySelector('pubDate').textContent).toLocaleDateString();

        // Assuming the first image in the description is the thumbnail
        const thumbnailSrc = item.querySelector('description').textContent.match(/src="([^"]+)"/)[1];

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
    });
}
