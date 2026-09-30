import enum
import datetime as dt
from sqlalchemy import Column, Integer, String, Text, Enum, DateTime, Date
from .database import Base


class Status(str, enum.Enum):
    enviado = "enviado"
    em_processo = "em_processo"
    entrevista = "entrevista"
    aprovado = "aprovado"
    rejeitado = "rejeitado"


class Candidatura(Base):
    __tablename__ = "candidaturas"

    id = Column(Integer, primary_key=True, index=True)
    empresa = Column(String(120), nullable=False)
    cargo = Column(String(160), nullable=False)
    status = Column(Enum(Status), nullable=False, default=Status.enviado)
    modalidade = Column(String(60), nullable=True)      # presencial, remoto, híbrido
    localizacao = Column(String(120), nullable=True)
    link = Column(String(500), nullable=True)
    prazo = Column(Date, nullable=True)
    notas = Column(Text, nullable=True)
    criado_em = Column(DateTime, default=dt.datetime.utcnow)
    atualizado_em = Column(DateTime, default=dt.datetime.utcnow, onupdate=dt.datetime.utcnow)
