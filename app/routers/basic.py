from fastapi import APIRouter

router = APIRouter()

@router.get("/hello")
def say_hello():
    """
    A simple basic endpoint that returns a greeting.
    """
    return {"greeting": "Hello from the basic router!"}

@router.post("/echo")
def echo_message(message: str):
    """
    A simple POST endpoint that echoes back a message.
    """
    return {"echoed_message": message}
