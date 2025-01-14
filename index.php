<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Children's Story Generator</title>
    <link rel="stylesheet" href="styles4.css?v=3433">
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="genre-box">
                <div class="genre-container">
                    <div class="input-group">
                        <label for="inputTags">Tags:</label>
                        <input type="text" id="inputTags">
                    </div>
                    <div class="input-group">
                        <label for="storyGenreSelect">Genre:</label>
                        <select id="storyGenreSelect">
                            <option value="adventure">Adventure</option>
                            <option value="fantasy">Fantasy</option>
                            <option value="mystery">Mystery</option>
                            <option value="sci-fi">Science Fiction</option>
                            <option value="spooky">Spooky</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="button-container">
            <button id="startProcess" type="button">Generate My Story</button>
            <button id="toggleSound" type="button" class="sound-button">
                <svg id="soundIcon" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
                    <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                    <path id="soundWaves" d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
            </button>
        </div>

        <div class="content-area">
            <div class="left">
                <div class="title-box">
                    <label for="storyTitle">Title:</label>
                    <input type="text" id="storyTitle" readonly>
                </div>

                <div class="content-box">
                    <label for="storyContent">Content:</label>
                    <textarea id="storyContent" rows="25" readonly></textarea>
                </div>

                <div class="audio-container" id="audioContainer">
                    <!-- Audio controls will be injected here -->
                </div>
            </div>

            <div class="right">
                <div class="image-placeholder" id="generatedImage">
                    <!-- Generated image will appear here -->
                </div>
                <div class="image-prompt-container">
                    <input type="text" id="imagePromptInput" class="image-prompt-input" placeholder="Image prompt...">
                    <button id="regenerateImage" class="regenerate-button">
                        <svg class="refresh-icon" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
                            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 12c0-4.4 3.6-8 8-8 3.3 0 6.2 2 7.4 4.9M22 12c0 4.4-3.6 8-8 8-3.3 0-6.2-2-7.4-4.9"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        <div class="debug-container">
            <label for="storyGenre">Genre:</label>
            <input type="text" id="storyGenre" readonly>
            <label for="storyContentDebug">Content DEBUG:</label>
            <textarea id="storyContentDebug" rows="4" cols="80" readonly></textarea>
        </div>
    </div>

    <script src="script12.js?v=439843"></script>
</body>
</html>
