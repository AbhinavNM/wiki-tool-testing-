document.addEventListener("DOMContentLoaded", () => {
    // UI Elements
    const searchButton = document.getElementById("searchButton");
    const searchInput = document.getElementById("searchInput");
    const loader = document.getElementById("loader");
    const wordCountSlider = document.getElementById("wordCount");
    const wordCountValue = document.getElementById("wordCountValue");
    const customStopWordsInput = document.getElementById("customStopWords");
    const topWordsTitle = document.getElementById("topWordsTitle");

    // App state
    let currentText = "";

    // Event Listeners
    searchButton.addEventListener("click", searchWiki);
    searchInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            searchWiki();
        }
    });
    wordCountSlider.addEventListener("input", () => {
        wordCountValue.textContent = wordCountSlider.value;
        topWordsTitle.textContent = `Top ${wordCountSlider.value} Most Used Words`;
        if (currentText) {
            calculateTopWords(currentText);
        }
    });
    customStopWordsInput.addEventListener("change", () => {
        if (currentText) {
            calculateTopWords(currentText);
        }
    });

    // Functions
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
            currentText = page.extract || "";
            calculateTopWords(currentText);
        } catch (error) {
            console.error("Error fetching page data:", error);
            alert("Failed to fetch page data. Please try again later.");
        } finally {
            showLoader(false);
        }
    }

    function calculateTopWords(text) {
        const customStopWords = new Set(customStopWordsInput.value.split(",").map(s => s.trim()).filter(Boolean));
        const stopWords = new Set([
            'd', 'll', 'm', 're', 's', 've', 'a', 'a\'s', 'able', 'about', 'above', 'abroad', 'abst', 'accordance', 'according', 'accordingly', 'across', 'act', 'actually', 'added', 'adj', 'adopted', 'affected', 'affecting', 'affects', 'after', 'afterwards', 'again', 'against', 'ago', 'ah', 'ahead', 'ain\'t', 'all', 'allow', 'allows', 'almost', 'alone', 'along', 'alongside', 'already', 'also', 'although', 'always', 'am', 'amid', 'amidst', 'among', 'amongst', 'amount', 'an', 'and', 'announce', 'another', 'any', 'anybody', 'anyhow', 'anymore', 'anyone', 'anything', 'anyway', 'anyways', 'anywhere', 'apart', 'apparently', 'appear', 'appreciate', 'appropriate', 'approximately', 'are', 'aren', 'aren\'t', 'arent', 'arise', 'around', 'as', 'aside', 'ask', 'asking', 'associated', 'at', 'auth', 'available', 'away', 'awfully', 'b', 'back', 'be', 'became', 'because', 'become', 'becomes', 'becoming', 'been', 'before', 'beforehand', 'begin', 'beginning', 'beginnings', 'begins', 'behind', 'being', 'believe', 'below', 'beside', 'besides', 'best', 'better', 'between', 'beyond', 'biol', 'both', 'brief', 'briefly', 'but', 'by', 'c', 'c\'mon', 'c\'s', 'ca', 'came', 'can', 'can\'t', 'cannot', 'cant', 'cause', 'causes', 'certain', 'certainly', 'changes', 'clearly', 'co', 'com', 'come', 'comes', 'con', 'concerning', 'consequently', 'consider', 'considering', 'contain', 'containing', 'contains', 'corresponding', 'could', 'couldn\'t', 'couldnt', 'course', 'currently', 'd', 'date', 'de', 'definitely', 'described', 'despite', 'did', 'didn\'t', 'different', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'done', 'down', 'downwards', 'due', 'during', 'e', 'each', 'ed', 'edu', 'effect', 'eg', 'eight', 'eighty', 'either', 'eleven', 'else', 'elsewhere', 'empty', 'end', 'ending', 'enough', 'entirely', 'especially', 'et', 'et-al', 'etc', 'even', 'ever', 'every', 'everybody', 'everyone', 'everything', 'everywhere', 'ex', 'exactly', 'example', 'except', 'f', 'far', 'few', 'ff', 'fifteen', 'fifth', 'fify', 'fill', 'find', 'first', 'five', 'fix', 'followed', 'following', 'follows', 'for', 'former', 'formerly', 'forth', 'forty', 'found', 'four', 'from', 'front', 'full', 'fully', 'further', 'furthermore', 'g', 'gave', 'get', 'gets', 'getting', 'give', 'given', 'gives', 'giving', 'go', 'goes', 'going', 'gone', 'got', 'gotten', 'greetings', 'h', 'had', 'hadn\'t', 'half', 'happens', 'hardly', 'has', 'hasn\'t', 'hasnt', 'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'hello', 'help', 'hence', 'her', 'here', 'here\'s', 'hereafter', 'hereby', 'herein', 'hereupon', 'hers', 'herself', 'hi', 'him', 'himself', 'his', 'hither', 'home', 'homepage', 'hopefully', 'how', 'how\'d', 'how\'ll', 'how\'s', 'howbeit', 'however', 'hundred', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'ie', 'if', 'ignored', 'ii', 'il', 'ill', 'im', 'immediate', 'in', 'inasmuch', 'inc', 'inc.', 'indeed', 'indicate', 'indicated', 'indicates', 'inner', 'inside', 'insofar', 'instead', 'int', 'interest', 'interested', 'interesting', 'interests', 'into', 'inward', 'io', 'iq', 'ir', 'is', 'isn\'t', 'it', 'it\'d', 'it\'ll', 'it\'s', 'itd', 'itll', 'its', 'itself', 'j', 'just', 'k', 'keep', 'keeps', 'kept', 'keys', 'kg', 'km', 'know', 'known', 'knows', 'l', 'largely', 'last', 'lately', 'later', 'latter', 'latterly', 'least', 'less', 'lest', 'let', 'let\'s', 'like', 'liked', 'likely', 'line', 'little', 'look', 'looking', 'looks', 'ltd', 'm', 'made', 'mainly', 'make', 'makes', 'many', 'may', 'maybe', 'me', 'mean', 'means', 'meantime', 'meanwhile', 'merely', 'mg', 'might', 'million', 'miss', 'ml', 'more', 'moreover', 'most', 'mostly', 'move', 'mr', 'mrs', 'ms', 'much', 'must', 'mustn\'t', 'my', 'myself', 'n', 'na', 'name', 'namely', 'nay', 'nd', 'near', 'nearly', 'necessarily', 'necessary', 'need', 'needs', 'neither', 'never', 'nevertheless', 'new', 'next', 'nine', 'ninety', 'no', 'nobody', 'non', 'none', 'noone', 'nor', 'normally', 'nos', 'not', 'nothing', 'novel', 'now', 'nowhere', 'o', 'obviously', 'of', 'off', 'often', 'oh', 'ok', 'okay', 'old', 'omitted', 'on', 'once', 'one', 'ones', 'only', 'onto', 'or', 'ord', 'other', 'others', 'otherwise', 'ought', 'our', 'ours', 'ourselves', 'out', 'outside', 'over', 'overall', 'own', 'p', 'page', 'pages', 'part', 'particular', 'particularly', 'past', 'per', 'perhaps', 'placed', 'please', 'plus', 'poorly', 'possible', 'possibly', 'potentially', 'predominantly', 'present', 'presumably', 'previously', 'primarily', 'probably', 'promptly', 'proud', 'provides', 'put', 'q', 'que', 'quickly', 'quite', 'qv', 'r', 'ran', 'rather', 'rd', 're', 'readily', 'really', 'reasonably', 'recent', 'recently', 'ref', 'refs', 'regarding', 'regardless', 'regards', 'related', 'relatively', 'research', 'respectively', 'resulted', 'resulting', 'results', 'right', 'round', 's', 'said', 'same', 'saw', 'say', 'saying', 'says', 'sec', 'second', 'secondly', 'see', 'seeing', 'seem', 'seemed', 'seeming', 'seems', 'seen', 'self', 'selves', 'sensible', 'sent', 'serious', 'seriously', 'seven', 'several', 'shall', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'show', 'showed', 'shown', 'showns', 'shows', 'side', 'significant', 'significantly', 'similar', 'similarly', 'since', 'sincere', 'six', 'sixty', 'slightly', 'so', 'some', 'somebody', 'somehow', 'someone', 'something', 'sometime', 'sometimes', 'somewhat', 'somewhere', 'soon', 'sorry', 'specifically', 'specified', 'specify', 'specifying', 'state', 'states', 'still', 'stop', 'strongly', 'sub', 'substantially', 'successfully', 'such', 'sufficiently', 'suggest', 'sup', 'sure', 't', 't\'s', 'take', 'taken', 'taking', 'tell', 'ten', 'tends', 'th', 'than', 'thank', 'thanks', 'thanx', 'that', 'that\'s', 'thats', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'thence', 'there', 'there\'s', 'thereafter', 'thereby', 'therefore', 'therein', 'theres', 'thereupon', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve', 'theyll', 'theyre', 'theyve', 'thickv', 'thin', 'think', 'third', 'thirty', 'this', 'thorough', 'thoroughly', 'those', 'thou', 'though', 'thoughh', 'thousand', 'three', 'throug', 'through', 'throughout', 'thru', 'thus', 'til', 'tip', 'to', 'together', 'too', 'took', 'top', 'toward', 'towards', 'tried', 'tries', 'truly', 'try', 'trying', 'ts', 'twice', 'twenty', 'two', 'u', 'un', 'under', 'unfortunately', 'unless', 'unlike', 'unlikely', 'until', 'unto', 'up', 'upon', 'ups', 'us', 'use', 'used', 'useful', 'usefully', 'usefulness', 'uses', 'using', 'usually', 'v', 'value', 'various', 'very', 'via', 'viz', 'vol', 'vols', 'vs', 'w', 'want', 'wants', 'was', 'wasn\'t', 'wasnt', 'way', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'wed', 'welcome', 'well', 'went', 'were', 'weren\'t', 'werent', 'what', 'what\'s', 'whatever', 'whatll', 'whats', 'whatve', 'when', 'whence', 'whenever', 'where', 'where\'s', 'whereafter', 'whereas', 'whereby', 'wherein', 'whereupon', 'wherever', 'whether', 'which', 'while', 'whim', 'whither', 'who', 'who\'d', 'who\'ll', 'who\'s', 'whoever', 'whole', 'whom', 'whomever', 'whos', 'whose', 'why', 'why\'s', 'widely', 'will', 'willing', 'wish', 'with', 'within', 'without', 'won\'t', 'wonder', 'would', 'would\'ve', 'wouldn\'t', 'wouldnt', 'www', 'x', 'y', 'yes', 'yet', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'youd', 'youll', 'your', 'youre', 'yours', 'yourself', 'yourselves', 'youve', 'z', 'zero',
             ...customStopWords
        ]);

        const words = text
            .toLowerCase()
            .replace(/[^a-z\s]/g, "")
            .split(/\s+/) 
            .filter(w => w.length > 2 && !stopWords.has(w));

        const freq = {};
        words.forEach(w => freq[w] = (freq[w] || 0) + 1);

        const wordCount = parseInt(wordCountSlider.value, 10);
        const topWords = Object.entries(freq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, wordCount);

        const list = document.getElementById("topWords");
        list.innerHTML = "";
        topWords.forEach(([word, count]) => {
            const li = document.createElement("li");
            li.textContent = `${word} (${count})`;
            list.appendChild(li);
        });

        if (topWords.length > 0) {
            const maxFreq = topWords[0][1];
            const normalizedWords = topWords.map(([word, count]) => [word, count / maxFreq]);
            generateWordCloud(normalizedWords);
        } else {
            generateWordCloud([]);
        }
    }

    function generateWordCloud(wordData) {
        const canvas = document.getElementById("wordCloudCanvas");
        const wrapper = canvas.parentElement;

        canvas.width = wrapper.offsetWidth;
        canvas.height = wrapper.offsetHeight;

        WordCloud(canvas, {
            list: wordData,
            gridSize: Math.round(canvas.width / 80),
            weightFactor: size => Math.log(size) * 10,
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
