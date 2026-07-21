from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column,relationship
from sqlalchemy import String,ForeignKey,Text
from typing import List,Optional

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

class Users(db.Model):
    __tablename__= "user"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(70),nullable=False)
    email: Mapped[str] = mapped_column(String(30), unique=True,nullable=False)
    
    role_id: Mapped[int] = mapped_column(ForeignKey("role.id"),nullable=False)
    
    roles: Mapped["Roles"] = relationship(back_populates="users")

    #cascade -> when user is deleted, posts and comments are too
    posts: Mapped[List["Posts"]] = relationship(back_populates="users",cascade="all, delete-orphan") 
    comments: Mapped[List["Comments"]] = relationship(back_populates="users",cascade="all, delete-orphan")
    
class Roles(db.Model):
    __tablename__ = "role"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(10), nullable=False)
    
    users: Mapped[List["Users"]] = relationship(back_populates="roles")
    
class Posts(db.Model):
    __tablename__ = "post"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(100),nullable=False)
    image: Mapped[str] = mapped_column(String(150), nullable=True) #for now, posts wont have images
    description: Mapped[str] = mapped_column(Text, nullable=False)
    
    #when a post is added, upvotes and downvotes take 0 as a value
    upvotes: Mapped[int] = mapped_column(default=0,server_default='0')
    downvotes: Mapped[int] = mapped_column(default=0, server_default='0') 
        
        
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"),nullable=False)
    subchessit_id: Mapped[int] = mapped_column(ForeignKey("subchessit.id", ondelete="CASCADE"), nullable=False)
    
    users: Mapped["Users"] = relationship(back_populates="posts")
    subchessits: Mapped["Subchessits"] = relationship(back_populates="posts")
    comments: Mapped[List["Comments"]] = relationship(back_populates="posts", cascade="all, delete-orphan")

class Comments(db.Model):
    __tablename__ = "comment"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    
    upvotes: Mapped[int] = mapped_column(default=0,server_default='0')
    downvotes: Mapped[int] = mapped_column(default=0, server_default='0') 
    
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    post_id: Mapped[int] = mapped_column(ForeignKey("post.id", ondelete="CASCADE"), nullable=False)   
    parent_id: Mapped[Optional[int]] = mapped_column(ForeignKey("comment.id", ondelete="CASCADE"), nullable=True)
    
    users: Mapped["Users"] = relationship(back_populates="comments")
    posts: Mapped["Posts"] = relationship(back_populates="comments") 
    
class Subchessits(db.Model):
    __tablename__ = "subchessit"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(70),unique=True,nullable=False)
    description: Mapped[str] = mapped_column(Text,nullable=False)
    
    posts: Mapped[List["Posts"]] = relationship(back_populates="subchessits", cascade="all, delete-orphan")