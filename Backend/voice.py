import pyaudio
import wave
import time
import threading
import pyttsx3
import speech_recognition as sr
import queue
import numpy as np
import google.generativeai as genai
import keyboard


# Audio config
CHUNK = 1024
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 44100
SILENCE_THRESHOLD = 100  # Adjusted for realistic detection
SILENCE_DURATION = 2

class InterviewBot:
    def __init__(self):
        self.p = pyaudio.PyAudio()
        self.stream = None
        self.frames = []
        self.is_recording = False
        self.recording_thread = None
        self.silence_counter = 0
        self.current_speech = ""

        # TTS
        self.engine = pyttsx3.init()
        self.engine.setProperty('rate', 150)

        # Speech recognizer
        self.recognizer = sr.Recognizer()
        self.recognizer.energy_threshold = 500
        self.recognizer.dynamic_energy_threshold = True

        # Gemini config
        genai.configure(api_key="AIzaSyBgsjMPx9ADn8sYtb2nuf5D4FLtEc2OHHI")
        self.model = genai.GenerativeModel('gemini-pro')
        self.chat = self.model.start_chat(history=[])

        self.questions = [
            "Tell me about yourself.",
            "What are your strengths?",
            "What is your weakness and how do you work on it?",
            "Why do you want this job?",
            "Where do you see yourself in five years?",
            "Tell me about a challenging project.",
            "How do you handle stress?",
            "What are your salary expectations?",
            "Do you have any questions for me?",
            "Thank you for your time."
        ]
        self.current_question_index = 0

    def speak(self, text):
        print(f"\n🤖 Interviewer: {text}")
        self.engine.say(text)
        self.engine.runAndWait()

    def get_bot_response(self, user_input):
        try:
            response = self.chat.send_message(
                f"""As an AI interviewer, give a relevant follow-up question based on: {user_input}"""
            )
            return response.text
        except Exception as e:
            print(f"❌ Gemini Error: {e}")
            return "That's interesting. Can you elaborate?"

    def process_audio_chunk(self, audio_data):
        try:
            print("\r🎤 Processing speech...", end="", flush=True)
            audio = sr.AudioData(audio_data, RATE, 2)
            text = self.recognizer.recognize_google(audio)
            if text:
                self.current_speech = text
                print(f"\r👤 You: {self.current_speech}")
        except sr.UnknownValueError:
            print("\r🤷 Couldn't understand. Please try again.", end="", flush=True)
        except sr.RequestError as e:
            print(f"\n❌ Speech service error: {e}")
        except Exception as e:
            print(f"\n❌ General error: {e}")

    def is_silence(self, audio_data):
        try:
            audio_array = np.frombuffer(audio_data, dtype=np.int16)
            level = np.abs(audio_array).mean()
            print(f"\r🎧 Audio Level: {level:.2f}", end="", flush=True)
            return level < SILENCE_THRESHOLD
        except Exception as e:
            print(f"\n❌ Silence check error: {e}")
            return False

    def start_recording(self):
        print("\n🎤 Listening... (Speak now)")
        self.is_recording = True
        self.frames = []
        self.silence_counter = 0
        self.current_speech = ""

        try:
            self.stream = self.p.open(
                format=FORMAT,
                channels=CHANNELS,
                rate=RATE,
                input=True,
                frames_per_buffer=CHUNK
            )

            self.recording_thread = threading.Thread(target=self._record_audio)
            self.recording_thread.start()
        except Exception as e:
            print(f"\n❌ Stream error: {e}")
            self.is_recording = False

    def _record_audio(self):
        chunk_buffer = []
        while self.is_recording:
            try:
                data = self.stream.read(CHUNK, exception_on_overflow=False)
                self.frames.append(data)
                chunk_buffer.append(data)

                # Log audio level
                audio_array = np.frombuffer(data, dtype=np.int16)
                print(f"\r🎧 Level: {np.abs(audio_array).mean():.2f}", end="", flush=True)

                # Process every ~10 chunks
                if len(chunk_buffer) >= 10:
                    audio_chunk = b''.join(chunk_buffer)
                    self.process_audio_chunk(audio_chunk)
                    chunk_buffer = []

                    # Optional debug: save audio
                    with wave.open("debug.wav", 'wb') as wf:
                        wf.setnchannels(CHANNELS)
                        wf.setsampwidth(self.p.get_sample_size(FORMAT))
                        wf.setframerate(RATE)
                        wf.writeframes(audio_chunk)

                if self.is_silence(data):
                    self.silence_counter += 1
                    if self.silence_counter >= int(RATE / CHUNK * SILENCE_DURATION):
                        print("\n💤 Silence detected. Stopping...")
                        self.stop_recording()
                        break
                else:
                    self.silence_counter = 0

            except Exception as e:
                print(f"\n❌ Recording error: {e}")
                break

    def stop_recording(self):
        if self.is_recording:
            self.is_recording = False
            if self.recording_thread:
                self.recording_thread.join()
            if self.stream:
                self.stream.stop_stream()
                self.stream.close()

            final_audio = b''.join(self.frames)
            if self.current_speech:
                print(f"\n👤 Final: {self.current_speech}")
                bot_response = self.get_bot_response(self.current_speech)
                self.speak(bot_response)

            # Save final audio
            filename = f"response_q{self.current_question_index}.wav"
            with wave.open(filename, 'wb') as wf:
                wf.setnchannels(CHANNELS)
                wf.setsampwidth(self.p.get_sample_size(FORMAT))
                wf.setframerate(RATE)
                wf.writeframes(final_audio)

            time.sleep(1)
            self.ask_next_question()

    def ask_next_question(self):
        if self.current_question_index < len(self.questions):
            question = self.questions[self.current_question_index]
            self.speak(question)
            self.current_question_index += 1
            time.sleep(0.5)
            self.start_recording()
            return True
        return False

    def cleanup(self):
        self.p.terminate()
        self.engine.stop()

def main():
    bot = InterviewBot()
    print("🤖 Interview Bot ready.")
    print("Press 'x' to exit anytime.\n")
    bot.ask_next_question()

    try:
        while True:
            if keyboard.is_pressed('x'):
                print("\n👋 Exiting Interview.")
                break
            time.sleep(0.1)
    except KeyboardInterrupt:
        print("\n👋 Exiting Interview.")
    finally:
        bot.cleanup()

if __name__ == "__main__":
    main()






