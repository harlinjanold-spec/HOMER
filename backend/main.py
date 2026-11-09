import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware

from backend.database.connection import engine, Base
from backend.database.seed_data import seed_database
from backend.api.websocket_manager import ws_manager
from backend.api.routers import (
    patients,
    devices,
    telemetry,
    digital_twin,
    ai_risk,
    alerts,
    caregivers,
    commands,
    reliability,
    scenarios,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("ward_zero")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist and seed demo data
    logger.info("Initializing Ward Zero Database...")
    Base.metadata.create_all(bind=engine)
    seed_database()
    logger.info("Ward Zero Backend initialized successfully.")
    yield
    logger.info("Shutting down Ward Zero Backend...")


app = FastAPI(
    title="Ward Zero Virtual Hospital Backend",
    description="Centralized Healthcare Technology API & Bidirectional Telemetry Engine for Operation Ward Zero",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration allowing both frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(patients.router)
app.include_router(devices.router)
app.include_router(telemetry.router)
app.include_router(digital_twin.router)
app.include_router(ai_risk.router)
app.include_router(alerts.router)
app.include_router(caregivers.router)
app.include_router(commands.router)
app.include_router(reliability.router)
app.include_router(scenarios.router)


@app.get("/")
def root():
    return {
        "system": "Ward Zero - Intelligent Virtual Home Hospital",
        "status": "online",
        "version": "1.0.0",
        "documentation": "/docs",
        "apps": {
            "app1_simulator": "http://localhost:5173",
            "app2_command_centre": "http://localhost:5174",
        },
    }


@app.get("/health")
def health():
    return {"status": "healthy", "service": "ward-zero-backend"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, client: str = Query("unknown")):
    """Bi-directional WebSocket endpoint connecting App 1 (Simulator) and App 2 (Command Centre)."""
    await ws_manager.connect(websocket, client)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle client incoming messages or heartbeats if any
            logger.debug(f"Received WS message from {client}: {data}")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error for {client}: {e}")
        ws_manager.disconnect(websocket)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)

