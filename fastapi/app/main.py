from fastapi import FastAPI
from .routers import basic, gis

# Create FastAPI app
app = FastAPI(
    title="FastAPI GIS Example",
    description="A simple FastAPI application with basic & geospatial endpoints.",
    version="1.0.0"
)

# Include routers
app.include_router(basic.router, prefix="/basic", tags=["basic"])
app.include_router(gis.router, prefix="/gis", tags=["gis"])

# Root endpoint
@app.get("/")
def read_root():
    """
    Welcome endpoint.
    """
    return {"message": "Welcome to the FastAPI GIS Example!"}
