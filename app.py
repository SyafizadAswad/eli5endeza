from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

app = Flask(__name__)
CORS(app, supports_credentials=True)

# Replace with your actual API key (ideally, load from an environment variable)
GOOGLE_API_KEY = "AIzaSyA6mvlg2-e5yGWY1waUD8k-5ZaUupzp1LE"

@app.route('/ask', methods=['POST'])
def ask_gemini():
    data = request.get_json()
    question = data.get('question')
    language = data.get('language')

    if not question:
        return jsonify({'error': 'No question provided'}), 400

    genai.configure(api_key=GOOGLE_API_KEY)
    try:
        client = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"Explain this electrical and electronics concept like I'm 5(though don't explicitly tell them they're 5 years old), but in {language}. Don't forget to also link to any reference resources that you find relating to the question(no need to explicitly mention that the references aren't geared towards 5 years old, give links if possible). Also explicitly mention if the question doesn't really relate to Electrical and Electronics, and only answer what it is in a super short answer.: {question}"
        response = client.generate_content(prompt)
        explanation = response.text
        return jsonify({'explanation': explanation})
    except Exception as e:
        print("Gemini Error:", str(e))
        return jsonify({'error': 'Gemini API failed'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) # Run Flask on port 5000