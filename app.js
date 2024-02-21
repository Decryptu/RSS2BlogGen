document.addEventListener('DOMContentLoaded', () => {
    fetchRSSFeed();
});

async function fetchRSSFeed() {
    const proxyUrl = 'https://api.allorigins.win/get?url=';
    const feedUrl = encodeURIComponent('https://cryptoast.fr/feed/');
    const response = await fetch(proxyUrl + feedUrl);
    const data = await response.json();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data.contents, "text/xml");
    const items = xmlDoc.querySelectorAll('item');

    const feedContainer = document.getElementById('feed');
    feedContainer.innerHTML = ''; // Clear existing feed

    items.forEach(item => {
        const title = item.querySelector('title').textContent;
        const link = item.querySelector('link').textContent;
        const description = item.querySelector('description').textContent;
        const pubDate = new Date(item.querySelector('pubDate').textContent).toLocaleDateString();

        const articleHTML = `
            <article>
                <h2>${title}</h2>
                <p>${description}</p>
                <a href="${link}" target="_blank">Read more</a>
                <span>${pubDate}</span>
            </article>
        `;

        feedContainer.innerHTML += articleHTML;
    });
}
