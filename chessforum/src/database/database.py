from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column,relationship
from sqlalchemy import String,ForeignKey
from typing import List,Optional

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

class Users(db.Model):
    __tablename__= "user"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(30), unique=True)
    password: Mapped[str] = mapped_column(String(70))
    email: Mapped[str] = mapped_column(String(30), unique=True)
    
    role_id: Mapped[int] = mapped_column(ForeignKey("role.id"))
    
    roles: Mapped["Roles"] = relationship(back_populates="users")
    posts: Mapped[List["Posts"]] = relationship(back_populates="users")
    comments: Mapped[List["Comments"]] = relationship(back_populates="users")
    
class Roles(db.Model):
    __tablename__ = "role"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(10))
    
    users: Mapped[List["Users"]] = relationship(back_populates="roles")
    
class Posts(db.Model):
    __tablename__ = "post"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(100))
    image: Mapped[str] = mapped_column(String(150))
    
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"))
    subchessit_id: Mapped[int] = mapped_column(ForeignKey("subchessit.id"))
    
    users: Mapped["Users"] = relationship(back_populates="posts")
    subchessits: Mapped["Subchessits"] = relationship(back_populates="posts")
    
    
class Comments(db.Model):
    __tablename__ = "comment"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    text: Mapped[str] = mapped_column(String(1000))
    
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"))
    parent_id: Mapped[Optional[int]] = mapped_column(ForeignKey("comment.id"))
    
    users: Mapped["Users"] = relationship(back_populates="comments")

class Subchessits(db.Model):
    __tablename__ = "subchessit"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(70),unique=True)
    
    posts: Mapped[List["Posts"]] = relationship(back_populates="subchessits")