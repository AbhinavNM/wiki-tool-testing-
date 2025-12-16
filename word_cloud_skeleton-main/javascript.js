function searchWiki() {
    const query = document.getElementById("searchInput").value.trim();
    if (!query) return;

    const searchApiUrl =
        "https://en.wikipedia.org/w/api.php" +
        "?action=query" +
        "&format=json" +
        "&list=search" +
        "&srlimit=5" +
        "&srsearch=" + encodeURIComponent(query) +
        "&origin=*";

    document.getElementById("searchApiLink").innerHTML =
        `<a href="${searchApiUrl}" target="_blank">${searchApiUrl}</a>`;

    fetch(searchApiUrl)
        .then(res => res.json())
        .then(data => {
            const ul = document.getElementById("results");
            ul.innerHTML = "";

            data.query.search.forEach(item => {
                const li = document.createElement("li");
                const a = document.createElement("a");

                a.textContent = item.title;
                a.onclick = () => showPageData(item.title);

                li.appendChild(a);
                ul.appendChild(li);
            });
        });
}

function showPageData(title) {
    const pageApiUrl =
        "https://en.wikipedia.org/w/api.php" +
        "?action=query" +
        "&format=json" +
        "&prop=extracts" +
        "&explaintext=true" +
        "&titles=" + encodeURIComponent(title) +
        "&origin=*";

    document.getElementById("pageApiLink").innerHTML =
        `<a href="${pageApiUrl}" target="_blank">${pageApiUrl}</a>`;

    fetch(pageApiUrl)
        .then(res => res.json())
        .then(data => {
            const page = Object.values(data.query.pages)[0];
            calculateTopWords(page.extract || "");
        });
}

function calculateTopWords(text) {
    const stopWords = new Set([
        "the","is","and","a","of","to","in","that","it","as","for",
        "with","on","was","by","are","an","be","this","which","or",
        "from","at","has","its","were","also"
    ]);

    const words = text
        .toLowerCase()
        .replace(/[^a-z\s]/g, "")
        .split(/\s+/)
        .filter(w => w.length > 2 && !stopWords.has(w));

    const freq = {};
    words.forEach(w => freq[w] = (freq[w] || 0) + 1);

    const top20 = Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20);

    // Text list
    const list = document.getElementById("topWords");
    list.innerHTML = "";
    top20.forEach(([word, count]) => {
        const li = document.createElement("li");
        li.textContent = `${word} (${count})`;
        list.appendChild(li);
    });

    generateWordCloud(top20);
}

function generateWordCloud(wordData) {
    const canvas = document.getElementById("wordCloudCanvas");
    const wrapper = canvas.parentElement;

    // Resize canvas to fit container
    canvas.width = wrapper.offsetWidth;
    canvas.height = wrapper.offsetHeight;

    WordCloud(canvas, {
        list: wordData,
        gridSize: Math.round(canvas.width / 90),
        weightFactor: size => size * 3,
        fontFamily: "Arial, sans-serif",
        color: () => `hsl(${Math.random() * 360}, 70%, 50%)`,
        backgroundColor: "#f4f6f8",
        rotateRatio: 0.2,
        rotationSteps: 2,
        drawOutOfBound: false,
        shrinkToFit: true
    });
}
