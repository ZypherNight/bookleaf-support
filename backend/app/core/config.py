import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "BookLeaf Support API"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-super-secret-key-for-bookleaf-assignment")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

settings = Settings()
