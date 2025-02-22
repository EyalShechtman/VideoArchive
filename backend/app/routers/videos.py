from fastapi import APIRouter, UploadFile, File, Form, HTTPException  # No change
import os
import zipfile  # ✅ Added to handle ZIP files
import uuid
import json
from typing import List
from ..models.video import VideoMetadata  # No change
import shutil  # Add this import at the top

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
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    print(f"Received file: {file.filename}, Content-Type: {file.content_type}")

    file_extension = os.path.splitext(file.filename)[1].lower()
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
        print(f"Saved file to: {file_path}")

    extracted_files = []

    try:
        if file_extension == ".zip":
            print(f"Processing ZIP file: {file_path}")
            extract_folder = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}_extracted")
            os.makedirs(extract_folder, exist_ok=True)

            try:
                with zipfile.ZipFile(file_path, "r") as zip_ref:
                    zip_contents = zip_ref.namelist()
                    print(f"ZIP contents: {zip_contents}")
                    zip_ref.extractall(extract_folder)

                # Walk through all subdirectories to find video files
                video_extensions = (".mp4", ".avi", ".mov", ".mkv", ".webm")
                for root, _, files in os.walk(extract_folder):
                    for file in files:
                        if file.lower().endswith(video_extensions):
                            full_path = os.path.join(root, file)
                            extracted_files.append((file, full_path))
                
                print(f"Found video files: {[f[0] for f in extracted_files]}")

                # Move extracted video files to the main uploads folder
                processed_files = []
                for original_name, full_path in extracted_files:
                    try:
                        new_filename = f"{uuid.uuid4()}{os.path.splitext(original_name)[1]}"
                        new_path = os.path.join(UPLOAD_DIR, new_filename)
                        shutil.move(full_path, new_path)  # Using shutil.move instead of os.rename
                        processed_files.append((original_name, new_filename))
                        print(f"Moved {original_name} to {new_filename}")
                    except Exception as e:
                        print(f"Error moving file {original_name}: {str(e)}")
                        continue

                extracted_files = processed_files

            except zipfile.BadZipFile:
                print("Bad ZIP file received")
                raise HTTPException(status_code=400, detail="Invalid ZIP file")
            finally:
                # Cleanup
                if os.path.exists(file_path):
                    os.remove(file_path)
                if os.path.exists(extract_folder):
                    shutil.rmtree(extract_folder, ignore_errors=True)

        # Generate metadata for uploaded or extracted files
        tags_list = [tag.strip() for tag in tags.split(',') if tag.strip()]
        videos = load_metadata()

        if file_extension == ".zip" and extracted_files:
            # Create metadata entries for each extracted video
            for original_name, new_filename in extracted_files:
                video_id = str(uuid.uuid4())
                video_metadata = {
                    "id": video_id,
                    "filename": new_filename,
                    "metadata": {
                        "title": f"{title} - {os.path.splitext(original_name)[0]}",
                        "description": description,
                        "tags": tags_list,
                        "school": school,
                    }
                }
                videos.append(video_metadata)
                print(f"Added metadata for {original_name} as {new_filename}")
        else:
            # Regular video upload metadata
            video_id = str(uuid.uuid4())
            video_metadata = {
                "id": video_id,
                "filename": unique_filename,
                "metadata": {
                    "title": title,
                    "description": description,
                    "tags": tags_list,
                    "school": school,
                }
            }
            videos.append(video_metadata)

        save_metadata(videos)

        return {
            "message": "Upload successful",
            "uploaded_files": [f[1] for f in extracted_files] if extracted_files else [unique_filename]
        }

    except Exception as e:
        print(f"Error processing upload: {str(e)}")
        # Cleanup on error
        if file_extension == ".zip":
            shutil.rmtree(extract_folder, ignore_errors=True)
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))
    

@router.post("/delete")
async def delete_video(
    video_id: str = Form(...)
):
    videos = load_metadata()
    videos = [video for video in videos if video["id"] != video_id]
    save_metadata(videos)
    return {"message": "Video deleted successfully"}

@router.get("")
async def get_videos():
    videos = load_metadata()
    print("Loaded videos:", videos)
    return videos if videos else []