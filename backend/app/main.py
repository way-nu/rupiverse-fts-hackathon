from fastapi import FastAPI

app = FastAPI(title="Rupiverse API", version="0.1.0")


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "Welcome to the Rupiverse API"}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
