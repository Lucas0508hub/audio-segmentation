from fastapi import FastAPI, HTTPException, Depends, File, UploadFile
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from sqlalchemy import create_engine, Column, String, Float, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, relationship, Session
from jose import JWTError, jwt
from passlib.context import CryptContext
import uuid, os

SECRET_KEY = os.getenv("SECRET_KEY", "supersecret")
ALGORITHM = "HS256"
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, index=True)
    password = Column(String)

Base.metadata.create_all(bind=engine)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def verify_password(plain, hashed): return pwd_context.verify(plain, hashed)
def hash_password(password): return pwd_context.hash(password)
def create_token(data: dict): return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = db.query(User).filter(User.username == username).first()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

class UserCreate(BaseModel):
    username: str
    password: str

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username taken")
    hashed = hash_password(user.password)
    db_user = User(username=user.username, password=hashed)
    db.add(db_user)
    db.commit()
    return {"msg": "User created"}

@app.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form.username).first()
    if not user or not verify_password(form.password, user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    token = create_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}
