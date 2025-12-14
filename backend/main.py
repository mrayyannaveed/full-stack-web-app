import os
from typing import Optional
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException
from sqlmodel import Field, SQLModel, create_engine, Session, select
from fastapi.middleware.cors import CORSMiddleware
from contextlib import contextmanager
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

# Create the engine with proper configuration for async/production use
engine = create_engine(
    DATABASE_URL,
    echo=True,  # Set to False in production
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=300,  # Recycle connections after 5 minutes
)

# Define models
class Todo(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    task: str
    completed: bool = False


class Blog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    content: str
    published: bool = True
    rating: Optional[int] = None


# Pydantic model for input validation
class TodoCreate(SQLModel):
    task: str
    completed: bool = False


# FastAPI app initialization
app = FastAPI(title="To-Do API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # All origins allowed
    allow_credentials=True,
    allow_methods=["*"],  # All HTTP methods
    allow_headers=["*"],  # All headers
)


# Database session dependency with proper error handling
@contextmanager
def get_db_session():
    """Provide a transactional scope around a series of operations."""
    session = Session(engine)
    try:
        yield session
        session.commit()
    except Exception as e:
        session.rollback()
        logger.error(f"Database error: {e}")
        raise
    finally:
        session.close()


def get_session():
    with get_db_session() as session:
        yield session


# Create tables function
def create_db_and_tables():
    try:
        SQLModel.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        raise


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


@app.get("/")
async def root():
    return {"message": "Welcome to the To-Do API"}


@app.get("/todos")
def read_todos(session: Session = Depends(get_session)):
    """Returns list of todos from PostgreSQL database"""
    try:
        todos = session.exec(select(Todo)).all()
        return todos
    except Exception as e:
        logger.error(f"Error fetching todos: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/todos")
def create_todo(todo: TodoCreate, session: Session = Depends(get_session)):
    """Creates new todo in PostgreSQL database"""
    try:
        db_todo = Todo.model_validate(todo)
        session.add(db_todo)
        session.commit()
        session.refresh(db_todo)

        return {
            "message": "Todo created successfully",
            "todo": db_todo
        }
    except Exception as e:
        logger.error(f"Error creating todo: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.put("/todos/{todo_id}")
def update_todo(todo_id: int, todo: Todo, session: Session = Depends(get_session)):
    """Updates todo in PostgreSQL database"""
    try:
        db_todo = session.get(Todo, todo_id)
        if not db_todo:
            raise HTTPException(status_code=404, detail="Todo not found")

        db_todo.task = todo.task
        db_todo.completed = todo.completed

        session.add(db_todo)
        session.commit()
        session.refresh(db_todo)

        return db_todo
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating todo: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: int, session: Session = Depends(get_session)):
    """Deletes todo from PostgreSQL database"""
    try:
        todo = session.get(Todo, todo_id)
        if not todo:
            raise HTTPException(status_code=404, detail="Todo not found")

        session.delete(todo)
        session.commit()

        return {"message": f"Todo {todo_id} deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting todo: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)