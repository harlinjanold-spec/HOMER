from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.database.connection import get_db
from backend.database.models import RemoteCommand
from backend.models.schemas import RemoteCommandCreate, RemoteCommandConfirm, RemoteCommandOut
from backend.commands.command_engine import CommandEngine

router = APIRouter(prefix="/api/commands", tags=["commands"])


@router.post("", response_model=RemoteCommandOut)
async def queue_command(cmd_in: RemoteCommandCreate, db: Session = Depends(get_db)):
    """Dispatch a remote command from Command Centre (App 2) targeting Home Simulator (App 1)."""
    cmd = await CommandEngine.queue_command(db, cmd_in)
    return cmd


@router.get("", response_model=List[RemoteCommandOut])
def get_commands(patient_id: Optional[str] = None, status: Optional[str] = None, db: Session = Depends(get_db)):
    """List queued or executed remote commands."""
    query = db.query(RemoteCommand)
    if patient_id:
        query = query.filter(RemoteCommand.patient_id == patient_id)
    if status:
        query = query.filter(RemoteCommand.status == status)
    return query.order_by(desc(RemoteCommand.created_at)).limit(50).all()


@router.post("/{command_id}/deliver", response_model=RemoteCommandOut)
async def mark_command_delivered(command_id: str, db: Session = Depends(get_db)):
    """Simulator signals it has received the command."""
    cmd = await CommandEngine.mark_delivered(db, command_id)
    if not cmd:
        raise HTTPException(status_code=404, detail=f"Command {command_id} not found")
    return cmd


@router.post("/confirm", response_model=RemoteCommandOut)
async def confirm_command_execution(confirm: RemoteCommandConfirm, db: Session = Depends(get_db)):
    """Simulator confirms that virtual device executed the command."""
    cmd = await CommandEngine.confirm_execution(db, confirm)
    if not cmd:
        raise HTTPException(status_code=404, detail=f"Command {confirm.command_id} not found")
    return cmd

