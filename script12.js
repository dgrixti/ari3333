const BASE_URL = "http://172.28.2.183:5000";

let backgroundAudio = null;
let isMuted = false;
let audioGenerationTriggered = false;

const genreAudioMap = {
    'adventure': '1_adventure_epic.wav',
    'fantasy': '2_fantasy.wav',
    'mystery': '3_mystery.wav',
    'sci-fi': '4_scifi.wav',
    'spooky': '5_spooky.wav'
};

function toggleSound() {
    isMuted = !isMuted;
    const soundWaves = document.getElementById('soundWaves');
    
    if (isMuted) {
        stopBackgroundMusic();
        soundWaves.style.display = 'none';
    } else {
        const genre = document.getElementById('storyGenreSelect').value;
        if (genre) {
            playBackgroundMusic(genre);
        }
        soundWaves.style.display = '';
    }
}

function playBackgroundMusic(genre) {
    if (isMuted) return;

    if (backgroundAudio) {
        backgroundAudio.pause();
        backgroundAudio = null;
    }

    backgroundAudio = new Audio(`${BASE_URL}/static/${genreAudioMap[genre]}`);
    backgroundAudio.loop = true;
    backgroundAudio.volume = 0.3;
    backgroundAudio.play();
}

function stopBackgroundMusic() {
    if (backgroundAudio) {
        backgroundAudio.pause();
        backgroundAudio = null;
    }
}

async function generateImageFromTags(tagsText) {
    const refreshIcon = document.querySelector('.refresh-icon');
    refreshIcon.classList.add('spinning');

    try {
        const response = await fetch(`${BASE_URL}/generate_image`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prompt: tagsText,
                size: "256x256",
            }),
        });

        const data = await response.json();

        if (data && data.image_url) {
            const imageElement = document.createElement("img");
            imageElement.src = data.image_url;
            imageElement.alt = "Generated Image";
            imageElement.style.maxWidth = "100%";
            imageElement.style.borderRadius = "8px";

            const imageContainer = document.getElementById("generatedImage");
            imageContainer.innerHTML = "";
            imageContainer.appendChild(imageElement);
        } else {
            console.error("Error generating image:", data.error || "Unknown error");
        }
    } catch (error) {
        console.error("Error while calling Flask backend:", error);
    } finally {
        refreshIcon.classList.remove('spinning');
    }
}

function regenerateImage() {
    const prompt = document.getElementById('imagePromptInput').value.trim();
    if (prompt) {
        generateImageFromTags(prompt);
    }
}

function normalizeToJSON(content) {
    content = content.replace(/'(\w+)'\s*:/g, '"$1":');
    content = content.replace(/:\s*'([^']*)'/gs, function (match, group) {
        return `: "${group.replace(/\n/g, "\\n")}"`;
    });
    content = content.replace(/(\.)(\s{2,})/g, '. ');
    content = content.replace(/\s{2,}/g, ' ');
    return content;
}

function generateStoryAudio(content) {
    if (audioGenerationTriggered) return;

    audioGenerationTriggered = true;
    const audioContainer = document.getElementById("audioContainer");
    audioContainer.innerHTML = "Generating audio...";

    fetch(`${BASE_URL}/generate_audio`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            story_content: content,
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data && data.audio_url) {
            audioContainer.innerHTML = "";
            const playButton = document.createElement("button");
            playButton.textContent = "Play Story Audio";
            playButton.onclick = () => {
                stopBackgroundMusic();
                const audio = new Audio(data.audio_url);
                audio.play();
            };
            audioContainer.appendChild(playButton);
        } else {
            console.error("Error generating audio:", data.error || "Unknown error");
        }
    })
    .catch(error => {
        console.error("Error while calling Flask backend for audio:", error);
    });
}

function getWordCount(str) {
    return str.trim().split(/\s+/).length;
}

function getFirstNWords(str, n) {
    return str.trim().split(/\s+/).slice(0, n).join(' ');
}

function startStoryGeneration() {
    const storyTitle = document.getElementById("storyTitle");
    const storyGenre = document.getElementById("storyGenre");
    const storyContent = document.getElementById("storyContent");
    const imagePromptInput = document.getElementById("imagePromptInput");
    const storyContentDebug = document.getElementById("storyContentDebug");
    const genButton = document.getElementById("startProcess");

    const tagsInput = document.getElementById("inputTags").value.trim();
    const genreSelect = document.getElementById("storyGenreSelect").value.trim();
    
    // Start playing background music for the selected genre
    playBackgroundMusic(genreSelect);

    const queryParams = new URLSearchParams({
        question: `Generate a children's story in the ${genreSelect} genre.`,
        tags: tagsInput
    });

    // Clear existing content
    storyTitle.value = "";
    storyGenre.value = "";
    storyContent.value = "";
    imagePromptInput.value = "";
    storyContentDebug.innerText = "";
    
    // Reset containers
    const audioContainer = document.getElementById("audioContainer");
    audioContainer.innerHTML = "";
    audioGenerationTriggered = false;
    
    const imageContainer = document.getElementById("generatedImage");
    imageContainer.innerHTML = "";

    let accumulatedContent = "";
    let accumulatedContentRaw = "";
    let previousWordCount = 0;
    let audioGenerated = false;
    
    let titleStarted = false;
    let genreStarted = false;
    let contentStarted = false;
    let tagsStarted = false;
    let contentEnded = false;
    let disableButton = false;
    let moodStarted = false;
    let moodEnded = false;

    let titleText = "";
    let genreText = "";
    let contentText = "";
    let tagsText = "";
    let moodText = "";

    let imageGenAPICalled = false;

    const eventSource = new EventSource(`${BASE_URL}/generate_story?${queryParams.toString()}`);

    eventSource.onmessage = function (event) {
        const data = JSON.parse(event.data);

        if (data.done) {
            eventSource.close();
        } else {
            accumulatedContent += data.content;
            accumulatedContentRaw += data.content;

            accumulatedContent = normalizeToJSON(accumulatedContent);
            accumulatedContent = accumulatedContent.replace(/,\s*"end":\s*"true"\s*}/g, '}');
            storyContentDebug.innerText = accumulatedContentRaw;

            if (accumulatedContent.includes('"story"')) {
                tagsStarted = true;

                if (disableButton === false) {
                    genButton.disabled = true;
                    genButton.innerText = 'Processing...';
                    disableButton = true;
                }
            }
            if (tagsStarted) {
                const tagsMatch = accumulatedContent.match(/"story"\s*:\s*"([^"]*)/);
                if (tagsMatch) {
                    tagsText = tagsMatch[1];
                    imagePromptInput.value = tagsText;
                }
            }

            if (accumulatedContent.includes('"title"')) {
                titleStarted = true;
                if (!imageGenAPICalled) {
                    generateImageFromTags(imagePromptInput.value || "A children's story");
                    imageGenAPICalled = true;
                }
            }
            if (titleStarted) {
                const titleMatch = accumulatedContent.match(/"title"\s*:\s*"([^"]*)/);
                if (titleMatch) {
                    titleText = titleMatch[1];
                    storyTitle.value = titleText;
                }
                if (!moodEnded) {
                    console.log("Generating background image mood - Deprecated");
                    console.log(moodText);
                    moodEnded = true;
                }
            }

            if (accumulatedContent.includes('"genre"')) {
                genreStarted = true;
            }
            if (genreStarted) {
                const genreMatch = accumulatedContent.match(/"genre"\s*:\s*"([^"]*)/);
                if (genreMatch) {
                    genreText = genreMatch[1];
                    storyGenre.value = genreText;
                }
            }
            
            if (accumulatedContent.includes('"mood"')) {
                moodStarted = true;
            }
            if (moodStarted) {
                const moodMatch = accumulatedContent.match(/"mood"\s*:\s*"([^"]*)/);
                if (moodMatch) {
                    moodText = moodMatch[1];
                }
            }

            if (accumulatedContent.includes('"content"')) {
                contentStarted = true;
            }
            if (contentStarted) {
                const contentMatch = accumulatedContent.match(/"content"\s*:\s*"(.*)/);
                if (contentMatch) {
                    contentText = contentMatch[1];
                    const formattedContent = contentText.replace(/\\n/g, "\n").replace(/\\\"/g, "\"");
                    storyContent.value = formattedContent;
                    
                    // Check word count and generate audio if over 60 words
                    const currentWordCount = getWordCount(formattedContent);
                    if (currentWordCount > 60 && !audioGenerated) {
                        console.log("60 words completed...");
                        const first60Words = getFirstNWords(formattedContent, 60);
                        console.log(first60Words);
                        generateStoryAudio(first60Words);
                        audioGenerated = true;
                    }
                    previousWordCount = currentWordCount;
                }
            }

            if (accumulatedContent.includes('"end"')) {
                contentEnded = true;
            }
            if (contentEnded) {
                genButton.disabled = false;
                genButton.innerText = 'Generate My Story';
                disableButton = false;
            }
        }
    };

    eventSource.onerror = function (error) {
        console.error("Error in EventSource:", error);
        eventSource.close();
        genButton.disabled = false;
        genButton.innerText = 'Generate My Story';
        stopBackgroundMusic();
    };
}

// Add event listeners
document.getElementById('startProcess').addEventListener('click', startStoryGeneration);
document.getElementById('toggleSound').addEventListener('click', toggleSound);
document.getElementById('regenerateImage').addEventListener('click', regenerateImage);
