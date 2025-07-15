import speech_recognition as sr
import pyttsx3

# Initialize recognizer and TTS engine
recognizer = sr.Recognizer()
engine = pyttsx3.init()

# Optional: Change voice properties
engine.setProperty('rate', 150)  # speed
engine.setProperty('volume', 1.0)  # max volume

def speak(text):
    engine.say(text)
    engine.runAndWait()

def listen():
    with sr.Microphone() as source:
        print("🎙️ Listening...")
        recognizer.adjust_for_ambient_noise(source, duration=1)
        audio = recognizer.listen(source)
    try:
        print("🧠 Recognizing...")
        command = recognizer.recognize_google(audio)
        print(f"🗣️ You said: {command}")
        return command.lower()
    except sr.UnknownValueError:
        speak("Sorry, I didn't catch that.")
        return ""
    except sr.RequestError:
        speak("Sorry, the service is down.")
        return ""

# Main interaction loop
while True:
    user_input = listen()

    if "hello" in user_input:
        speak("Hello! How can I help you today?")
    elif "your name" in user_input:
        speak("I'm your Python voice assistant!")
    elif "stop" in user_input or "exit" in user_input:
        speak("Goodbye!")
        break
    elif user_input:
        speak("You said " + user_input)







