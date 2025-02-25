from fastapi import APIRouter, UploadFile, File, Form, HTTPException  # No change
import os
import zipfile  # ✅ Added to handle ZIP files
import uuid
import json
from typing import List
from ..models.video import VideoMetadata, Video  # No change
from ..database import db
import shutil  # Add this import at the top
from bson import ObjectId

router = APIRouter(prefix="/api/videos")

UPLOAD_DIR = "uploads"
METADATA_FILE = "uploads/metadata.json"

# Helper function to load metadata (No changes)
def load_metadata():
    if os.path.exists(METADATA_FILE):
        with open(METADATA_FILE, 'r') as f:
            return json.load(f)
    return []

# Helper function to save metadata (No changes)
def save_metadata(videos):
    os.makedirs(os.path.dirname(METADATA_FILE), exist_ok=True)
    with open(METADATA_FILE, 'w') as f:
        json.dump(videos, f, indent=4)
    print("Saved metadata:", videos)  # Debug print

@router.post("/upload")
async def upload_video(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: str = Form(...),
    tags: str = Form(...),
    school: str = Form(...)
):
    try:
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        
        print(f"Received file: {file.filename}, Content-Type: {file.content_type}")

        file_extension = os.path.splitext(file.filename)[1].lower()
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        uploaded_files = []

        # Save the uploaded file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)

        tags_list = [tag.strip() for tag in tags.split(',') if tag.strip()]
        videos_to_save = []

        if file_extension == ".zip":
            try:
                extract_folder = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}_extracted")
                os.makedirs(extract_folder, exist_ok=True)

                with zipfile.ZipFile(file_path, "r") as zip_ref:
                    zip_ref.extractall(extract_folder)

                # Process video files from ZIP
                video_extensions = (".mp4", ".avi", ".mov", ".mkv", ".webm")
                for root, _, files in os.walk(extract_folder):
                    for file in files:
                        if file.lower().endswith(video_extensions):
                            original_path = os.path.join(root, file)
                            new_filename = f"{uuid.uuid4()}{os.path.splitext(file)[1]}"
                            new_path = os.path.join(UPLOAD_DIR, new_filename)
                            
                            shutil.move(original_path, new_path)
                            uploaded_files.append(new_filename)

                            video_metadata = {
                                "filename": new_filename,
                                "metadata": {
                                    "title": f"{title} - {os.path.splitext(file)[0]}",
                                    "description": description,
                                    "tags": tags_list,
                                    "school": school,
                                }
                            }
                            videos_to_save.append(video_metadata)

                # Cleanup ZIP and extraction folder
                os.remove(file_path)
                shutil.rmtree(extract_folder)

            except zipfile.BadZipFile:
                raise HTTPException(status_code=400, detail="Invalid ZIP file")
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Error processing ZIP: {str(e)}")
        else:
            # Single video file
            uploaded_files.append(unique_filename)
            videos_to_save.append({
                "filename": unique_filename,
                "metadata": {
                    "title": title,
                    "description": description,
                    "tags": tags_list,
                    "school": school,
                }
            })

        # Save to MongoDB and collect responses
        saved_videos = []
        for video_metadata in videos_to_save:
            result = await db.videos.insert_one(video_metadata)
            video_metadata["_id"] = str(result.inserted_id)
            saved_videos.append(video_metadata)

        return {
            "status": "success",
            "message": "Upload successful",
            "uploaded_files": uploaded_files,
            "videos": saved_videos
        }

    except Exception as e:
        print(f"Upload error: {str(e)}")
        # Cleanup on error
        if os.path.exists(file_path):
            os.remove(file_path)
        if 'extract_folder' in locals() and os.path.exists(extract_folder):
            shutil.rmtree(extract_folder)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/delete")
async def delete_video(video_id: str = Form(...)):
    try:
        # Delete from MongoDB
        result = await db.videos.delete_one({"_id": ObjectId(video_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Video not found")
        
        # Also delete the file from uploads directory
        videos = await db.videos.find_one({"_id": ObjectId(video_id)})
        if videos and "filename" in videos:
            file_path = os.path.join(UPLOAD_DIR, videos["filename"])
            if os.path.exists(file_path):
                os.remove(file_path)
        
        return {"message": "Video deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("")
async def get_videos():
    try:
        # Fetch videos from MongoDB
        cursor = db.videos.find()
        videos = []
        async for doc in cursor:
            # Convert ObjectId to string
            doc["_id"] = str(doc["_id"])
            videos.append(doc)
        return videos
    except Exception as e:
        print(f"Error fetching videos: {str(e)}")
        return []