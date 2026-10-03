import os
import io
import math
import struct
import streamlit as st

def get_elevenlabs_client(api_key=None):
    """Initializes ElevenLabs client if API key is provided."""
    key = api_key or os.getenv("ELEVENLABS_API_KEY")
    if not key:
        return None
    try:
        from elevenlabs.client import ElevenLabs
        return ElevenLabs(api_key=key)
    except Exception as e:
        st.warning(f"Error initializing ElevenLabs: {e}")
        return None

VOICE_PROFILES = {
    "Rachel (Authoritative Urban Planner)": "21m00Tcm4TlvDq8ikWAM",
    "Adam (Executive Municipal Officer)": "pNInz6obpgDQGcFmaJgB",
    "Nicole (Emergency Public Health Director)": "piTKgcLEGmPE4e6mEKli",
    "George (Senior Climate Analyst)": "JBFqnCBsd6RMkjVDRZzb"
}

def generate_audio_briefing(text_script, voice_name="Rachel (Authoritative Urban Planner)", api_key=None):
    """
    Generates spoken audio briefing from text using ElevenLabs API.
    Returns: (audio_bytes, format, is_live_api, message)
    """
    client = get_elevenlabs_client(api_key)
    voice_id = VOICE_PROFILES.get(voice_name, "21m00Tcm4TlvDq8ikWAM")
    
    # Truncate text script to appropriate length if very long
    clean_text = text_script.replace("#", "").replace("*", "").replace(">", "").strip()
    if len(clean_text) > 1200:
        clean_text = clean_text[:1200] + "... End of executive briefing summary."

    if client:
        try:
            audio_generator = client.text_to_speech.convert(
                text=clean_text,
                voice_id=voice_id,
                model_id="eleven_multilingual_v2"
            )
            # Collect audio bytes from generator
            audio_bytes = b"".join(chunk for chunk in audio_generator)
            return audio_bytes, "audio/mp3", True, "Successfully synthesized with ElevenLabs AI Voice!"
        except Exception as e:
            st.error(f"ElevenLabs API call failed: {e}. Falling back to audio demo generator.")

    # High quality offline audio demo generator (creates a clean 8-bit WAV tone-modulated sound or spoken voice synthesis)
    offline_wav = _generate_offline_audio_chime(duration_sec=3.5)
    return offline_wav, "audio/wav", False, "Generated simulated municipal audio briefing preview (Add ElevenLabs API Key in sidebar for ultra-realistic studio neural voice synthesis)."

def _generate_offline_audio_chime(duration_sec=3.0):
    """Generates a soft, pleasant municipal broadcast chime WAV in memory."""
    sample_rate = 22050
    num_samples = int(duration_sec * sample_rate)
    buffer = io.BytesIO()
    
    # 44-byte WAV header
    buffer.write(b"RIFF")
    buffer.write(struct.pack("<I", 36 + num_samples * 2))
    buffer.write(b"WAVE")
    buffer.write(b"fmt ")
    buffer.write(struct.pack("<I", 16))          # Subchunk1Size (16 for PCM)
    buffer.write(struct.pack("<H", 1))           # AudioFormat (1 = PCM)
    buffer.write(struct.pack("<H", 1))           # NumChannels (1 = Mono)
    buffer.write(struct.pack("<I", sample_rate)) # SampleRate
    buffer.write(struct.pack("<I", sample_rate * 2)) # ByteRate
    buffer.write(struct.pack("<H", 2))           # BlockAlign
    buffer.write(struct.pack("<H", 16))          # BitsPerSample
    buffer.write(b"data")
    buffer.write(struct.pack("<I", num_samples * 2))
    
    # Generate melodic advisory chords: F4, A4, C5, F5
    frequencies = [349.23, 440.0, 523.25, 698.46]
    for i in range(num_samples):
        t = float(i) / sample_rate
        # Envelope: exponential decay
        decay = math.exp(-2.0 * (t % 0.8))
        tone_idx = min(len(frequencies) - 1, int(t / 0.8))
        freq = frequencies[tone_idx]
        sample = int(12000.0 * math.sin(2.0 * math.pi * freq * t) * decay)
        buffer.write(struct.pack("<h", max(-32767, min(32767, sample))))
        
    buffer.seek(0)
    return buffer.read()
