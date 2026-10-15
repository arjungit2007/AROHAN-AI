from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app import models, schemas
from app.security import get_current_user, get_optional_current_user

router = APIRouter(prefix="/books", tags=["BookBridge"])

@router.get("", response_model=List[schemas.BookListingOut])
def list_books(
    q: Optional[str] = Query(None, description="Search title, author, or subject"),
    subject: Optional[str] = Query(None, description="Filter by subject"),
    class_or_exam: Optional[str] = Query(None, description="Filter by class or exam"),
    language: Optional[str] = Query(None, description="Filter by language"),
    status: Optional[str] = Query("available", description="Filter by availability status"),
    db: Session = Depends(get_db)
):
    """
    Search and filter free donated textbooks and exam guides on BookBridge.
    Private contact details and addresses are never exposed publicly.
    """
    query = db.query(models.BookListing)

    if status and status != "all":
        query = query.filter(models.BookListing.status == status)

    if q:
        search = f"%{q}%"
        query = query.filter(
            (models.BookListing.title.ilike(search)) |
            (models.BookListing.author.ilike(search)) |
            (models.BookListing.subject.ilike(search)) |
            (models.BookListing.general_pickup_area.ilike(search))
        )

    if subject:
        query = query.filter(models.BookListing.subject == subject)

    if class_or_exam:
        query = query.filter(models.BookListing.class_or_exam == class_or_exam)

    if language:
        query = query.filter(models.BookListing.language == language)

    books = query.order_by(models.BookListing.created_at.desc()).all()
    
    # Map donor names safely
    results = []
    for b in books:
        book_dict = {
            "id": b.id,
            "title": b.title,
            "author": b.author,
            "subject": b.subject,
            "class_or_exam": b.class_or_exam,
            "language": b.language,
            "edition": b.edition,
            "condition": b.condition,
            "general_pickup_area": b.general_pickup_area,
            "collection_point_name": b.collection_point_name,
            "image_url": b.image_url,
            "notes": b.notes,
            "status": b.status,
            "donor_id": b.donor_id,
            "donor_name": b.donor.full_name if b.donor else "Community Donor",
            "created_at": b.created_at
        }
        results.append(schemas.BookListingOut(**book_dict))
    return results

@router.get("/my/listings", response_model=List[schemas.BookListingOut])
def get_my_book_listings(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves books listed by the current user."""
    listings = db.query(models.BookListing).filter(models.BookListing.donor_id == current_user.id).all()
    results = []
    for b in listings:
        results.append(
            schemas.BookListingOut(
                id=b.id,
                title=b.title,
                author=b.author,
                subject=b.subject,
                class_or_exam=b.class_or_exam,
                language=b.language,
                edition=b.edition,
                condition=b.condition,
                general_pickup_area=b.general_pickup_area,
                collection_point_name=b.collection_point_name,
                image_url=b.image_url,
                notes=b.notes,
                status=b.status,
                donor_id=b.donor_id,
                donor_name=current_user.full_name,
                created_at=b.created_at
            )
        )
    return results

@router.get("/my/requests", response_model=List[schemas.BookRequestOut])
def get_my_book_requests(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves book requests made by the student."""
    requests = db.query(models.BookRequest).filter(models.BookRequest.student_id == current_user.id).all()
    results = []
    for r in requests:
        results.append(
            schemas.BookRequestOut(
                id=r.id,
                book_id=r.book_id,
                book_title=r.book.title if r.book else "Educational Textbook",
                student_id=r.student_id,
                student_name=current_user.full_name,
                request_note=r.request_note,
                status=r.status,
                safe_handover_details=r.safe_handover_details,
                created_at=r.created_at,
                updated_at=r.updated_at
            )
        )
    return results

@router.get("/{book_id}", response_model=schemas.BookListingOut)
def get_book_detail(book_id: int, db: Session = Depends(get_db)):
    """Retrieves book details and safe community handover collection point."""
    book = db.query(models.BookListing).filter(models.BookListing.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book listing not found.")
    
    return schemas.BookListingOut(
        id=book.id,
        title=book.title,
        author=book.author,
        subject=book.subject,
        class_or_exam=book.class_or_exam,
        language=book.language,
        edition=book.edition,
        condition=book.condition,
        general_pickup_area=book.general_pickup_area,
        collection_point_name=book.collection_point_name,
        image_url=book.image_url,
        notes=book.notes,
        status=book.status,
        donor_id=book.donor_id,
        donor_name=book.donor.full_name if book.donor else "Community Donor",
        created_at=book.created_at
    )

@router.post("", response_model=schemas.BookListingOut)
def create_book_listing(
    book_in: schemas.BookListingCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List a book for donation. Collects safe general pickup area and approved collection point.
    """
    new_book = models.BookListing(
        donor_id=current_user.id,
        title=book_in.title,
        author=book_in.author,
        subject=book_in.subject,
        class_or_exam=book_in.class_or_exam,
        language=book_in.language,
        edition=book_in.edition,
        condition=book_in.condition,
        general_pickup_area=book_in.general_pickup_area,
        collection_point_name=book_in.collection_point_name or "Local Panchayat Library / School Hub",
        image_url=book_in.image_url,
        notes=book_in.notes,
        status="available"
    )
    db.add(new_book)
    db.commit()
    db.refresh(new_book)

    return schemas.BookListingOut(
        id=new_book.id,
        title=new_book.title,
        author=new_book.author,
        subject=new_book.subject,
        class_or_exam=new_book.class_or_exam,
        language=new_book.language,
        edition=new_book.edition,
        condition=new_book.condition,
        general_pickup_area=new_book.general_pickup_area,
        collection_point_name=new_book.collection_point_name,
        image_url=new_book.image_url,
        notes=new_book.notes,
        status=new_book.status,
        donor_id=new_book.donor_id,
        donor_name=current_user.full_name,
        created_at=new_book.created_at
    )

@router.post("/{book_id}/request", response_model=schemas.BookRequestOut)
def request_book(
    book_id: int,
    req_in: schemas.BookRequestCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submits a request to receive a donated book.
    Validates book availability and prevents duplicate requests.
    """
    book = db.query(models.BookListing).filter(models.BookListing.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book listing not found.")
    
    if book.donor_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot request a book you listed yourself.")

    if book.status != "available":
        raise HTTPException(status_code=400, detail=f"This book is currently {book.status}.")

    # Prevent duplicate pending request
    existing_req = db.query(models.BookRequest).filter(
        models.BookRequest.book_id == book_id,
        models.BookRequest.student_id == current_user.id,
        models.BookRequest.status.in_(["pending", "approved"])
    ).first()
    if existing_req:
        raise HTTPException(status_code=400, detail="You already have an active request for this book.")

    book_req = models.BookRequest(
        book_id=book.id,
        student_id=current_user.id,
        request_note=req_in.request_note,
        status="pending"
    )
    db.add(book_req)
    db.commit()
    db.refresh(book_req)

    return schemas.BookRequestOut(
        id=book_req.id,
        book_id=book_req.book_id,
        book_title=book.title,
        student_id=book_req.student_id,
        student_name=current_user.full_name,
        request_note=book_req.request_note,
        status=book_req.status,
        safe_handover_details=book_req.safe_handover_details,
        created_at=book_req.created_at,
        updated_at=book_req.updated_at
    )

@router.put("/requests/{request_id}", response_model=schemas.BookRequestOut)
def update_book_request_status(
    request_id: int,
    status_update: schemas.BookRequestStatusUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Donor approves or rejects request, or completes handover.
    """
    req = db.query(models.BookRequest).filter(models.BookRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found.")

    book = db.query(models.BookListing).filter(models.BookListing.id == req.book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Associated book listing not found.")

    if book.donor_id == current_user.id:
        allowed_transitions = {
            "pending": ["approved", "rejected"],
            "approved": ["completed"],
        }
        if status_update.status not in allowed_transitions.get(req.status, []):
            raise HTTPException(status_code=400, detail="The donor cannot make this request status transition.")
        if status_update.status == "approved" and book.status != "available":
            raise HTTPException(status_code=400, detail="This book is no longer available.")
    elif req.student_id == current_user.id:
        if status_update.status != "cancelled":
            raise HTTPException(status_code=403, detail="Students may only cancel their own requests.")
        if req.status not in ["pending", "approved"]:
            raise HTTPException(status_code=400, detail="Only pending or approved requests can be cancelled.")
    else:
        raise HTTPException(status_code=403, detail="Not authorized to update this request.")

    req.status = status_update.status
    if book.donor_id == current_user.id and status_update.safe_handover_details:
        req.safe_handover_details = status_update.safe_handover_details

    # Update book status accordingly
    if status_update.status == "approved":
        book.status = "reserved"
    elif status_update.status == "completed":
        book.status = "donated"
    elif status_update.status in ["cancelled", "rejected"]:
        book.status = "available"

    db.commit()
    db.refresh(req)

    return schemas.BookRequestOut(
        id=req.id,
        book_id=req.book_id,
        book_title=book.title,
        student_id=req.student_id,
        student_name=req.student.full_name if req.student else "Student",
        request_note=req.request_note,
        status=req.status,
        safe_handover_details=req.safe_handover_details,
        created_at=req.created_at,
        updated_at=req.updated_at
    )
