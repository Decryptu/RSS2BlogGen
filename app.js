document.addEventListener('DOMContentLoaded', () => {
    const feedUrls = [
        'https://cryptoast.fr/feed/',
        'https://coinacademy.fr/feed/',
        'https://journalducoin.com/feed/'
    ];
    fetchAndDisplayFeeds(feedUrls);
});

async function fetchAndDisplayFeeds(feedUrls) {
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    try {
        const feedResponses = await Promise.all(feedUrls.map(url =>
            fetch(`${proxyUrl}${encodeURIComponent(url)}`).then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
        ));
        const allArticles = feedResponses.flatMap(feed => parseFeed(feed))
            .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate)); // Sort articles by date
        displayArticles(allArticles);
    } catch (error) {
        console.error("Error fetching or processing feeds:", error);
    }
}

function parseFeed(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
        console.error("Error parsing XML:", xmlDoc.getElementsByTagName("parsererror")[0].innerText);
        return [];
    }
    const items = xmlDoc.querySelectorAll('item');
    return Array.from(items).map(item => {
        const title = item.querySelector('title')?.textContent || 'No Title';
        const link = item.querySelector('link')?.textContent || '#';
        let creator = item.querySelector('dc\\:creator')?.textContent || item.querySelector('creator')?.textContent || 'Unknown Author';
        const pubDate = item.querySelector('pubDate')?.textContent || '';
        let description = item.querySelector('description')?.textContent || 'No description available';
        description = description.replace(/<p>L’article .*?<\/p>/, '').trim(); // Remove the origin sentence.
        
        // Extract the site name from the link URL
        const siteName = new URL(link).hostname.replace(/^www\./, '').split('.')[0];
        return { title, link, creator, pubDate, description, siteName };
    });
}

function displayArticles(articles) {
    const feedContainer = document.getElementById('feed');
    feedContainer.innerHTML = ''; // Clear existing articles
    articles.forEach(({ title, link, creator, pubDate, description, siteName }) => {
        const pubDateDisplay = pubDate ? new Date(pubDate).toLocaleDateString() : 'No Date';
        const articleHTML = `
            <article>
                <h2><a href="${link}" target="_blank" rel="noopener noreferrer">${title}</a></h2>
                <p>${description}</p>
                <p>By ${creator} on ${pubDateDisplay} | ${siteName}</p>
            </article>
        `;
        feedContainer.insertAdjacentHTML('beforeend', articleHTML);
    });
}
