from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Example: PostgreSQL Database URL
# Typically: "postgresql://user:password@localhost:5432/dbname"
# For SQLite, something like: "sqlite:///./sql_app.db"
DATABASE_URL = "postgresql://postgres:Swansea@localhost:5432/gisdb"

# 1) Create the engine
engine = create_engine(
    DATABASE_URL,
    # echo=True  # Enable for verbose SQL logging (helpful in dev, not prod)
)

# 2) Create a configured "SessionLocal" class
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# 3) Base class for all models
Base = declarative_base()
