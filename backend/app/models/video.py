from pydantic import BaseModel, Field
from typing import List, Optional
from bson import ObjectId


class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not isinstance(v, ObjectId):
            raise ValueError("Not a valid ObjectId")
        return str(v)


class VideoMetadata(BaseModel):
    title: str
    description: str
    tags: List[str]
    school: str

class Video(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    filename: str
    metadata: VideoMetadata 

    class Config:
        json_encoders = {ObjectId: str}
        allow_population_by_field_name = True

    def dict(self, *args, **kwargs):
        dict_repr = super().dict(*args, **kwargs)
        # Convert ObjectId to string for JSON serialization
        if "_id" in dict_repr:
            dict_repr["id"] = str(dict_repr.pop("_id"))
        return dict_repr