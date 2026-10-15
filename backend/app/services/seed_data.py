import datetime
from sqlalchemy.orm import Session
from app import models
from app.security import hash_password

def seed_database(db: Session):
    """Populates the database with verified opportunities, initial users, mentors, and books."""
    # Check if data already exists
    if db.query(models.User).filter(models.User.email == "student@arohan.org").first():
        return {"status": "already_seeded"}

    # 1. Users
    student_user = models.User(
        email="student@arohan.org",
        hashed_password=hash_password("student123"),
        full_name="Kavitha Selvam",
        role="student",
        preferred_language="ta",
        district="Thanjavur",
        state="Tamil Nadu",
        is_active=True,
        is_verified=True
    )
    teacher_user = models.User(
        email="teacher@arohan.org",
        hashed_password=hash_password("teacher123"),
        full_name="S. Sundaram (Govt Higher Secondary)",
        role="teacher",
        preferred_language="ta",
        district="Thanjavur",
        state="Tamil Nadu",
        is_active=True,
        is_verified=True
    )
    mentor_user = models.User(
        email="mentor@arohan.org",
        hashed_password=hash_password("mentor123"),
        full_name="Dr. Anand Krishnan",
        role="mentor",
        preferred_language="en",
        district="Chennai",
        state="Tamil Nadu",
        is_active=True,
        is_verified=True
    )
    donor_user = models.User(
        email="donor@arohan.org",
        hashed_password=hash_password("donor123"),
        full_name="Meera Ramanathan",
        role="donor",
        preferred_language="en",
        district="Thanjavur",
        state="Tamil Nadu",
        is_active=True,
        is_verified=True
    )

    db.add_all([student_user, teacher_user, mentor_user, donor_user])
    db.flush()

    # 2. Student Profile for Kavitha
    student_profile = models.StudentProfile(
        user_id=student_user.id,
        current_class_or_year="Class 10",
        stream_or_major="General (All Subjects)",
        favorite_subjects=["Mathematics", "Science", "Tamil"],
        interests=["Computer Technology", "Electronics", "Farming Innovation"],
        hobbies_and_activities=["Fixing household gadgets", "Reading library books"],
        skills=["Problem Solving", "Basic Computer Literacy", "Fast Learner"],
        career_aspirations=["Software Engineer", "Solar Technician", "Government Officer"],
        family_income_range="< 1.5 Lakhs",
        location_type="rural",
        willingness_to_relocate="nearby_only",
        preferred_learning_mode="practical",
        accessibility_needs=None
    )
    db.add(student_profile)

    # 3. Mentor Profile
    mentor_profile = models.MentorProfile(
        user_id=mentor_user.id,
        display_name="Dr. Anand Krishnan",
        headline="Senior Research Scientist & Rural Education Advocate",
        bio="Grew up in a village near Kumbakonam, studied via scholarships, now mentoring first-generation rural learners in higher education and STEM careers.",
        expertise_areas=["Computer Science", "STEM Scholarships", "Career Planning"],
        languages_spoken=["Tamil", "English"],
        available_topics=["Higher Secondary Stream Selection", "How to prepare for competitive entrance", "Free online learning tools"],
        is_verified=True,
        verification_notes="Identity and credentials manually verified via institutional affiliation.",
        max_monthly_mentees=5,
        safety_guidelines_acknowledged=True
    )
    db.add(mentor_profile)

    # 4. Facilitator Assignment & Guidance Record
    facilitator_assignment = models.FacilitatorAssignment(
        teacher_id=teacher_user.id,
        student_id=student_user.id,
        school_or_center_name="Government Model Higher Secondary School, Thanjavur",
        status="active"
    )
    db.add(facilitator_assignment)
    db.flush()

    guidance_note = models.GuidanceRecord(
        assignment_id=facilitator_assignment.id,
        note="Kavitha demonstrates exceptional mathematical logic. Highly recommended to apply for NMMS scholarship and take computer science group in Class 11.",
        recommended_pathway_title="Software & Web Application Developer",
        is_private_to_facilitator=False
    )
    db.add(guidance_note)

    # 5. Verified Opportunities
    opp1 = models.Opportunity(
        title="National Means-cum-Merit Scholarship Scheme (NMMSS)",
        category="scholarship",
        issuing_organization="Department of School Education & Literacy, Govt of India",
        description="Provides financial assistance of ₹12,000 per annum to meritorious students of economically weaker sections to arrest drop-out at class 8 and encourage them to continue studies at secondary stage.",
        official_source_url="https://scholarships.gov.in",
        application_url="https://scholarships.gov.in/public/schemeGuidelines/NMMSS_Guidelines.pdf",
        eligibility_criteria={
            "allowed_stages": ["Class 9", "Class 10", "Class 11", "Class 12"],
            "max_family_income_lakhs": 3.5,
            "min_class_7_marks_pct": 55,
            "states": ["All India"]
        },
        required_documents=[
            "Income Certificate issued by Revenue Authority",
            "Mark sheet of previous qualifying exam",
            "Aadhaar Card / Enrollment Slip",
            "Bank Passbook in student's name (seeded with Aadhaar)"
        ],
        start_date="2026-07-01",
        closing_date="2026-10-31",
        verification_status="verified",
        state_applicability="All India",
        education_stage_applicability=["Class 9", "Class 10", "Class 11", "Class 12"],
        is_active=True
    )

    opp2 = models.Opportunity(
        title="SWAYAM Free Online Courses & Credit Transfer",
        category="free_course",
        issuing_organization="Ministry of Education & AICTE / UGC / NPTEL",
        description="Offers high-quality free video lectures, reading material, self-assessment tests, and an online discussion forum across engineering, science, humanities, and management.",
        official_source_url="https://swayam.gov.in",
        application_url="https://swayam.gov.in/explorer",
        eligibility_criteria={
            "allowed_stages": ["Class 9", "Class 10", "Class 11", "Class 12", "UG Year 1", "UG Year 2", "UG Year 3", "Graduate"],
            "states": ["All India"]
        },
        required_documents=["Valid Email Address / Mobile Number for OTP"],
        start_date="Continuous enrollment",
        closing_date="Semester-based (Jan / Jul sessions)",
        verification_status="verified",
        state_applicability="All India",
        education_stage_applicability=["Class 9-10", "Class 11-12", "Undergraduate", "Graduate"],
        is_active=True
    )

    opp3 = models.Opportunity(
        title="PM-YASASVI Post-Matric Scholarship for OBC / EBC / DNT",
        category="scholarship",
        issuing_organization="Ministry of Social Justice and Empowerment",
        description="Assists OBC, EBC, and DNT students studying in Class 11 and 12, or higher education, to cover tuition fees, maintenance allowance, and book grants.",
        official_source_url="https://scholarships.gov.in",
        application_url="https://yet.nta.ac.in",
        eligibility_criteria={
            "allowed_stages": ["Class 11", "Class 12", "UG Year 1", "UG Year 2", "UG Year 3", "Graduate"],
            "max_family_income_lakhs": 2.5,
            "states": ["All India"]
        },
        required_documents=[
            "Community / Caste Certificate",
            "Income Certificate (< ₹2.5 Lakhs)",
            "Fee receipt of current institution",
            "Aadhaar linked bank account details"
        ],
        start_date="2026-08-15",
        closing_date="2026-11-30",
        verification_status="verified",
        state_applicability="All India",
        education_stage_applicability=["Class 11-12", "Undergraduate", "Graduate"],
        is_active=True
    )

    opp4 = models.Opportunity(
        title="National Apprenticeship Promotion Scheme (NAPS)",
        category="apprenticeship",
        issuing_organization="Ministry of Skill Development & Entrepreneurship (MSDE)",
        description="On-the-job training with industrial stipends (up to ₹9,000 - ₹12,000/month) and government co-funding for students who completed Class 10, 12, ITI, or Diploma.",
        official_source_url="https://www.apprenticeshipindia.gov.in",
        application_url="https://www.apprenticeshipindia.gov.in/candidate-registration",
        eligibility_criteria={
            "allowed_stages": ["Class 10", "Class 12", "UG Year 1", "UG Year 2", "UG Year 3", "Graduate"],
            "states": ["All India"]
        },
        required_documents=[
            "Educational qualification marksheet",
            "Aadhaar Card",
            "Active Mobile Number and Bank Account"
        ],
        start_date="Open throughout year",
        closing_date="Rolling admissions",
        verification_status="verified",
        state_applicability="All India",
        education_stage_applicability=["Class 10", "Class 12", "Undergraduate", "Graduate"],
        is_active=True
    )

    opp5 = models.Opportunity(
        title="Sample Demo: Rural Innovation Seed Grant 2026",
        category="internship",
        issuing_organization="AROHAN Community Innovation Cell (Sample)",
        description="Illustrative opportunity record for testing local grassroots development grants. Awaiting official circular release.",
        official_source_url="https://arohan.org/sample-notice",
        application_url="https://arohan.org/demo-apply",
        eligibility_criteria={
            "allowed_stages": ["UG Year 2", "UG Year 3", "Graduate"],
            "states": ["Tamil Nadu"]
        },
        required_documents=["Student ID", "Project Proposal Summary"],
        start_date="2026-10-01",
        closing_date="2026-12-15",
        verification_status="sample_demo",
        state_applicability="Tamil Nadu",
        education_stage_applicability=["Undergraduate", "Graduate"],
        is_active=True
    )

    db.add_all([opp1, opp2, opp3, opp4, opp5])

    # 6. BookBridge Listings
    book1 = models.BookListing(
        donor_id=donor_user.id,
        title="NCERT Mathematics Class 10 (Tamil & English)",
        author="NCERT Editorial Board",
        subject="Mathematics",
        class_or_exam="Class 10",
        language="English / Tamil",
        edition="2024 Revised",
        condition="like_new",
        general_pickup_area="Near Thanjavur Old Bus Stand",
        collection_point_name="Town Central Library Information Desk",
        status="available",
        notes="Comes with solved chapter test booklets. Clean pages."
    )

    book2 = models.BookListing(
        donor_id=donor_user.id,
        title="TN Samacheer Kalvi Science Class 10",
        author="Tamil Nadu Textbook Corporation",
        subject="Science",
        class_or_exam="Class 10",
        language="Tamil",
        edition="2023 Edition",
        condition="good",
        general_pickup_area="Papanasam Taluk",
        collection_point_name="Govt High School Main Gate Office",
        status="available",
        notes="All practical experiments highlighted."
    )

    book3 = models.BookListing(
        donor_id=donor_user.id,
        title="TNPSC Group IV & VAO General Studies Comprehensive Guide",
        author="Sura Publications",
        subject="General Knowledge & Tamil",
        class_or_exam="TNPSC",
        language="Tamil",
        edition="2025 Edition",
        condition="good",
        general_pickup_area="Thanjavur Medical College Road",
        collection_point_name="Panchayat Union Office Counter",
        status="available",
        notes="Includes 10 previous solved question papers."
    )

    db.add_all([book1, book2, book3])

    # 7. Pre-saved Roadmap for Kavitha
    roadmap1 = models.SavedRoadmap(
        user_id=student_user.id,
        pathway_title="Software & Web Application Developer",
        pathway_category="technical",
        target_role="Junior Frontend / Full-Stack Developer",
        progress_percent=25.0,
        is_active=True
    )
    db.add(roadmap1)
    db.flush()

    steps = [
        models.RoadmapStep(
            roadmap_id=roadmap1.id,
            step_order=1,
            title="Master Basic Computer Literacy & Typing",
            description="Practice touch typing (English/Tamil) and learn filesystem organization, text editing, and browser navigation.",
            is_required=True,
            estimated_duration="2-4 weeks",
            key_skills_or_exams=["Keyboard skills", "Browser dev tools"],
            official_source_url="https://www.skillindiadigital.gov.in",
            official_source_name="Skill India Digital",
            is_completed=True,
            completed_at=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=10),
            saved_next_action="Review basic terminal commands"
        ),
        models.RoadmapStep(
            roadmap_id=roadmap1.id,
            step_order=2,
            title="HTML, CSS & Web Design Fundamentals",
            description="Learn how web pages are structured using semantic HTML tags and styled with modern CSS.",
            is_required=True,
            estimated_duration="4-6 weeks",
            key_skills_or_exams=["HTML5", "CSS3", "Responsive layout"],
            official_source_url="https://swayam.gov.in",
            official_source_name="SWAYAM Web Development",
            is_completed=False,
            saved_next_action="Build personal bio page on mobile browser sandbox"
        ),
        models.RoadmapStep(
            roadmap_id=roadmap1.id,
            step_order=3,
            title="JavaScript & Programming Logic",
            description="Understand variables, conditions, loops, functions, and manipulating the browser DOM dynamically.",
            is_required=True,
            estimated_duration="8 weeks",
            key_skills_or_exams=["JavaScript", "Algorithm basics"],
            official_source_url="https://developer.mozilla.org",
            official_source_name="MDN Web Docs",
            is_completed=False
        ),
        models.RoadmapStep(
            roadmap_id=roadmap1.id,
            step_order=4,
            title="Enroll in BCA / B.Sc CS or Polytechnic Diploma",
            description="Secure admission in a government or government-aided institution with fee concession or state scholarship.",
            is_required=False, # Alternative routes exist
            estimated_duration="3 years",
            key_skills_or_exams=["Degree / Diploma", "State Counselling"],
            official_source_url="https://www.tngasa.in",
            official_source_name="TNGASA Tamil Nadu Govt Arts & Science Admissions",
            is_completed=False
        )
    ]
    db.add_all(steps)

    demo_book_request = models.BookRequest(
        book_id=book1.id,
        student_id=student_user.id,
        request_note="[HACKATHON SAMPLE] Kavitha is requesting this book for Class 10 mathematics practice.",
        status="pending"
    )
    db.add(demo_book_request)

    db.commit()
    return {"status": "seeded_successfully"}
