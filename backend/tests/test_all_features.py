import pytest

def test_health_check(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert "ai_provider" in data

def test_seeded_hackathon_book_request(client):
    login = client.post("/api/v1/auth/login", json={
        "email": "student@arohan.org",
        "password": "student123"
    })
    token = login.json()["access_token"]
    response = client.get("/api/v1/books/my/requests", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    sample_requests = [request for request in response.json() if request["request_note"].startswith("[HACKATHON SAMPLE]")]
    assert len(sample_requests) == 1
    assert sample_requests[0]["status"] == "pending"

def test_auth_login_seeded_student(client):
    # kavitha student login
    res = client.post("/api/v1/auth/login", json={
        "email": "student@arohan.org",
        "password": "student123"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "student@arohan.org"
    assert data["user"]["role"] == "student"

def test_auth_login_invalid_password(client):
    res = client.post("/api/v1/auth/login", json={
        "email": "student@arohan.org",
        "password": "wrongpassword"
    })
    assert res.status_code == 401

def test_auth_register_and_me(client):
    res = client.post("/api/v1/auth/register", json={
        "email": "newstudent@arohan.org",
        "password": "securepass123",
        "full_name": "Ravi Kumar",
        "role": "student",
        "preferred_language": "ta",
        "district": "Madurai",
        "state": "Tamil Nadu"
    })
    assert res.status_code == 200
    token = res.json()["access_token"]

    # Test /me
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "newstudent@arohan.org"
    assert me_res.json()["district"] == "Madurai"

def test_public_registration_cannot_assign_privileged_roles(client):
    for role in ["teacher", "mentor", "donor", "admin"]:
        response = client.post("/api/v1/auth/register", json={
            "email": f"new-{role}@arohan.org",
            "password": "securepass123",
            "full_name": "Unverified Account",
            "role": role,
        })
        assert response.status_code == 403

def test_student_profile_update(client):
    # Login as student
    login_res = client.post("/api/v1/auth/login", json={
        "email": "student@arohan.org",
        "password": "student123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get profile
    prof_res = client.get("/api/v1/students/profile", headers=headers)
    assert prof_res.status_code == 200
    assert prof_res.json()["current_class_or_year"] == "Class 10"

    # Update questionnaire
    update_res = client.put("/api/v1/students/profile", json={
        "current_class_or_year": "Class 11",
        "stream_or_major": "Computer Science & Maths",
        "skills": ["Coding", "Mathematics", "Communication"]
    }, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json()["current_class_or_year"] == "Class 11"
    assert "Coding" in update_res.json()["skills"]

def test_ai_career_recommendation(client):
    # Request career matching
    res = client.post("/api/v1/ai/recommend", json={
        "current_class_or_year": "Class 11",
        "stream_or_major": "Computer Science",
        "favorite_subjects": ["Mathematics", "Computer Science"],
        "interests": ["Coding", "Technology"],
        "skills": ["Problem Solving"],
        "career_aspirations": ["Software Engineer"]
    })
    assert res.status_code == 200
    data = res.json()
    assert len(data["recommendations"]) >= 3
    assert data["is_demo_mode"] == True
    first_rec = data["recommendations"][0]
    assert "title" in first_rec
    assert "why_it_matches" in first_rec
    assert "educational_prerequisites" in first_rec
    assert "suggested_first_step" in first_rec

def test_ai_chat_interaction(client):
    res = client.post("/api/v1/ai/chat", json={
        "messages": [
            {"role": "user", "content": "I like fixing electronics and farming. What careers should I consider?"}
        ]
    })
    assert res.status_code == 200
    data = res.json()
    assert "message" in data
    assert len(data["suggested_actions"]) > 0

def test_roadmap_creation_and_step_toggle(client):
    login_res = client.post("/api/v1/auth/login", json={
        "email": "student@arohan.org",
        "password": "student123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Generate roadmap from pathway
    create_res = client.post(
        "/api/v1/roadmaps/from-pathway?pathway_title=Solar%20%26%20Clean%20Energy%20Technician&pathway_category=vocational",
        headers=headers
    )
    assert create_res.status_code == 200
    roadmap_data = create_res.json()
    assert len(roadmap_data["steps"]) >= 3
    first_step_id = roadmap_data["steps"][0]["id"]

    # Toggle first step to completed
    step_res = client.put(
        f"/api/v1/roadmaps/steps/{first_step_id}",
        json={"is_completed": True, "saved_next_action": "Complete Module 2 on Suryamitra portal"},
        headers=headers
    )
    assert step_res.status_code == 200
    assert step_res.json()["is_completed"] == True
    assert step_res.json()["saved_next_action"] == "Complete Module 2 on Suryamitra portal"

    # Check updated roadmap progress
    get_res = client.get(f"/api/v1/roadmaps/{roadmap_data['id']}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["progress_percent"] > 0

def test_opportunities_search_and_eligibility(client):
    # List opportunities
    list_res = client.get("/api/v1/opportunities")
    assert list_res.status_code == 200
    opps = list_res.json()
    assert len(opps) >= 4
    
    # Filter by category
    scholarships = client.get("/api/v1/opportunities?category=scholarship").json()
    assert all(o["category"] == "scholarship" for o in scholarships)

    # Test deterministic eligibility for NMMS scholarship
    nmms = next(o for o in opps if "Means-cum-Merit" in o["title"])
    eligibility_res = client.post(
        f"/api/v1/opportunities/{nmms['id']}/check-eligibility",
        json={
            "current_class_or_year": "Class 10",
            "family_income_range": "< 1.5 Lakhs",
            "location_type": "rural"
        }
    )
    assert eligibility_res.status_code == 200
    el_data = eligibility_res.json()
    assert el_data["status"] == "eligible"

    # Test disqualified by income
    disqualified_res = client.post(
        f"/api/v1/opportunities/{nmms['id']}/check-eligibility",
        json={
            "current_class_or_year": "Class 10",
            "family_income_range": "> 6 Lakhs",
            "location_type": "rural"
        }
    )
    assert disqualified_res.status_code == 200
    assert disqualified_res.json()["status"] == "not_eligible"

def test_bookbridge_listing_and_request(client):
    # Donor logs in
    donor_res = client.post("/api/v1/auth/login", json={
        "email": "donor@arohan.org",
        "password": "donor123"
    })
    donor_token = donor_res.json()["access_token"]

    # Donor lists a new book
    new_book_res = client.post(
        "/api/v1/books",
        json={
            "title": "Class 12 Physics Part 1",
            "author": "NCERT",
            "subject": "Physics",
            "class_or_exam": "Class 12",
            "language": "English",
            "edition": "2024",
            "condition": "good",
            "general_pickup_area": "Kumbakonam Railway Station road",
            "collection_point_name": "Kumbakonam Public Library Desk"
        },
        headers={"Authorization": f"Bearer {donor_token}"}
    )
    assert new_book_res.status_code == 200
    book_id = new_book_res.json()["id"]

    # Student requests this book
    student_res = client.post("/api/v1/auth/login", json={
        "email": "student@arohan.org",
        "password": "student123"
    })
    student_token = student_res.json()["access_token"]

    req_res = client.post(
        f"/api/v1/books/{book_id}/request",
        json={"request_note": "Preparing for board exams and need textbook reference."},
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert req_res.status_code == 200
    assert req_res.json()["status"] == "pending"

    student_update_res = client.put(
        f"/api/v1/books/requests/{req_res.json()['id']}",
        json={"status": "approved"},
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert student_update_res.status_code == 403

    # Donor approves request
    req_id = req_res.json()["id"]
    approve_res = client.put(
        f"/api/v1/books/requests/{req_id}",
        json={
            "status": "approved",
            "safe_handover_details": "Book deposited at Kumbakonam Public Library Counter with Mr. Murugan."
        },
        headers={"Authorization": f"Bearer {donor_token}"}
    )
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "approved"

def test_arohan_connect_mentorship(client):
    # Student logs in
    student_res = client.post("/api/v1/auth/login", json={
        "email": "student@arohan.org",
        "password": "student123"
    })
    student_token = student_res.json()["access_token"]

    # List mentors
    mentors_res = client.get("/api/v1/mentors")
    assert mentors_res.status_code == 200
    assert len(mentors_res.json()) >= 1
    mentor_id = mentors_res.json()[0]["id"]

    # Student submits mentorship request
    req_res = client.post(
        f"/api/v1/mentors/{mentor_id}/request",
        json={
            "topic": "Guidance on Polytechic vs Higher Secondary",
            "student_goals": "Want to understand which path gives better job opportunities after class 10.",
            "preferred_language": "Tamil"
        },
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert req_res.status_code == 200
    req_id = req_res.json()["id"]
    assert req_res.json()["status"] == "pending"

    # Mentor logs in and accepts
    mentor_auth = client.post("/api/v1/auth/login", json={
        "email": "mentor@arohan.org",
        "password": "mentor123"
    })
    mentor_token = mentor_auth.json()["access_token"]

    accept_res = client.put(
        f"/api/v1/mentors/requests/{req_id}",
        json={
            "status": "accepted",
            "mentor_response_message": "Glad to guide you Kavitha. Let's review the polytechnic admission criteria."
        },
        headers={"Authorization": f"Bearer {mentor_token}"}
    )
    assert accept_res.status_code == 200
    assert accept_res.json()["status"] == "accepted"

def test_facilitator_role_authorization(client):
    # Student tries to access facilitator endpoints -> 403 Forbidden
    student_res = client.post("/api/v1/auth/login", json={
        "email": "student@arohan.org",
        "password": "student123"
    })
    student_token = student_res.json()["access_token"]
    forbidden_res = client.get(
        "/api/v1/facilitator/students",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert forbidden_res.status_code == 403

    # Teacher accesses assigned students
    teacher_res = client.post("/api/v1/auth/login", json={
        "email": "teacher@arohan.org",
        "password": "teacher123"
    })
    teacher_token = teacher_res.json()["access_token"]
    students_res = client.get(
        "/api/v1/facilitator/students",
        headers={"Authorization": f"Bearer {teacher_token}"}
    )
    assert students_res.status_code == 200
    students_list = students_res.json()
    assert len(students_list) >= 1
    assert students_list[0]["student_name"] == "Kavitha Selvam"

    # Teacher adds guidance note
    assignment_id = students_list[0]["assignment_id"]
    guidance_res = client.post(
        "/api/v1/facilitator/guidance",
        json={
            "assignment_id": assignment_id,
            "note": "Student shows great aptitude in mathematics and computer logic.",
            "recommended_pathway_title": "Software & Web Application Developer",
            "is_private_to_facilitator": False
        },
        headers={"Authorization": f"Bearer {teacher_token}"}
    )
    assert guidance_res.status_code == 200

def test_book_and_mentor_route_precedence(client):
    # Student login
    login_res = client.post("/api/v1/auth/login", json={
        "email": "student@arohan.org",
        "password": "student123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Test /books/my/listings does not collide with /{book_id}
    listings_res = client.get("/api/v1/books/my/listings", headers=headers)
    assert listings_res.status_code == 200
    assert isinstance(listings_res.json(), list)

    # Test /books/my/requests does not collide with /{book_id}
    requests_res = client.get("/api/v1/books/my/requests", headers=headers)
    assert requests_res.status_code == 200
    assert isinstance(requests_res.json(), list)

    # Test /mentors/my/requests does not collide with /{mentor_id}
    mentor_reqs_res = client.get("/api/v1/mentors/my/requests", headers=headers)
    assert mentor_reqs_res.status_code == 200
    assert isinstance(mentor_reqs_res.json(), list)

    # Test individual item lookup
    all_books = client.get("/api/v1/books").json()
    assert len(all_books) > 0
    first_book_id = all_books[0]["id"]
    book_detail = client.get(f"/api/v1/books/{first_book_id}")
    assert book_detail.status_code == 200
    assert book_detail.json()["id"] == first_book_id

    all_mentors = client.get("/api/v1/mentors").json()
    assert len(all_mentors) > 0
    first_mentor_id = all_mentors[0]["id"]
    mentor_detail = client.get(f"/api/v1/mentors/{first_mentor_id}")
    assert mentor_detail.status_code == 200
    assert mentor_detail.json()["id"] == first_mentor_id

def test_missing_resource_404_responses(client):
    # Non-existent book
    res = client.get("/api/v1/books/99999")
    assert res.status_code == 404
    assert "detail" in res.json()

    # Non-existent mentor
    res = client.get("/api/v1/mentors/99999")
    assert res.status_code == 404
    assert "detail" in res.json()

    # Non-existent opportunity
    res = client.get("/api/v1/opportunities/99999")
    assert res.status_code == 404
    assert "detail" in res.json()

