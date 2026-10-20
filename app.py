"""
AgriSense Application Entrypoint
Compatible with Hugging Face Spaces (Gradio / FastAPI) and Cloud Deployment (Render / Railway / Koyeb).
"""
import os
import uvicorn

try:
    import gradio as gr
    from backend.main import app as fastapi_app

    # When deployed on Hugging Face Spaces with Gradio SDK (Free 16GB RAM)
    with gr.Blocks(title="AgriSense AI API Server") as demo:
        gr.Markdown("# 🌿 AgriSense AI Precision Agriculture Server")
        gr.Markdown(
            "Welcome! The AgriSense Deep Learning & Multi-Tool Agent backend is running live.\n\n"
            "### Available REST Endpoints for Frontend:\n"
            "- **System Health**: `/api/health`\n"
            "- **Weather & Disease Risk Advisory**: `/api/weather`\n"
            "- **Leaf Disease Classification**: `/api/detect`\n"
            "- **Autonomous RAG Agent**: `/api/chat`\n"
            "- **Crop Knowledge Base**: `/api/knowledge-base`\n"
            "- **Interactive Swagger Docs**: `/docs`\n"
        )
        status_banner = gr.Textbox(
            value="Status: Ready & Processing Requests",
            label="Server Status",
            interactive=False
        )

    # Mount FastAPI onto Gradio to expose all /api/... endpoints at root
    app = gr.mount_gradio_app(fastapi_app, demo, path="/")

except ImportError:
    # Direct FastAPI fallback if Gradio is not installed
    from backend.main import app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run("app:app", host="0.0.0.0", port=port)
