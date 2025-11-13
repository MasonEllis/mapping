from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    entities = relationship("Entity", back_populates="owner", cascade="all, delete-orphan")
    profiles = relationship("MappingProfile", back_populates="owner", cascade="all, delete-orphan")

class Entity(Base):
    __tablename__ = "entities"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    json_data = Column(Text, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    owner = relationship("User", back_populates="entities")
    # Entities can be referenced by multiple profiles
    source_profiles = relationship("MappingProfile", back_populates="source_entity", foreign_keys="MappingProfile.source_entity_id")
    target_profiles = relationship("MappingProfile", back_populates="target_entity", foreign_keys="MappingProfile.target_entity_id")

class MappingProfile(Base):
    __tablename__ = "mapping_profiles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    source_entity_id = Column(Integer, ForeignKey("entities.id"), nullable=False, index=True)
    target_entity_id = Column(Integer, ForeignKey("entities.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    owner = relationship("User", back_populates="profiles")
    source_entity = relationship("Entity", back_populates="source_profiles", foreign_keys=[source_entity_id])
    target_entity = relationship("Entity", back_populates="target_profiles", foreign_keys=[target_entity_id])
    pairs = relationship("MappingPair", back_populates="profile", cascade="all, delete-orphan")

class MappingPair(Base):
    __tablename__ = "mapping_pairs"
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("mapping_profiles.id"), nullable=False, index=True)
    source_path = Column(String(512), nullable=False)
    target_path = Column(String(512), nullable=False)
    transform_expr = Column(String(512), nullable=True)
    order_index = Column(Integer, nullable=True)

    profile = relationship("MappingProfile", back_populates="pairs")
