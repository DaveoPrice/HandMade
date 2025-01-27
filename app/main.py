from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
# 1) Local Imports
from .routers import basic, gis
from .database import SessionLocal, engine
from . import models

# 2) Create all tables (for quick setups, not recommended in production)
models.Base.metadata.create_all(bind=engine)

# 3) Database Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 4) FastAPI Application
app = FastAPI(
    title="FastAPI GIS Example",
    description="A simple FastAPI application with basic & geospatial endpoints.",
    version="1.0.0"
)

# Serve the GeoJSON file
@app.get("/geojson/")
def get_geojson():
    """
    Serve the county boundary GeoJSON file.
    """
    file_path = os.path.join("data", "county_boundary.geojson")
    return FileResponse(file_path)

# 5) Routers
app.include_router(basic.router, prefix="/basic", tags=["basic"])
app.include_router(gis.router, prefix="/gis", tags=["gis"])

# 6) Root Endpoint
@app.get("/")
def read_root():
    """
    Welcome endpoint.
    """
    return {"message": "Welcome to the FastAPI GIS Example!"}

# 7) Example Users Endpoint
@app.get("/users/")
def read_users(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return users

templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
def read_map():
    """
    Display the map page.
    """
    return templates.TemplateResponse("map.html", {"request": {}})