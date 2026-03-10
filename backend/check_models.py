import os
import google.generativeai as genai

api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
if not api_key:
    print("❌ No API key found in environment variables.")
else:
    genai.configure(api_key=api_key)
    print("✅ Successfully connected. Available text models:")
    try:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f" - {m.name}")
    except Exception as e:
        print(f"Error fetching models: {e}")
