from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class EntityBase(BaseModel):
    name: str
    description: Optional[str] = None
    json_data: str

class EntityCreate(EntityBase):
    pass

class EntityUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    json_data: Optional[str] = None

class EntityRead(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    json_data: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class MappingPairBase(BaseModel):
    source_path: str
    target_path: str
    transform_expr: Optional[str] = None
    order_index: Optional[int] = None

class MappingPairCreate(MappingPairBase):
    pass

class MappingPairRead(MappingPairBase):
    id: int
    class Config:
        from_attributes = True

class MappingProfileBase(BaseModel):
    name: str
    description: Optional[str] = None
    source_entity_id: int
    target_entity_id: int
    pairs: List[MappingPairCreate] = []

class MappingProfileCreate(MappingProfileBase):
    pass

class MappingProfileUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    source_entity_id: Optional[int] = None
    target_entity_id: Optional[int] = None
    pairs: Optional[List[MappingPairCreate]] = None

class MappingProfileRead(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    # Include full entity data
    source_entity: EntityRead
    target_entity: EntityRead
    pairs: List[MappingPairRead]
    # Explicit fields for backward compatibility
    source_json: str
    target_json: str

    @classmethod
    def from_orm(cls, obj):
        # Create instance with explicit source_json and target_json
        data = {
            'id': obj.id,
            'name': obj.name,
            'description': obj.description,
            'source_entity': obj.source_entity,
            'target_entity': obj.target_entity,
            'pairs': obj.pairs,
            'source_json': obj.source_entity.json_data if obj.source_entity else '',
            'target_json': obj.target_entity.json_data if obj.target_entity else ''
        }
        return cls(**data)

class PathsByEntitiesRequest(BaseModel):
    source_entity_id: int
    target_entity_id: int

class PathsByEntitiesResponse(BaseModel):
    source_paths: List[str]
    target_paths: List[str]
