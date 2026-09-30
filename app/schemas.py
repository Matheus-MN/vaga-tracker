import datetime as dt
from typing import Optional
from pydantic import BaseModel, ConfigDict
from .models import Status


class CandidaturaBase(BaseModel):
    empresa: str
    cargo: str
    status: Status = Status.enviado
    modalidade: Optional[str] = None
    localizacao: Optional[str] = None
    link: Optional[str] = None
    prazo: Optional[dt.date] = None
    notas: Optional[str] = None


class CandidaturaCreate(CandidaturaBase):
    pass


class CandidaturaUpdate(BaseModel):
    empresa: Optional[str] = None
    cargo: Optional[str] = None
    status: Optional[Status] = None
    modalidade: Optional[str] = None
    localizacao: Optional[str] = None
    link: Optional[str] = None
    prazo: Optional[dt.date] = None
    notas: Optional[str] = None


class CandidaturaOut(CandidaturaBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    criado_em: dt.datetime
    atualizado_em: dt.datetime
