from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from . import models, schemas


# Entity CRUD operations
def list_entities(db: Session, owner_id: int) -> List[models.Entity]:
    return db.query(models.Entity).filter(models.Entity.owner_id == owner_id).order_by(models.Entity.created_at.desc()).all()


def get_entity(db: Session, entity_id: int, owner_id: int) -> Optional[models.Entity]:
    return (
        db.query(models.Entity)
        .filter(models.Entity.id == entity_id, models.Entity.owner_id == owner_id)
        .first()
    )


def create_entity(db: Session, owner_id: int, data: schemas.EntityCreate) -> models.Entity:
    entity = models.Entity(
        name=data.name,
        description=data.description,
        json_data=data.json_data,
        owner_id=owner_id,
    )
    db.add(entity)
    db.commit()
    db.refresh(entity)
    return entity


def update_entity(
    db: Session, owner_id: int, entity: models.Entity, data: schemas.EntityUpdate
) -> models.Entity:
    if data.name is not None:
        entity.name = data.name
    if data.description is not None:
        entity.description = data.description
    if data.json_data is not None:
        entity.json_data = data.json_data

    db.commit()
    db.refresh(entity)
    return entity


def delete_entity(db: Session, owner_id: int, entity: models.Entity) -> None:
    # Check if entity is being used by any profiles
    source_count = db.query(models.MappingProfile).filter(
        models.MappingProfile.source_entity_id == entity.id
    ).count()
    target_count = db.query(models.MappingProfile).filter(
        models.MappingProfile.target_entity_id == entity.id
    ).count()

    if source_count > 0 or target_count > 0:
        raise ValueError(f"Entity is being used by {source_count + target_count} mapping profile(s)")

    db.delete(entity)
    db.commit()


def list_profiles(db: Session, owner_id: int) -> List[models.MappingProfile]:
    return (
        db.query(models.MappingProfile)
        .options(
            joinedload(models.MappingProfile.source_entity),
            joinedload(models.MappingProfile.target_entity),
            joinedload(models.MappingProfile.pairs)
        )
        .filter(models.MappingProfile.owner_id == owner_id)
        .order_by(models.MappingProfile.created_at.desc())
        .all()
    )


def get_profile(db: Session, profile_id: int, owner_id: int) -> Optional[models.MappingProfile]:
    return (
        db.query(models.MappingProfile)
        .options(
            joinedload(models.MappingProfile.source_entity),
            joinedload(models.MappingProfile.target_entity),
            joinedload(models.MappingProfile.pairs)
        )
        .filter(models.MappingProfile.id == profile_id, models.MappingProfile.owner_id == owner_id)
        .first()
    )


def create_profile(db: Session, owner_id: int, data: schemas.MappingProfileCreate) -> models.MappingProfile:
    # Validate that entities exist and belong to the user
    source_entity = get_entity(db, data.source_entity_id, owner_id)
    if not source_entity:
        raise ValueError("Source entity not found or does not belong to user")

    target_entity = get_entity(db, data.target_entity_id, owner_id)
    if not target_entity:
        raise ValueError("Target entity not found or does not belong to user")

    profile = models.MappingProfile(
        name=data.name,
        description=data.description,
        owner_id=owner_id,
        source_entity_id=data.source_entity_id,
        target_entity_id=data.target_entity_id,
    )
    db.add(profile)
    db.flush()

    for idx, pair in enumerate(data.pairs or []):
        db.add(
            models.MappingPair(
                profile_id=profile.id,
                source_path=pair.source_path,
                target_path=pair.target_path,
                transform_expr=pair.transform_expr,
                order_index=pair.order_index if pair.order_index is not None else idx,
            )
        )

    db.commit()
    # Refresh with joined loads
    return get_profile(db, profile.id, owner_id)


def update_profile(
    db: Session, owner_id: int, profile: models.MappingProfile, data: schemas.MappingProfileUpdate
) -> models.MappingProfile:
    if data.name is not None:
        profile.name = data.name
    if data.description is not None:
        profile.description = data.description

    # Validate and update entity IDs
    if data.source_entity_id is not None:
        source_entity = get_entity(db, data.source_entity_id, owner_id)
        if not source_entity:
            raise ValueError("Source entity not found or does not belong to user")
        profile.source_entity_id = data.source_entity_id

    if data.target_entity_id is not None:
        target_entity = get_entity(db, data.target_entity_id, owner_id)
        if not target_entity:
            raise ValueError("Target entity not found or does not belong to user")
        profile.target_entity_id = data.target_entity_id

    if data.pairs is not None:
        db.query(models.MappingPair).filter(models.MappingPair.profile_id == profile.id).delete()
        for idx, pair in enumerate(data.pairs or []):
            db.add(
                models.MappingPair(
                    profile_id=profile.id,
                    source_path=pair.source_path,
                    target_path=pair.target_path,
                    transform_expr=pair.transform_expr,
                    order_index=pair.order_index if pair.order_index is not None else idx,
                )
            )

    db.commit()
    # Refresh with joined loads
    return get_profile(db, profile.id, owner_id)


def delete_profile(db: Session, owner_id: int, profile: models.MappingProfile) -> None:
    db.delete(profile)
    db.commit()
