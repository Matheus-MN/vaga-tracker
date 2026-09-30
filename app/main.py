from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func

from . import models, schemas
from .database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Vaga Tracker", description="Rastreador pessoal de candidaturas de estágio")

BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"


@app.get("/api/candidaturas", response_model=List[schemas.CandidaturaOut])
def listar_candidaturas(status: Optional[models.Status] = None, db: Session = Depends(get_db)):
    query = db.query(models.Candidatura)
    if status:
        query = query.filter(models.Candidatura.status == status)
    return query.order_by(models.Candidatura.criado_em.desc()).all()


@app.post("/api/candidaturas", response_model=schemas.CandidaturaOut, status_code=201)
def criar_candidatura(payload: schemas.CandidaturaCreate, db: Session = Depends(get_db)):
    candidatura = models.Candidatura(**payload.model_dump())
    db.add(candidatura)
    db.commit()
    db.refresh(candidatura)
    return candidatura


@app.get("/api/candidaturas/{candidatura_id}", response_model=schemas.CandidaturaOut)
def obter_candidatura(candidatura_id: int, db: Session = Depends(get_db)):
    candidatura = db.get(models.Candidatura, candidatura_id)
    if not candidatura:
        raise HTTPException(status_code=404, detail="Candidatura não encontrada")
    return candidatura


@app.put("/api/candidaturas/{candidatura_id}", response_model=schemas.CandidaturaOut)
def atualizar_candidatura(candidatura_id: int, payload: schemas.CandidaturaUpdate, db: Session = Depends(get_db)):
    candidatura = db.get(models.Candidatura, candidatura_id)
    if not candidatura:
        raise HTTPException(status_code=404, detail="Candidatura não encontrada")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(candidatura, field, value)
    db.commit()
    db.refresh(candidatura)
    return candidatura


@app.delete("/api/candidaturas/{candidatura_id}", status_code=204)
def deletar_candidatura(candidatura_id: int, db: Session = Depends(get_db)):
    candidatura = db.get(models.Candidatura, candidatura_id)
    if not candidatura:
        raise HTTPException(status_code=404, detail="Candidatura não encontrada")
    db.delete(candidatura)
    db.commit()
    return None


@app.get("/api/stats")
def estatisticas(db: Session = Depends(get_db)):
    rows = (
        db.query(models.Candidatura.status, func.count(models.Candidatura.id))
        .group_by(models.Candidatura.status)
        .all()
    )
    counts = {status.value: 0 for status in models.Status}
    for status, total in rows:
        counts[status.value] = total
    counts["total"] = sum(counts.values())
    return counts


# --- Frontend estático (serve o app SPA) ---
app.mount("/assets", StaticFiles(directory=STATIC_DIR), name="assets")


@app.get("/")
def serve_index():
    return FileResponse(STATIC_DIR / "index.html")
