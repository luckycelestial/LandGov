from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session, select
from typing import Dict, Any, List

from app.domain.models.land_gov import LandParcel, DisputeCase
from app.infrastructure.db.sqlite_client import get_session

router = APIRouter(prefix="/citizen", tags=["Citizen Voice Assistant & WhatsApp Bot"])


class WhatsAppMessageRequest(BaseModel):
    phone_number: str
    message_text: str


class VoiceQueryRequest(BaseModel):
    transcript_text: str
    language: str = "hi-IN"  # hi-IN, en-IN, mr-IN, ta-IN, te-IN, bn-IN


@router.post("/whatsapp-simulate")
def simulate_whatsapp_bot(req: WhatsAppMessageRequest, session: Session = Depends(get_session)) -> Dict[str, Any]:
    text = req.message_text.strip().lower()
    
    # 1. Khasra / Parcel Status Check
    if "khasra" in text or "parcel" in text or "plot" in text or "/" in text:
        # Search for khasra number mentioned
        words = text.replace(",", " ").split()
        target_khasra = None
        for w in words:
            if "/" in w or any(char.isdigit() for char in w):
                target_khasra = w.upper()
                break
        
        parcel = None
        if target_khasra:
            parcel = session.exec(select(LandParcel).where(LandParcel.khasra_no.contains(target_khasra))).first()
        
        if not parcel:
            parcel = session.exec(select(LandParcel)).first()

        if parcel:
            reply = (
                f"🏛️ *Bhu-Seva Portal (DoLR - MoRD)*\n\n"
                f"📋 *Land Record Status for Khasra No:* `{parcel.khasra_no}`\n"
                f"📍 *Village:* {parcel.village}, {parcel.district}\n"
                f"👤 *Registered Owner:* {parcel.owner_name}\n"
                f"📏 *Area:* {parcel.area_acres} Acres ({parcel.land_use})\n"
                f"🛡️ *Title Status:* {parcel.title_status}\n"
                f"📑 *SVAMITVA Property Card:* {'✅ Issued & Downloadable' if parcel.svamitva_issued else '⏳ In Process'}\n\n"
                f"Reply *DISPUTE* to check litigation status or *MUTATION* to track mutation filing."
            )
        else:
            reply = "❌ No land record found for the requested Khasra number. Please verify with your Tehsil Revenue Office."

    # 2. Dispute Check
    elif "dispute" in text or "case" in text or "court" in text:
        dispute = session.exec(select(DisputeCase).where(DisputeCase.status == "Active")).first()
        reply = (
            f"⚖️ *Land Dispute & Judicial Registry Status*\n\n"
            f"📌 *Case No:* `{dispute.case_number}`\n"
            f"🏛️ *Court:* {dispute.court_type}\n"
            f"🏷️ *Matter:* {dispute.title}\n"
            f"📅 *Next Hearing:* {dispute.next_hearing_date}\n"
            f"⚠️ *Current Status:* {dispute.status} ({dispute.risk_level} Priority)\n\n"
            f"For certified copies, visit the nearest e-Seva Kendra."
        )

    # 3. Default Menu
    else:
        reply = (
            f"🙏 *Namaste! Welcome to National Bhu-Seva Assistant (DoLR)*\n\n"
            f"How can I assist you with your land records today?\n\n"
            f"1️⃣ Type `Khasra 104/1A` to check title & SVAMITVA status\n"
            f"2️⃣ Type `Dispute` to track active court cases\n"
            f"3️⃣ Type `Mutation` to track ownership transfer\n"
            f"4️⃣ Type `Help` for Revenue Department support helpline"
        )

    return {
        "status": "success",
        "sender": "DoLR Bhu-Seva Bot (Verified)",
        "recipient": req.phone_number,
        "reply_text": reply
    }


@router.post("/voice-query")
def process_voice_query(req: VoiceQueryRequest, session: Session = Depends(get_session)) -> Dict[str, Any]:
    text = req.transcript_text.lower()
    
    # Process speech transcript
    reply = "Your land title for Khasra 104/1A in Village Mehrauli is fully clear with digital SVAMITVA card issued."
    if "dispute" in text or "jhagda" in text or "vivad" in text:
        reply = "Under Khasra 218/3B, there is an active revenue court proceeding regarding boundary demarcation scheduled for September 28, 2026."

    return {
        "language_detected": req.language,
        "transcription": req.transcript_text,
        "ai_synthesized_response": reply,
        "audio_tts_available": True
    }
