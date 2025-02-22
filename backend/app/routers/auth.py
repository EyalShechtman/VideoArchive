from fastapi import APIRouter, HTTPException, Depends, Body
from fastapi.security import OAuth2AuthorizationCodeBearer
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from typing import Optional
import json
import os
from pydantic import BaseModel

router = APIRouter(prefix="/api/auth")

# OAuth 2.0 configuration
SCOPES = [
    'openid',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/drive.file'
]

CLIENT_SECRETS_FILE = "credentials.json"
oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl="https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl="https://oauth2.googleapis.com/token"
)

# Add this class for request validation
class GoogleCallback(BaseModel):
    code: str

@router.get("/google/url")
async def get_authorization_url():
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri="http://localhost:3000/auth/google/callback"
    )
    
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true'
    )
    
    return {"url": authorization_url}

@router.post("/google/callback")
async def callback(data: GoogleCallback):
    try:
        flow = Flow.from_client_secrets_file(
            CLIENT_SECRETS_FILE,
            scopes=SCOPES,
            redirect_uri="http://localhost:3000/auth/google/callback"
        )
        
        flow.fetch_token(code=data.code)
        credentials = flow.credentials

        # Get user info
        service = build('oauth2', 'v2', credentials=credentials)
        user_info = service.userinfo().get().execute()

        # Save credentials for this user
        save_credentials(credentials, user_info['email'])

        return {
            "email": user_info['email'],
            "name": user_info['name'],
            "picture": user_info['picture'],
            "token": credentials.token
        }
    except Exception as e:
        print(f"Auth error: {str(e)}")  # Add debug print
        raise HTTPException(status_code=400, detail=str(e))

def save_credentials(credentials: Credentials, email: str):
    creds_data = {
        'token': credentials.token,
        'refresh_token': credentials.refresh_token,
        'token_uri': credentials.token_uri,
        'client_id': credentials.client_id,
        'client_secret': credentials.client_secret,
        'scopes': credentials.scopes,
        'account': email
    }
    
    os.makedirs('user_credentials', exist_ok=True)
    with open(f'user_credentials/{email}.json', 'w') as f:
        json.dump(creds_data, f) 