from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import Base, engine, SessionLocal
from app.api.v1.endpoints.maply_api import router as maply_router, seed_initial_database

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    Base.metadata.create_all(bind=engine)
    # Seed default master map and initial assessment if needed
    with SessionLocal() as db:
        seed_initial_database(db)
    yield

app = FastAPI(
    title="Maply API",
    description="Backend API & Deterministic Graph Assessment Engine for Maply",
    version="1.0.0",
    lifespan=lifespan
)

# CORS setup for frontend Next.js communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(maply_router, prefix="/api/v1", tags=["Maply"])

@app.get("/")
def root():
    return {
        "app": "Maply",
        "description": "AI-Assisted Conceptual Understanding Assessment Platform",
        "version": "1.0.0",
        "status": "online"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
