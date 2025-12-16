document.addEventListener("DOMContentLoaded", () => {
    const searchButton = document.getElementById("searchButton");
    const searchInput = document.getElementById("searchInput");
    const loader = document.getElementById("loader");

    searchButton.addEventListener("click", searchWiki);
    searchInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            searchWiki();
        }
    });

    async function searchWiki() {
        const query = searchInput.value.trim();
        if (!query) return;

        showLoader(true);
        clearResults();

        try {
            const searchApiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srlimit=5&srsearch=${encodeURIComponent(query)}&origin=*`;
            document.getElementById("searchApiLink").innerHTML = `<a href="${searchApiUrl}" target="_blank">${searchApiUrl}</a>`;

            const response = await fetch(searchApiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            const resultsList = document.getElementById("results");
            if (data.query.search.length === 0) {
                resultsList.innerHTML = "<li>No results found.</li>";
                return;
            }

            data.query.search.forEach(item => {
                const li = document.createElement("li");
                const a = document.createElement("a");
                a.textContent = item.title;
                a.href = "#";
                a.onclick = (e) => {
                    e.preventDefault();
                    showPageData(item.title);
                };
                li.appendChild(a);
                resultsList.appendChild(li);
            });
        } catch (error) {
            console.error("Error fetching search results:", error);
            alert("Failed to fetch search results. Please try again later.");
        } finally {
            showLoader(false);
        }
    }

    async function showPageData(title) {
        showLoader(true);
        try {
            const pageApiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&explaintext=true&titles=${encodeURIComponent(title)}&origin=*`;
            document.getElementById("pageApiLink").innerHTML = `<a href="${pageApiUrl}" target="_blank">${pageApiUrl}</a>`;

            const response = await fetch(pageApiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const page = Object.values(data.query.pages)[0];
            calculateTopWords(page.extract || "");
        } catch (error) {
            console.error("Error fetching page data:", error);
            alert("Failed to fetch page data. Please try again later.");
        } finally {
            showLoader(false);
        }
    }

    function calculateTopWords(text) {
        const stopWords = new Set([
            "the", "is", "and", "a", "of", "to", "in", "that", "it", "as", "for",
            "with", "on", "was", "by", "are", "an", "be", "this", "which", "or",
            "from", "at", "has", "its", "were", "also", "we", "he", "she", "they",
            "i", "you", "but", "not", "if", "so", "then", "thus", "hence", "therefore"
        ]);

        const words = text
            .toLowerCase()
            .replace(/[^a-z\s]/g, "")
            .split(/\s+/)
            .filter(w => w.length > 2 && !stopWords.has(w));

        const freq = {};
        words.forEach(w => freq[w] = (freq[w] || 0) + 1);

        const topWords = Object.entries(freq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20);

        const list = document.getElementById("topWords");
        list.innerHTML = "";
        topWords.forEach(([word, count]) => {
            const li = document.createElement("li");
            li.textContent = `${word} (${count})`;
            list.appendChild(li);
        });

        generateWordCloud(topWords);
    }

    function generateWordCloud(wordData) {
        const canvas = document.getElementById("wordCloudCanvas");
        const wrapper = canvas.parentElement;

        canvas.width = wrapper.offsetWidth;
        canvas.height = wrapper.offsetHeight;

        WordCloud(canvas, {
            list: wordData,
            gridSize: Math.round(canvas.width / 80),
            weightFactor: size => size * (canvas.width / 400),
            fontFamily: "inherit",
            color: () => `hsl(${Math.random() * 360}, 70%, 50%)`,
            backgroundColor: "transparent",
            rotateRatio: 0.3,
            rotationSteps: 4,
            drawOutOfBound: false,
            shrinkToFit: true
        });
    }

    function showLoader(show) {
        loader.style.display = show ? "block" : "none";
    }

    function clearResults() {
        document.getElementById("results").innerHTML = "";
        document.getElementById("topWords").innerHTML = "";
        document.getElementById("searchApiLink").innerHTML = "";
        document.getElementById("pageApiLink").innerHTML = "";
        const canvas = document.getElementById("wordCloudCanvas");
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
    }
});