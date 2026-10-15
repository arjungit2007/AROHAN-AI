from typing import Dict, Any, Optional
from app.schemas import EligibilityCheckResult, StudentProfileBase

def check_opportunity_eligibility(
    opportunity_id: int,
    criteria: Dict[str, Any],
    student_profile: Optional[StudentProfileBase] = None,
    user_state: Optional[str] = "Tamil Nadu"
) -> EligibilityCheckResult:
    """
    Deterministically evaluates student profile attributes against an opportunity's verified rules.
    Returns:
    - eligible: All criteria met
    - potentially_eligible: Some criteria met, non-disqualifying criteria need verification
    - insufficient_information: Crucial fields missing from student profile
    - not_eligible: Clearly fails one or more hard criteria
    """
    if not criteria:
        return EligibilityCheckResult(
            opportunity_id=opportunity_id,
            status="potentially_eligible",
            reasons=["This opportunity has open eligibility or minimal general criteria."],
            missing_criteria=[]
        )

    if not student_profile:
        return EligibilityCheckResult(
            opportunity_id=opportunity_id,
            status="insufficient_information",
            reasons=["Complete your student profile to evaluate personalized eligibility."],
            missing_criteria=list(criteria.keys())
        )

    reasons = []
    missing = []
    is_disqualified = False

    # 1. Check Education Stage
    allowed_stages = criteria.get("allowed_stages", [])
    if allowed_stages:
        student_stage = student_profile.current_class_or_year
        # Normalization
        stage_matches = any(s.lower() in student_stage.lower() or student_stage.lower() in s.lower() for s in allowed_stages)
        if stage_matches:
            reasons.append(f"Education stage '{student_stage}' matches requirement ({', '.join(allowed_stages)}).")
        else:
            reasons.append(f"Education stage '{student_stage}' does not match required stages: {', '.join(allowed_stages)}.")
            is_disqualified = True

    # 2. Check Family Income Threshold
    max_income_lakhs = criteria.get("max_family_income_lakhs")
    if max_income_lakhs is not None:
        income_range = student_profile.family_income_range
        if not income_range:
            missing.append("family_income_range")
            reasons.append(f"Requires family income below ₹{max_income_lakhs} Lakhs/year (income details not provided in your profile).")
        else:
            if "< 1.5 Lakhs" in income_range:
                student_val = 1.5
            elif "1.5 - 3 Lakhs" in income_range:
                student_val = 2.5
            elif "3 - 6 Lakhs" in income_range:
                student_val = 4.5
            else:
                student_val = 7.0

            if student_val <= max_income_lakhs:
                reasons.append(f"Family income bracket '{income_range}' satisfies the maximum threshold of ₹{max_income_lakhs} Lakhs.")
            else:
                reasons.append(f"Family income bracket '{income_range}' exceeds the maximum eligible threshold of ₹{max_income_lakhs} Lakhs.")
                is_disqualified = True

    # 3. Check State / Geographic Applicability
    required_states = criteria.get("states", ["All India"])
    if "All India" not in required_states:
        if user_state and user_state in required_states:
            reasons.append(f"Resident of '{user_state}', which is an eligible state.")
        elif user_state:
            reasons.append(f"Opportunity is restricted to {', '.join(required_states)}; your profile indicates {user_state}.")
            is_disqualified = True
        else:
            missing.append("state")
            reasons.append(f"Geographic eligibility applies to {', '.join(required_states)}.")

    # 4. Stream / Subject Requirement
    required_streams = criteria.get("required_streams", [])
    if required_streams:
        stream = student_profile.stream_or_major or ""
        if stream and any(r.lower() in stream.lower() for r in required_streams):
            reasons.append(f"Academic stream '{stream}' matches required disciplines.")
        elif stream:
            reasons.append(f"Stream '{stream}' may not meet preference for {', '.join(required_streams)}.")
        else:
            missing.append("stream_or_major")

    # Determine final status
    if is_disqualified:
        status = "not_eligible"
    elif missing:
        status = "potentially_eligible" if len(reasons) > 0 else "insufficient_information"
    else:
        status = "eligible"

    return EligibilityCheckResult(
        opportunity_id=opportunity_id,
        status=status,
        reasons=reasons,
        missing_criteria=missing
    )
