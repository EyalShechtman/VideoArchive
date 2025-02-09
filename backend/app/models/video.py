from pydantic import BaseModel
from typing import List

class VideoMetadata(BaseModel):
    title: str
    description: str
    tags: List[str]
    school: str

class Video(BaseModel):
    id: str
    filename: str
    metadata: VideoMetadata 