document.addEventListener('DOMContentLoaded', () => {
    const feedUrls = [
        'https://cryptoast.fr/feed/',
        'https://coinacademy.fr/feed/'
    ];
    fetchAndDisplayFeeds(feedUrls);
});

async function fetchAndDisplayFeeds(feedUrls) {
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    const responses = await Promise.all(feedUrls.map(url => fetch(`${proxyUrl}${encodeURIComponent(url)}`).then(res => res.text())));
    responses.forEach(response => {
        if (response) {
            parseAndDisplayFeed(response);
        }
    });
}

function parseAndDisplayFeed(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    const items = xmlDoc.querySelectorAll('item');
    displayFeed(items);
}

function displayFeed(items) {
    const feedContainer = document.getElementById('feed');
    items.forEach(item => {
        const title = item.querySelector('title')?.textContent || 'No Title';
        const link = item.querySelector('link')?.textContent || '#';
        let creator = item.querySelector('dc\\:creator')?.textContent || item.querySelector('creator')?.textContent || 'Unknown Author';
        
        // Decode HTML entities in the creator's name, if any
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
        feedContainer.insertAdjacentHTML('beforeend', articleHTML);
    });
}
