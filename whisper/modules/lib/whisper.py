import requests
import os

def call(file_obj, filename="audio.mp3"):
    url = "https://transcribe.whisperapi.com"
    headers = {
        'Authorization': f'Bearer {os.environ.get("WHISPER_API_KEY")}'
    }
    data = {
        "fileType": "mp3",
        "diarization": "false",
        "numSpeakers": "2",
        "language": "ja",
        "task": "transcribe"
    }

    # file_obj（BytesIO）を直接送信
    response = requests.post(
        url,
        headers=headers,
        files={'file': (filename, file_obj, 'audio/mpeg')},
        data=data
    )

    return response.json()
