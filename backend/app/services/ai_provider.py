import json
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import httpx

from app.config import settings
from app.schemas import CareerPathwayOut, CareerRecommendationResponse, AIChatResponse, StudentProfileBase

class AIProvider(ABC):
    @abstractmethod
    async def generate_career_recommendations(
        self, profile: StudentProfileBase
    ) -> CareerRecommendationResponse:
        pass

    @abstractmethod
    async def chat(
        self, messages: List[Dict[str, str]], student_context: Optional[StudentProfileBase] = None
    ) -> AIChatResponse:
        pass

class RuleBasedDemoProvider(AIProvider):
    """
    Transparent deterministic matching engine used when LLM API keys are not configured.
    Labels all responses as demo mode and never pretends a live AI request occurred.
    """
    async def generate_career_recommendations(
        self, profile: StudentProfileBase
    ) -> CareerRecommendationResponse:
        from app.services.career_matcher import match_careers_rule_based
        recommendations = match_careers_rule_based(profile)
        return CareerRecommendationResponse(
            recommendations=recommendations,
            is_demo_mode=True,
            rationale="Generated using Arohan's deterministic rural career matching rules based on your education stage, favorite subjects, and stated skills."
        )

    async def chat(
        self, messages: List[Dict[str, str]], student_context: Optional[StudentProfileBase] = None
    ) -> AIChatResponse:
        last_user_message = ""
        for m in reversed(messages):
            if m.get("role") == "user":
                last_user_message = m.get("content", "").lower()
                break

        # Context-aware deterministic conversational responses
        if any(w in last_user_message for w in ["engineer", "coding", "software", "computer", "tech"]):
            msg = (
                "Software engineering and IT pathways are highly viable from rural areas through free online resources (like SWAYAM and freeCodeCamp) "
                "or formal degrees (B.Sc CS, BCA, B.Tech). With a computer or a smartphone, you can begin learning programming logic and web development today."
            )
            actions = ["Explore Software Development Roadmap", "Check SWAYAM Free CS Courses", "Talk to an Arohan Tech Mentor"]
            pathways = ["Full-Stack Software Development", "Data Analytics & Digital Operations"]
        elif any(w in last_user_message for w in ["farm", "agri", "crop", "dairy", "village"]):
            msg = (
                "Agriculture is advancing rapidly through precision farming, solar drip irrigation, and Agri-Business Producer Companies (FPOs). "
                "You can explore vocational certifications from Skill India or degrees like B.Sc Agriculture to build sustainable rural enterprises."
            )
            actions = ["View Modern Agriculture Pathway", "Explore NABARD Scheme Details", "Browse Agriculture Textbooks on BookBridge"]
            pathways = ["Precision Agriculture & Agri-Business", "Solar Irrigation & Rural Renewable Energy"]
        elif any(w in last_user_message for w in ["gov", "civil", "upsc", "tnpsc", "bank", "police"]):
            msg = (
                "Public service is an honorable and secure avenue. State PSC exams (like TNPSC Group II & IV) and Central exams (SSC, IBPS, Postal) "
                "require systematic preparation in general knowledge, quantitative aptitude, and regional language proficiency."
            )
            actions = ["Inspect TNPSC Group IV Syllabus", "Check Free Public Library Resources", "View Civil Service Preparation Roadmap"]
            pathways = ["State & Central Public Administration", "Public Banking & Financial Inclusion"]
        elif any(w in last_user_message for w in ["money", "cost", "afford", "scholarship", "fees", "poor"]):
            msg = (
                "Financial constraints should never limit your ambition. Government schemes like NSP Post-Matric, PM-YASASVI, and state free-laptop/hostel "
                "programs provide substantial fee waivers and monthly stipends for rural students."
            )
            actions = ["Browse Verified Scholarships", "Run Eligibility Check for NSP", "Request Donated Books on BookBridge"]
            pathways = ["Subsidized Technical Education (Polytechnic / ITI)", "Merit Scholarship-Funded Higher Studies"]
        else:
            msg = (
                f"Welcome! As a student in {student_context.current_class_or_year if student_context else 'your current stage'}, "
                f"your interests in {', '.join(student_context.favorite_subjects[:3]) if student_context and student_context.favorite_subjects else 'various subjects'} "
                "give you several realistic pathways. Would you like to explore technical careers, government public service, modern agriculture, or vocational skills?"
            )
            actions = ["Compare Academic vs Vocational Pathways", "Take Profile Questionnaire", "Explore Available Scholarships"]
            pathways = ["Full-Stack Software Development", "State Administrative Services", "Precision Agriculture"]

        return AIChatResponse(
            message=msg,
            suggested_actions=actions,
            identified_pathways=pathways,
            is_demo_mode=True
        )

class GeminiProvider(AIProvider):
    """Integrates Google Gemini via HTTP API with automatic model negotiation and key sanitization."""
    CANDIDATE_MODELS = [
        ("v1beta", "gemini-2.0-flash"),
        ("v1beta", "gemini-1.5-flash"),
        ("v1", "gemini-1.5-flash"),
        ("v1beta", "gemini-2.5-flash"),
        ("v1beta", "gemini-1.5-flash-latest"),
        ("v1beta", "gemini-1.5-pro"),
        ("v1", "gemini-pro"),
    ]

    def __init__(self, api_key: str):
        self.api_key = api_key.strip().strip('"').strip("'").strip()
        self._working_model = ("v1beta", "gemini-2.0-flash")

    def _get_url(self, version: str, model: str) -> str:
        return f"https://generativelanguage.googleapis.com/{version}/models/{model}:generateContent?key={self.api_key}"

    async def _post_with_fallback(self, client: httpx.AsyncClient, payload: dict) -> Optional[httpx.Response]:
        # Try known working model first
        attempts = [self._working_model] + [m for m in self.CANDIDATE_MODELS if m != self._working_model]
        for ver, mod in attempts:
            url = self._get_url(ver, mod)
            try:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    self._working_model = (ver, mod)
                    return res
                elif res.status_code == 404:
                    print(f"[AROHAN AI] Model {ver}/{mod} not found, trying next candidate...")
                    continue
                else:
                    print(f"[AROHAN AI] Gemini {ver}/{mod} error {res.status_code}: {res.text[:200]}")
                    return res
            except Exception as e:
                print(f"[AROHAN AI] Request failed for {ver}/{mod}: {e}")
                continue
        return None

    async def generate_career_recommendations(
        self, profile: StudentProfileBase
    ) -> CareerRecommendationResponse:
        system_instruction = (
            "You are Arohan AI's rural career advisor for Indian students. "
            "Generate 3-4 realistic, diverse career pathways (academic, vocational, public-service, technical, or agricultural) "
            "grounded in the Indian education system. Never treat rural location or income as a barrier. "
            "Output valid JSON matching the schema: recommendations array with title, category, summary, why_it_matches, "
            "educational_prerequisites, typical_duration, estimated_cost_range, known_uncertainties, suggested_first_step, alternative_pathways, source_references."
        )
        prompt = (
            f"Student Profile:\n"
            f"- Stage: {profile.current_class_or_year}\n"
            f"- Subjects: {', '.join(profile.favorite_subjects)}\n"
            f"- Interests: {', '.join(profile.interests)}\n"
            f"- Skills: {', '.join(profile.skills)}\n"
            f"- Aspirations: {', '.join(profile.career_aspirations)}\n"
            f"- Income: {profile.family_income_range}\n"
            f"- Willingness to relocate: {profile.willingness_to_relocate}\n\n"
            "Return JSON only."
        )
        try:
            async with httpx.AsyncClient(timeout=25.0) as client:
                res = await self._post_with_fallback(
                    client,
                    {
                        "contents": [
                            {"role": "user", "parts": [{"text": f"{system_instruction}\n\n{prompt}"}]}
                        ],
                        "generationConfig": {"responseMimeType": "application/json"}
                    }
                )
                if res and res.status_code == 200:
                    data = res.json()
                    text = data["candidates"][0]["content"]["parts"][0]["text"]
                    parsed = json.loads(text)
                    rec_list = [CareerPathwayOut(**item) for item in parsed.get("recommendations", [])]
                    if rec_list:
                        return CareerRecommendationResponse(
                            recommendations=rec_list,
                            is_demo_mode=False,
                            rationale=f"AI-generated recommendations synthesized from your profile via Google Gemini ({self._working_model[1]})."
                        )
        except Exception as e:
            print(f"[AROHAN AI] Gemini generate_career_recommendations exception: {e}")

        demo = RuleBasedDemoProvider()
        return await demo.generate_career_recommendations(profile)

    async def chat(
        self, messages: List[Dict[str, str]], student_context: Optional[StudentProfileBase] = None
    ) -> AIChatResponse:
        try:
            contents = []
            for m in messages:
                role = "user" if m.get("role") == "user" else "model"
                contents.append({"role": role, "parts": [{"text": m.get("content", "")}]})
            
            async with httpx.AsyncClient(timeout=25.0) as client:
                res = await self._post_with_fallback(
                    client,
                    {
                        "systemInstruction": {
                            "parts": [{"text": "You are Arohan AI, an empathetic and practical career advisor for rural Indian students. Provide realistic advice, mention official Indian schemes (NSP, SWAYAM, ITI), and suggest 2-3 next actions."}]
                        },
                        "contents": contents
                    }
                )
                if res and res.status_code == 200:
                    data = res.json()
                    reply_text = data["candidates"][0]["content"]["parts"][0]["text"]
                    return AIChatResponse(
                        message=reply_text,
                        suggested_actions=["Save this pathway", "Check related scholarships", "Speak to a mentor"],
                        identified_pathways=[],
                        is_demo_mode=False
                    )
        except Exception as e:
            print(f"[AROHAN AI] Gemini chat exception: {e}")

        demo = RuleBasedDemoProvider()
        return await demo.chat(messages, student_context)

def get_ai_provider() -> AIProvider:
    clean_key = settings.GEMINI_API_KEY.strip().strip('"').strip("'").strip()
    if settings.AI_PROVIDER in ("gemini", "auto") and clean_key:
        return GeminiProvider(clean_key)
    return RuleBasedDemoProvider()
