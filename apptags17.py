import os
import json
from flask import Flask, Response, request, stream_with_context, jsonify
import ollama
import openai
from flask_cors import CORS
from gtts import gTTS
from pydub.generators import Sine  

app = Flask(__name__)
CORS(app)

# Initialize the Ollama client
ollama_client = ollama.Client()

# OpenAI API key
openai.api_key = "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"


@app.route('/generate_image', methods=['POST'])
def generate_image():
    data = request.json
    prompt = data.get("prompt", "A magical flying plane in a fantasy world")
    size = data.get("size", "256x256")
    try:
        response = openai.Image.create(
            prompt=prompt,
            n=1,
            size=size
        )
        image_url = response['data'][0]['url']
        return jsonify({"image_url": image_url})
    except openai.error.OpenAIError as e:
        return jsonify({"error": str(e)}), 400

@app.route('/generate_story', methods=['GET'])
def generate_story():
    base_prompt = request.args.get('question', 'Generate a children\'s adventure story and use ONLY single quotes in the json.')
    tags = request.args.get('tags', '')

    if tags:
        prompt = f"{base_prompt} including: {tags}"
    else:
        prompt = base_prompt

    def stream_response():
        response = ollama_client.chat(
            model='children_story_model_15',
            messages=[{'role': 'user', 'content': prompt}],
            stream=True
        )
        for chunk in response:
            yield f"data:{json.dumps({'content': chunk['message']['content'], 'done': False})}\n\n"
        yield f"data:{json.dumps({'done': True})}\n\n"

    return Response(stream_with_context(stream_response()), content_type='text/event-stream')

# Audio generation endpoint
@app.route('/generate_audio', methods=['POST'])
def generate_audio():
    data = request.json
    story_content = data.get("story_content", "")
    audio_filename = "/var/www/ollama/genai/static/story_audio.mp3"

    if not story_content:
        return jsonify({"error": "No story content provided"}), 400

    try:
        # Generate audio using gTTS
        tts = gTTS(text=story_content, lang='en')
        tts.save(audio_filename)

        audio_url = f"http://{request.host}/static/story_audio.mp3"
        return jsonify({"audio_url": audio_url})
    except Exception as e:
        print(f"Error generating audio: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/generate_music', methods=['POST'])
def generate_music():
    data = request.json
    prompt = data.get("prompt", "A calm and magical fantasy world")
    mood = data.get("mood", "calm and magical")
    length = data.get("length", 30)  # Length in seconds
    music_filename = "/var/www/ollama/genai/static/background_music.mp3"

    try:
        # Combine prompt and mood into the final music description
        music_prompt = f"{prompt} with a {mood} mood. Duration: {length} seconds."
        print(f"Generating music with the following description: {music_prompt}")

        # Procedural music generation using sine wave (placeholder)
        from pydub.generators import Sine
        from pydub import AudioSegment

        sine_wave = Sine(440).to_audio_segment(duration=length * 1000)  # Base tone
        sine_wave = sine_wave.overlay(Sine(523.25).to_audio_segment(duration=length * 1000))  # Add second tone

        sine_wave.export(music_filename, format="mp3")

        # Verify the file exists
        if not os.path.exists(music_filename):
            raise FileNotFoundError(f"File not generated: {music_filename}")

        music_url = f"http://{request.host}/static/background_music.mp3"
        print(f"Music generated and saved at: {music_url}")
        return jsonify({"music_url": music_url})

    except Exception as e:
        print(f"Error generating music: {e}")
        return jsonify({"error": str(e)}), 500



if __name__ == '__main__':
    # Ensure the static directory exists
    os.makedirs("/var/www/ollama/genai/static", exist_ok=True)
    app.run(host='0.0.0.0', port=5000, debug=True)
