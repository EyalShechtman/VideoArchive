from fastapi import APIRouter, UploadFile, File, Form
from typing import List
import json
import os
import uuid
from ..models.video import VideoMetadata, Video

router = APIRouter(prefix="/api/videos")

UPLOAD_DIR = "uploads"
METADATA_FILE = "uploads/metadata.json"

# Helper function to load metadata
def load_metadata():
    if os.path.exists(METADATA_FILE):
        with open(METADATA_FILE, 'r') as f:
            return json.load(f)
    return []

# Helper function to save metadata
def save_metadata(videos):
    os.makedirs(os.path.dirname(METADATA_FILE), exist_ok=True)
    with open(METADATA_FILE, 'w') as f:
        json.dump(videos, f)

@router.post("/upload")
async def upload_video(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: str = Form(...),
    tags: str = Form(...),
    school: str = Form(...)
):
    # Create uploads directory if it doesn't exist
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save the file
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Create video metadata
    video_id = str(uuid.uuid4())
    tags_list = [tag.strip() for tag in tags.split(',') if tag.strip()]
    
    video = {
        "id": video_id,
        "filename": unique_filename,
        "metadata": {
            "title": title,
            "description": description,
            "tags": tags_list,
            "school": school
        }
    }
    
    # Load existing metadata and append new video
    videos = load_metadata()
    videos.append(video)
    save_metadata(videos)
    
    return video

@router.get("/")
async def get_videos():
    return load_metadata() 