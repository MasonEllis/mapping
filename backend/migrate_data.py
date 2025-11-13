#!/usr/bin/env python3
"""
Data migration script to separate entities from mapping profiles.

This script:
1. Creates entities from existing source_json and target_json in mapping profiles
2. Updates mapping profiles to reference entity IDs
3. Removes the old JSON columns
"""

import os
import sys
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

# Add the current directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import Base, engine as new_engine
from app.models import User, MappingProfile, MappingPair, Entity

def create_legacy_models():
    """Create models for the old schema to read existing data"""
    LegacyBase = declarative_base()

    class LegacyUser(LegacyBase):
        __tablename__ = "users"
        id = Column(Integer, primary_key=True, index=True)
        email = Column(String(255), unique=True, index=True, nullable=False)
        password_hash = Column(String(255), nullable=False)
        created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

        profiles = relationship("LegacyMappingProfile", back_populates="owner", cascade="all, delete-orphan")

    class LegacyMappingProfile(LegacyBase):
        __tablename__ = "mapping_profiles"
        id = Column(Integer, primary_key=True, index=True)
        name = Column(String(255), nullable=False)
        description = Column(Text, nullable=True)
        owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
        source_json = Column(Text, nullable=False)  # This will be removed
        target_json = Column(Text, nullable=False)  # This will be removed
        created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
        updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

        owner = relationship("LegacyUser", back_populates="profiles")
        pairs = relationship("LegacyMappingPair", back_populates="profile", cascade="all, delete-orphan")

    class LegacyMappingPair(LegacyBase):
        __tablename__ = "mapping_pairs"
        id = Column(Integer, primary_key=True, index=True)
        profile_id = Column(Integer, ForeignKey("mapping_profiles.id"), nullable=False, index=True)
        source_path = Column(String(512), nullable=False)
        target_path = Column(String(512), nullable=False)
        transform_expr = Column(String(512), nullable=True)
        order_index = Column(Integer, nullable=True)

        profile = relationship("LegacyMappingProfile", back_populates="pairs")

    return LegacyUser, LegacyMappingProfile, LegacyMappingPair

def migrate_data():
    """Perform the data migration"""
    print("Starting data migration...")

    # Create database URL from environment variables
    db_user = os.getenv("DB_USER", "root")
    db_password = os.getenv("DB_PASSWORD", "root")
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = os.getenv("DB_PORT", "3306")
    db_name = os.getenv("DB_NAME", "mappings")

    database_url = f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"

    # Create engine for existing database
    engine = create_engine(database_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    # Create legacy models
    LegacyUser, LegacyMappingProfile, LegacyMappingPair = create_legacy_models()

    # Create session
    db = SessionLocal()

    try:
        # Create the new entities table first
        print("Creating entities table...")
        Base.metadata.create_all(bind=engine, tables=[Entity.__table__])

        # Get all existing profiles
        profiles = db.query(LegacyMappingProfile).all()
        print(f"Found {len(profiles)} mapping profiles to migrate")

        entity_counter = 1

        for profile in profiles:
            print(f"Migrating profile: {profile.name}")

            # Create source entity
            source_entity = Entity(
                name=f"{profile.name} - Source",
                description=f"Source entity for mapping profile: {profile.name}",
                entity_type="source",
                json_data=profile.source_json,
                owner_id=profile.owner_id,
                created_at=profile.created_at,
                updated_at=profile.updated_at
            )
            db.add(source_entity)
            db.flush()  # Get the ID
            source_entity_id = source_entity.id

            # Create target entity
            target_entity = Entity(
                name=f"{profile.name} - Target",
                description=f"Target entity for mapping profile: {profile.name}",
                entity_type="target",
                json_data=profile.target_json,
                owner_id=profile.owner_id,
                created_at=profile.created_at,
                updated_at=profile.updated_at
            )
            db.add(target_entity)
            db.flush()  # Get the ID
            target_entity_id = target_entity.id

            # Update profile to reference entities
            profile.source_entity_id = source_entity_id
            profile.target_entity_id = target_entity_id

        entity_counter += 2

    # Drop the entity_type column from entities table if it exists
    print("Dropping entity_type column from entities table...")
    try:
        db.execute("ALTER TABLE entities DROP COLUMN entity_type")
        db.commit()
        print("Successfully dropped entity_type column")
    except Exception as e:
        print(f"Warning: Could not drop entity_type column: {e}")
        print("You may need to manually drop the entity_type column from entities table")

        # Commit all changes
        db.commit()
        print(f"Created {entity_counter - 1} entities")

        # Now drop the old columns (this is a destructive operation)
        print("Dropping old JSON columns...")
        try:
            # Use raw SQL to drop columns
            db.execute("ALTER TABLE mapping_profiles DROP COLUMN source_json")
            db.execute("ALTER TABLE mapping_profiles DROP COLUMN target_json")
            db.commit()
            print("Migration completed successfully!")
        except Exception as e:
            print(f"Warning: Could not drop old columns: {e}")
            print("You may need to manually drop the source_json and target_json columns from mapping_profiles table")

    except Exception as e:
        db.rollback()
        print(f"Migration failed: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    migrate_data()
