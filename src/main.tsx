from fastapi import File, UploadFile
import uuid

@app.post("/upload")
async def upload_audio(
    audio_file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    # 1) Save incoming file
    job_id = str(uuid.uuid4())
    path = f"/tmp/{job_id}.wav"
    with open(path, "wb") as f:
        f.write(await audio_file.read())

    # 2) Enqueue segmentation in background (so POST returns immediately)
    #    e.g. celery.send_task("segment", args=[job_id, path])
    #    or spawn asyncio.create_task(your_segmentation_fn(job_id, path))

    # 3) Return job_id right away
    return {"job_id": job_id}
