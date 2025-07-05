'''
+-------------------+        +-----------------------+        +------------------+        +------------------------+
|   Step 1: Install |        |  Step 2: Real-Time    |        |  Step 3: Pass    |        |  Step 4: Live Audio    |
|   Python Libraries|        |  Transcription with   |        |  Real-Time       |        |  Stream from ElevenLabs|
+-------------------+        |       AssemblyAI      |        |  Transcript to   |        |                        |
|                   |        +-----------------------+        |      OpenAI      |        +------------------------+
| - assemblyai      |                    |                    +------------------+                    |
| - openai          |                    |                             |                              |
| - elevenlabs      |                    v                             v                              v
| - mpv             |        +-----------------------+        +------------------+        +------------------------+
| - portaudio       |        |                       |        |                  |        |                        |
+-------------------+        |  AssemblyAI performs  |-------->  OpenAI generates|-------->  ElevenLabs streams   |
                             |  real-time speech-to- |        |  response based  |        |  response as live      |
                             |  text transcription   |        |  on transcription|        |  audio to the user     |
                             |                       |        |                  |        |                        |
                             +-----------------------+        +------------------+        +------------------------+

###### Step 1: Install Python libraries ######



brew install portaudio
pip install "assemblyai[extras]"
pip install elevenlabs==0.3.0b0
brew install mpv
pip install --upgrade openai
'''

import assemblyai as aai
from elevenlabs import generate, stream, voices
from openai import OpenAI

class AI_Assistant:
    def __init__(self):
        aai.settings.api_key = "1973b816236541e79ab03f6153267ef5"
        self.openai_client = OpenAI(api_key = "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")
        self.elevenlabs_api_key = "sk_5fc5ff5a62fbe23a5c4d1c6c773beaf5d91ee4c6c55e798e"
        
        # Get available voices
        available_voices = voices()
        self.voice_id = available_voices[0].voice_id  # Use the first available voice

        self.transcriber = None

        # Prompt
        self.full_transcript = [
            {"role":"system", "content":"You are a receptionist at a dental clinic. Be resourceful and efficient."},
        ]

###### Step 2: Real-Time Transcription with AssemblyAI ######
        
    def start_transcription(self):
        self.transcriber = aai.RealtimeTranscriber(
            sample_rate = 16000,
            on_data = self.on_data,
            on_error = self.on_error,
            on_open = self.on_open,
            on_close = self.on_close,
            end_utterance_silence_threshold = 1000
        )

        self.transcriber.connect()
        microphone_stream = aai.extras.MicrophoneStream(sample_rate =16000)
        self.transcriber.stream(microphone_stream)
    
    def stop_transcription(self):
        if self.transcriber:
            self.transcriber.close()
            self.transcriber = None

    def on_open(self, session_opened: aai.RealtimeSessionOpened):
        print("Session ID:", session_opened.session_id)
        return


    def on_data(self, transcript: aai.RealtimeTranscript):
        if not transcript.text:
            return

        if isinstance(transcript, aai.RealtimeFinalTranscript):
            self.generate_ai_response(transcript)
        else:
            print(transcript.text, end="\r")


    def on_error(self, error: aai.RealtimeError):
        print("An error occured:", error)
        return


    def on_close(self):
        #print("Closing Session")
        return

###### Step 3: Pass real-time transcript to OpenAI ######
    
    def generate_ai_response(self, transcript):

        self.stop_transcription()

        self.full_transcript.append({"role":"user", "content": transcript.text})
        print(f"\nPatient: {transcript.text}", end="\r\n")

        response = self.openai_client.chat.completions.create(
            model = "gpt-3.5-turbo",
            messages = self.full_transcript
        )

        ai_response = response.choices[0].message.content

        self.generate_audio(ai_response)

        self.start_transcription()
        print(f"\nReal-time transcription: ", end="\r\n")


###### Step 4: Generate audio with ElevenLabs ######
        
    def generate_audio(self, text):

        self.full_transcript.append({"role":"assistant", "content": text})
        print(f"\nAI Receptionist: {text}")

        audio_stream = generate(
            text = text,
            voice = self.voice_id,
            api_key = self.elevenlabs_api_key,
            stream = True
        )

        stream(audio_stream)

greeting = "Thank you for calling Vancouver dental clinic. My name is Sandy, how may I assist you?"
ai_assistant = AI_Assistant()
ai_assistant.generate_audio(greeting)
ai_assistant.start_transcription()

def main():
    greeting = "Thank you for calling Vancouver dental clinic. My name is Sandy, how may I assist you?"
    ai_assistant = AI_Assistant()
    ai_assistant.generate_audio(greeting)
    
    while True:
        try:
            user_input = input("\nYou: ")
            if user_input.lower() in ['quit', 'exit', 'bye']:
                print("Goodbye!")
                break
            ai_assistant.generate_ai_response(user_input)
        except KeyboardInterrupt:
            print("\nGoodbye!")
            break

if __name__ == "__main__":
    main()

        





    



    