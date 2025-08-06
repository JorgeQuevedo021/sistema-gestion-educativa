from fastapi import FastAPI
from api.api import router as api_router

app = FastAPI()

app.include_router(api_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Educational Management System"}