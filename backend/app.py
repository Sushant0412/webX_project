from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# College counselor context prompt
COUNSELOR_CONTEXT = """You are an experienced college student counselor with extensive knowledge of academic programs, 
college admissions, career planning, and student life. Your role is to provide helpful, accurate, and supportive guidance 
to students regarding their college studies, course selections, career paths, and academic challenges. 
Please provide detailed, practical advice while maintaining a professional and empathetic tone."""


@app.route("/api/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        message = data.get("message")

        if not message:
            return jsonify({"error": "Message is required"}), 400

        # Combine counselor context with user's message
        prompt = f"{COUNSELOR_CONTEXT}\n\nStudent: {message}\nCounselor:"

        # Get Gemini model and generate response
        model = genai.GenerativeModel(model_name="gemini-1.5-flash-002")
        response = model.generate_content(prompt)

        return jsonify({"response": response.text})

    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        return jsonify({"error": "Failed to process chat request"}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
