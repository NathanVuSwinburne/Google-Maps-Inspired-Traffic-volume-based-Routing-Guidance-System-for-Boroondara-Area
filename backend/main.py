import sys
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

# Add project root to sys.path so `src/` is importable without package restructuring
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from src.core.map_builder import SiteNetwork
from src.core.route_finder import RouteFinder
from backend.services.route_service import RouteService
from backend.routers import network, routes


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load SiteNetwork and RouteFinder once at startup."""
    metadata_path = str(
        PROJECT_ROOT / "processed_data" / "preprocessed_data" / "sites_metadata.json"
    )
    network_obj = SiteNetwork(metadata_path)
    finder = RouteFinder(network_obj)

    app.state.network = network_obj
    app.state.route_service = RouteService(finder)

    print(
        f"[TBRGS] Network loaded: {len(network_obj.sites_data)} sites, "
        f"{len(network_obj.connections)} connections"
    )
    print(f"[TBRGS] Models loaded: {list(finder.model_dataframes.keys())}")

    yield


app = FastAPI(
    title="TBRGS API",
    description="Traffic-Based Route Guidance System — REST API for routing and network data",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(network.router)
app.include_router(routes.router)


@app.get("/api/health", tags=["health"])
def get_health(request: Request):
    network_obj = request.app.state.network
    return {
        "status": "ok",
        "sites": len(network_obj.sites_data),
        "connections": len(network_obj.connections),
    }
