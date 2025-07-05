import speech_recognition as sr
import pyttsx3
import random

# Initialize recognizer and TTS engine
recognizer = sr.Recognizer()
recognizer.pause_threshold = 2.0
engine = pyttsx3.init()
engine.setProperty('rate', 150)
engine.setProperty('volume', 1.0)

# Sample interview questions for freshers
interview_questions = [
    "Can you introduce yourself?",
    "Why do you want to work with us?",
    "What are your strengths and weaknesses?",
    "Tell me about a project you worked on.",
    "What programming languages are you comfortable with?",
    "Where do you see yourself in 5 years?",
    "Explain the difference between procedural and object-oriented programming.",
    "What is a database? Can you name a few types?",
    "What is version control, and why is it important?",
    "How do you keep yourself updated with new technologies?"
]

def speak(text):
    print(f"🤖 Interview Bot: {text}")
    engine.say(text)
    engine.runAndWait()

def listen(timeout=5):
    with sr.Microphone() as source:
        print("\n🎙️ Listening...")
        recognizer.adjust_for_ambient_noise(source, duration=1)
        try:
            audio = recognizer.listen(source, timeout=timeout)
        except sr.WaitTimeoutError:
            print("⏱️ Timeout: No speech detected.")
            return ""

    try:
        print("🧠 Recognizing...")
        command = recognizer.recognize_google(audio)
        print(f"🗣️ You said: {command}")
        return command.lower()
    except sr.UnknownValueError:
        print("❌ Could not understand the audio.")
        return ""
    except sr.RequestError:
        print("❌ Recognition service error.")
        return ""

# Main loop
while True:
    user_input = listen()

    if not user_input:
        continue

    if "exit" in user_input or "stop" in user_input:
        speak("Thank you! Best of luck for your interviews.")
        break

    # Display user's spoken input (no speaking back)
    print(f"📝 You: {user_input}")

    # Ask an interview question
    question = random.choice(interview_questions)
    speak(question)
