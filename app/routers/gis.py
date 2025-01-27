from fastapi import APIRouter

router = APIRouter()

@router.get("/test")
def gis_test():
    return {"message": "Hello from the GIS router!"}
