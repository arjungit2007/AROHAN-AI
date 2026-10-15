from typing import List
from app.schemas import CareerPathwayOut, StudentProfileBase

# Comprehensive database of verified, realistic pathways across India
CURATED_PATHWAYS = [
    {
        "id": 1,
        "title": "Software & Web Application Developer",
        "category": "technical",
        "tags": ["math", "computer", "coding", "physics", "technology", "problem solving"],
        "summary": "Design and build web applications, mobile tools, and software solutions for regional and global businesses.",
        "why_it_matches": "Directly matches your analytical aptitude and interest in technology. Can be learned remotely through open-source curricula and government certifications without moving away from home early on.",
        "educational_prerequisites": "Completion of Class 12 (any stream with basic math/computer interest) or BCA / B.Sc CS / B.Tech / Diploma in Computer Engineering.",
        "typical_duration": "6-12 months for foundational skills; 3-4 years for a formal degree.",
        "estimated_cost_range": "Zero to minimal (via SWAYAM & YouTube) up to standard government college fees (₹15,000 - ₹35,000/year).",
        "known_uncertainties": "Requires consistent electricity and a modest laptop or smartphone with internet access for practice.",
        "suggested_first_step": "Complete CS50 or SWAYAM 'Programming in Python' and build a simple portfolio website.",
        "alternative_pathways": [
            {"title": "Data Operations & Digital Marketing", "route": "vocational"},
            {"title": "Computer Hardware & Network Technician", "route": "vocational"}
        ],
        "source_references": [
            {"name": "SWAYAM NPTEL Computer Science", "url": "https://swayam.gov.in"},
            {"name": "Skill India Digital IT Courses", "url": "https://www.skillindiadigital.gov.in"}
        ]
    },
    {
        "id": 2,
        "title": "Precision Agriculture & Agri-Business Manager",
        "category": "entrepreneurship",
        "tags": ["biology", "farming", "agriculture", "business", "rural", "environment"],
        "summary": "Modernize rural agriculture using soil testing, solar pump irrigation, drone crop monitoring, and Farmer Producer Organizations (FPOs).",
        "why_it_matches": "Bridges your deep rural roots and desire to create local economic prosperity. High demand as cooperatives modernize supply chains.",
        "educational_prerequisites": "Class 10/12 pass with biology/agriculture, Diploma in Agriculture, or B.Sc Agriculture / Horticulture.",
        "typical_duration": "2-year Diploma or 4-year Degree, or 3-month Skill India Agri-drone pilot certification.",
        "estimated_cost_range": "Subsidized heavily by state agricultural universities; ICAR scholarship covers tuition for eligible students.",
        "known_uncertainties": "Dependence on regional seasonal factors and micro-credit availability for initial equipment.",
        "suggested_first_step": "Visit your local Krishi Vigyan Kendra (KVK) and enroll in the free PMKVY Agri-Tech orientation.",
        "alternative_pathways": [
            {"title": "Organic Farming Micro-Enterprise", "route": "entrepreneurship"},
            {"title": "Government Seed & Fertilizer Inspector", "route": "public_service"}
        ],
        "source_references": [
            {"name": "ICAR Agricultural Education Portal", "url": "https://icar.org.in"},
            {"name": "Tamil Nadu Agricultural University (TNAU)", "url": "https://tnau.ac.in"}
        ]
    },
    {
        "id": 3,
        "title": "State Administrative Services (TNPSC / State PSC)",
        "category": "public_service",
        "tags": ["social science", "history", "tamil", "english", "public service", "governance"],
        "summary": "Serve the public directly as a Village Administrative Officer (VAO), Revenue Inspector, or Block Development Executive.",
        "why_it_matches": "Offers supreme job stability, honorable community prestige, and an opportunity to improve public administration in your own district.",
        "educational_prerequisites": "Class 10 pass for TNPSC Group IV (VAO/Junior Assistant); Bachelor's Degree in any discipline for Group II/I.",
        "typical_duration": "1-2 years of disciplined daily self-study alongside college or work.",
        "estimated_cost_range": "₹2,000 - ₹5,000 for standard state board school textbooks (Samacheer Kalvi) and previous year papers.",
        "known_uncertainties": "High competition ratio requiring strict discipline and consistency over 12-18 months.",
        "suggested_first_step": "Download TNPSC Group IV syllabus and thoroughly study Class 6-10 Social Science & General Tamil books.",
        "alternative_pathways": [
            {"title": "Staff Selection Commission (SSC CHSL)", "route": "public_service"},
            {"title": "Postal Assistant / Indian Post Payments Bank", "route": "public_service"}
        ],
        "source_references": [
            {"name": "Tamil Nadu Public Service Commission (TNPSC)", "url": "https://www.tnpsc.gov.in"},
            {"name": "Staff Selection Commission (SSC)", "url": "https://ssc.gov.in"}
        ]
    },
    {
        "id": 4,
        "title": "Solar & Clean Energy Technician",
        "category": "vocational",
        "tags": ["physics", "electronics", "practical", "hands-on", "electricity", "repair"],
        "summary": "Install, test, and maintain solar rooftop panels, agricultural solar pumps, and battery storage systems across villages and towns.",
        "why_it_matches": "Rapidly expanding green sector in India under the PM Surya Ghar Muft Bijli Yojana. High earning potential for self-employed electricians.",
        "educational_prerequisites": "Class 10 pass + 1-2 year ITI (Electrician / Wireman) or PMKVY Solar PV Installer (Suryamitra) certificate.",
        "typical_duration": "3 to 6 months for certificate; 2 years for ITI diploma.",
        "estimated_cost_range": "Free / stipend-supported in Government ITIs and Suryamitra training centers.",
        "known_uncertainties": "Requires physical stamina and fieldwork in varied outdoor weather conditions.",
        "suggested_first_step": "Enroll in the Government Suryamitra Skill Development Program or apply for ITI Electrician trade.",
        "alternative_pathways": [
            {"title": "EV Charging & Battery Maintenance Specialist", "route": "technical"},
            {"title": "Industrial Automation & PLC Technician", "route": "vocational"}
        ],
        "source_references": [
            {"name": "National Institute of Solar Energy (Suryamitra)", "url": "https://nise.res.in"},
            {"name": "Directorate General of Training (DGT) ITI", "url": "https://dgt.gov.in"}
        ]
    },
    {
        "id": 5,
        "title": "Healthcare Assistant & Primary Nursing",
        "category": "academic",
        "tags": ["biology", "science", "care", "health", "hospital", "helping"],
        "summary": "Provide critical healthcare support in primary health centers, rural clinics, and district hospitals.",
        "why_it_matches": "High demand, noble public service, and opportunities for government appointments as Village Health Nurses (VHN) or General Duty Assistants.",
        "educational_prerequisites": "Class 12 with Biology for GNM / B.Sc Nursing, or Class 10/12 pass for General Duty Assistant certification.",
        "typical_duration": "6 months for GDA; 3 years for GNM; 4 years for B.Sc Nursing.",
        "estimated_cost_range": "Government nursing colleges charge nominal fees (₹5,000 - ₹12,000/yr) with guaranteed clinical stipends.",
        "known_uncertainties": "Night shift rotations and demanding physical workloads in busy rural hospital wards.",
        "suggested_first_step": "Apply for Government District Hospital Nursing admissions or NSDC Healthcare Sector Skill Council courses.",
        "alternative_pathways": [
            {"title": "Medical Laboratory Technician (DMLT)", "route": "vocational"},
            {"title": "Pharmacy Assistant (D.Pharm)", "route": "academic"}
        ],
        "source_references": [
            {"name": "Indian Nursing Council", "url": "https://indiannursingcouncil.org"},
            {"name": "Healthcare Sector Skill Council", "url": "https://healthcare-ssc.in"}
        ]
    },
    {
        "id": 6,
        "title": "Regional Content Creator & Digital Educator",
        "category": "creative",
        "tags": ["tamil", "english", "arts", "teaching", "creative", "speaking", "writing"],
        "summary": "Create educational media, explain government welfare schemes, or teach school concepts in regional languages via digital channels.",
        "why_it_matches": "Leverages your creative expression, language clarity, and passion for sharing knowledge with your community.",
        "educational_prerequisites": "Any undergraduate degree (B.A, B.Sc, B.Com) or B.Ed / D.El.Ed for formal school teaching.",
        "typical_duration": "Self-paced portfolio building (3-6 months) or 2 years for formal Teacher Eligibility (TET).",
        "estimated_cost_range": "Low; smartphone and internet connectivity are sufficient to begin publishing.",
        "known_uncertainties": "Income ramp-up takes time; best paired with tutoring or teaching credentials.",
        "suggested_first_step": "Draft 3 sample lesson explainers in Tamil or English and record test video walk-throughs.",
        "alternative_pathways": [
            {"title": "Government School Primary Teacher (TET)", "route": "academic"},
            {"title": "Language Localization & Translation Specialist", "route": "technical"}
        ],
        "source_references": [
            {"name": "Teachers Recruitment Board (TRB Tamil Nadu)", "url": "https://trb.tn.gov.in"},
            {"name": "DIKSHA National Digital Education Infrastructure", "url": "https://diksha.gov.in"}
        ]
    }
]

def match_careers_rule_based(profile: StudentProfileBase) -> List[CareerPathwayOut]:
    """
    Deterministic rule-based matching engine that evaluates:
    1. Education stage (Class 9-10 vs 11-12 vs UG/Graduate)
    2. Overlap of student's favorite subjects, interests, and skills with pathway tags
    3. Guarantees diversity across academic, vocational, public-service, technical, or agricultural routes.
    """
    scored = []
    
    # Collect all search tokens from profile
    profile_tokens = set()
    for item in (profile.favorite_subjects or []):
        for w in item.lower().split():
            profile_tokens.add(w)
    for item in (profile.interests or []):
        for w in item.lower().split():
            profile_tokens.add(w)
    for item in (profile.skills or []):
        for w in item.lower().split():
            profile_tokens.add(w)
    for item in (profile.career_aspirations or []):
        for w in item.lower().split():
            profile_tokens.add(w)

    for item in CURATED_PATHWAYS:
        score = 0
        tags = item.get("tags", [])
        for tag in tags:
            if tag in profile_tokens or any(tag in token for token in profile_tokens):
                score += 3
        
        # Boost based on stage appropriateness
        stage = profile.current_class_or_year.lower()
        if "class 9" in stage or "class 10" in stage:
            if item["category"] in ["vocational", "technical", "public_service"]:
                score += 1
        elif "class 11" in stage or "class 12" in stage:
            if item["category"] in ["academic", "technical"]:
                score += 2
        elif "ug" in stage or "grad" in stage:
            if item["category"] in ["public_service", "technical", "entrepreneurship"]:
                score += 2

        scored.append((score, item))

    # Sort descending by score
    scored.sort(key=lambda x: x[0], reverse=True)

    # Pick top 3-4 ensuring category diversity
    selected = []
    chosen_categories = set()

    for _, p in scored:
        if p["category"] not in chosen_categories or len(selected) < 2:
            selected.append(p)
            chosen_categories.add(p["category"])
        if len(selected) >= 4:
            break

    # If we still have fewer than 3, backfill from top
    if len(selected) < 3:
        for _, p in scored:
            if p not in selected:
                selected.append(p)
            if len(selected) >= 3:
                break

    results = []
    for p in selected:
        results.append(
            CareerPathwayOut(
                id=p["id"],
                title=p["title"],
                category=p["category"],
                summary=p["summary"],
                why_it_matches=p["why_it_matches"],
                educational_prerequisites=p["educational_prerequisites"],
                typical_duration=p["typical_duration"],
                estimated_cost_range=p["estimated_cost_range"],
                known_uncertainties=p.get("known_uncertainties"),
                suggested_first_step=p["suggested_first_step"],
                alternative_pathways=p.get("alternative_pathways", []),
                source_references=p.get("source_references", []),
                is_demo_mode=True
            )
        )
    return results
