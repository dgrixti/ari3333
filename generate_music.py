import torch
from transformers import AutoProcessor, MusicgenForConditionalGeneration
import scipy.io.wavfile as wavfile
import numpy as np

def generate_music_from_prompt(
    prompt: str,
    duration: int = 25,
    output_path: str = "generated_music_large.wav",
    model_size: str = "large"
):
    """
    Generate music from a text prompt using Meta's MusicGen model
    
    Parameters:
        prompt (str): Text description of the desired music
        duration (int): Duration of the generated music in seconds (max 30)
        output_path (str): Path where the generated audio will be saved
        model_size (str): Size of the model to use ('small', 'medium', or 'large')
    """
    # Ensure duration is within acceptable limits
    duration = min(duration, 30)  # Cap at 30 seconds
    
    # Print generation settings
    print(f"Generating music for prompt: '{prompt}'")
    print(f"Duration: {duration} seconds")
    print(f"Using model size: {model_size}")
    
    try:
        # Load model and processor
        model_id = f"facebook/musicgen-{model_size}"
        processor = AutoProcessor.from_pretrained(model_id)
        model = MusicgenForConditionalGeneration.from_pretrained(model_id)
        
        # Set the device (use GPU if available)
        device = "cuda" if torch.cuda.is_available() else "cpu"
        model = model.to(device)
        
        # Prepare the inputs
        inputs = processor(
            text=[prompt],
            padding=True,
            return_tensors="pt",
        ).to(device)
        
        # Generate audio
        print("Generating audio... This might take a few minutes.")
        audio_values = model.generate(
            **inputs,
            do_sample=True,
            guidance_scale=3.0,
            max_new_tokens=1500  # Safe default for ~30 seconds
        )
        
        # Convert to numpy array and normalize
        audio_array = audio_values[0, 0].cpu().numpy()
        audio_array = audio_array / np.max(np.abs(audio_array))
        
        # Save as WAV file
        sampling_rate = model.config.audio_encoder.sampling_rate
        wavfile.write(output_path, sampling_rate, (audio_array * 32767).astype(np.int16))
        
        print(f"Music successfully generated and saved to {output_path}")
        return True
        
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return False

if __name__ == "__main__":
    # Example usage
    # adventure: prompt = "magical forest music with ethereal flutes, soft chimes, and gentle nature sounds"
    # fantasy: prompt = "enchanted kingdom music with delicate harp, mystical choir vocals, shimmering bells, and flowing strings"
    # mystery prompt = "enigmatic soundscape with eerie violins, soft piano, distant whispers, and low atmospheric drones"
    # scifi: prompt = "futuristic space ambiance with pulsating synths, mechanical hums, echoing percussion, and cosmic tones"
    prompt = "haunted atmosphere with creaking wood, ghostly wails, eerie organ, and unsettling wind effects"
    generate_music_from_prompt(
        prompt=prompt,
        duration=30,  # Generate 30 seconds of music
        output_path="5_spooky.wav",
        model_size="small"  # Use large model for faster generation
    )


# http://172.28.2.183:5000/static/1_adventure_epic.wav
