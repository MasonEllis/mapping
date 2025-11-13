from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from .database import Base, engine, get_db
from . import models, schemas
from .auth import router as auth_router, get_current_user
from .crud import (
    list_entities, get_entity, create_entity, update_entity, delete_entity,
    list_profiles, get_profile, create_profile, update_profile, delete_profile
)
from .utils.json_utils import parse_json_str, extract_paths

app = FastAPI(title="Object Mapping Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)


@app.on_event("startup")
def on_startup():
    # Retry database connection on startup
    import time
    max_retries = 30
    retry_count = 0

    while retry_count < max_retries:
        try:
            Base.metadata.create_all(bind=engine)
            print("Database tables created successfully")
            return
        except Exception as e:
            retry_count += 1
            print(f"Database connection failed (attempt {retry_count}/{max_retries}): {e}")
            if retry_count < max_retries:
                time.sleep(2)
            else:
                print("Failed to connect to database after all retries")
                raise e


@app.get("/health")
def health():
    return {"status": "ok"}


# JSON utilities
@app.post("/json/validate")
def json_validate(payload: dict):
    json_text = payload.get("json")
    if json_text is None:
        raise HTTPException(status_code=400, detail="Missing 'json' field")
    try:
        obj = parse_json_str(json_text)
        return {"valid": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/json/paths")
def json_paths(payload: dict):
    source = payload.get("source_json")
    target = payload.get("target_json")
    if source is None or target is None:
        raise HTTPException(status_code=400, detail="Missing 'source_json' or 'target_json'")
    try:
        src_obj = parse_json_str(source)
        tgt_obj = parse_json_str(target)
        return {"source_paths": extract_paths(src_obj), "target_paths": extract_paths(tgt_obj)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/json/paths-by-entities", response_model=schemas.PathsByEntitiesResponse)
def json_paths_by_entities(payload: schemas.PathsByEntitiesRequest, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    try:
        source_entity = get_entity(db, payload.source_entity_id, user.id)
        target_entity = get_entity(db, payload.target_entity_id, user.id)

        if not source_entity:
            raise HTTPException(status_code=404, detail="Source entity not found")
        if not target_entity:
            raise HTTPException(status_code=404, detail="Target entity not found")

        src_obj = parse_json_str(source_entity.json_data)
        tgt_obj = parse_json_str(target_entity.json_data)
        result = schemas.PathsByEntitiesResponse(
            source_paths=extract_paths(src_obj),
            target_paths=extract_paths(tgt_obj)
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Entities
@app.get("/entities", response_model=List[schemas.EntityRead])
def list_entity_endpoint(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    entities = list_entities(db, user.id)
    return entities


@app.post("/entities", response_model=schemas.EntityRead)
def create_entity_endpoint(
    data: schemas.EntityCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    try:
        # Validate JSON
        parse_json_str(data.json_data)
        entity = create_entity(db, user.id, data)
        return entity
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/entities/{entity_id}", response_model=schemas.EntityRead)
def get_entity_endpoint(
    entity_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    entity = get_entity(db, entity_id, user.id)
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")
    return entity


@app.put("/entities/{entity_id}", response_model=schemas.EntityRead)
def update_entity_endpoint(
    entity_id: int,
    data: schemas.EntityUpdate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    entity = get_entity(db, entity_id, user.id)
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")

    try:
        # Validate JSON if being updated
        if data.json_data is not None:
            parse_json_str(data.json_data)
        entity = update_entity(db, user.id, entity, data)
        return entity
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.delete("/entities/{entity_id}")
def delete_entity_endpoint(
    entity_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    entity = get_entity(db, entity_id, user.id)
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")

    try:
        delete_entity(db, user.id, entity)
        return {"deleted": True}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# Mapping Profiles
@app.get("/mappings", response_model=List[schemas.MappingProfileRead])
def list_mapping_profiles(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    profiles = list_profiles(db, user.id)
    return [schemas.MappingProfileRead.from_orm(profile) for profile in profiles]


@app.post("/mappings", response_model=schemas.MappingProfileRead)
def create_mapping_profile(
    data: schemas.MappingProfileCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    profile = create_profile(db, user.id, data)
    return schemas.MappingProfileRead.from_orm(profile)


@app.get("/mappings/{profile_id}", response_model=schemas.MappingProfileRead)
def get_mapping_profile(
    profile_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    profile = get_profile(db, profile_id, user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return schemas.MappingProfileRead.from_orm(profile)


@app.put("/mappings/{profile_id}", response_model=schemas.MappingProfileRead)
def update_mapping_profile(
    profile_id: int,
    data: schemas.MappingProfileUpdate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    profile = get_profile(db, profile_id, user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    profile = update_profile(db, user.id, profile, data)
    return schemas.MappingProfileRead.from_orm(profile)


@app.delete("/mappings/{profile_id}")
def delete_mapping_profile_endpoint(
    profile_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    profile = get_profile(db, profile_id, user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    delete_profile(db, user.id, profile)
    return {"deleted": True}
