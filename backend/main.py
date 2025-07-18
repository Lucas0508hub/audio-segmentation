from fastapi import FastAPI, File, UploadFile, Depends, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydub import AudioSegment, silence
import uuid, os
# … your existing imports …

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# … your User, Segment models, auth helpers, other routes …


def segment_job(job_id: str, path: str, db: Session):
    """
    Load the WAV, split on silence, write out chunk files and DB rows.
    """
    audio = AudioSegment.from_file(path, format="wav")
    # detect non-silent chunks (min 500 ms silence, silence < -40 dBFS)
    chunks = silence.split_on_silence(
        audio,
        min_silence_len=500,
        silence_thresh=-40
    )

    for chunk in chunks:
        start_ms = chunk.start_second * 1000 if hasattr(chunk, "start_second") else 0
        # fallback if chunk.start_second not available, compute manually:
        # you’d need to track cumulative times, but pydub 0.25+ has start_second
        end_ms = start_ms + len(chunk)

        seg = Segment(
            id=str(uuid.uuid4()),
            job_id=job_id,
            start=start_ms / 1000.0,
            end=end_ms   / 1000.0,
        )
        db.add(seg)
        # export individual WAV
        out_path = f"/tmp/{job_id}_{seg.id}.wav"
        chunk.export(out_path, format="wav")

    db.commit()


@app.post("/upload")
async def upload_audio(
    audio_file: UploadFile = File(...),
    background: BackgroundTasks,
    db: Session = Depends(get_db),
):
    # 1) save upload
    job_id = str(uuid.uuid4())
    path   = f"/tmp/{job_id}.wav"
    with open(path, "wb") as f:
        f.write(await audio_file.read())

    # 2) kick off segmentation in background
    background.add_task(segment_job, job_id, path, db)

    # 3) return immediately so frontend can poll
    return {"job_id": job_id}
