export type Language = 'en' | 'ta';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Brand & Mission
    appName: 'AROHAN AI',
    tagline: 'Every dream deserves a pathway.',
    headline: 'From Learning to Livelihood',
    heroSubhead: 'Helping rural Indian students discover their unique strengths, build realistic career pathways, access verified scholarships, and take practical steps toward economic independence.',
    getStarted: 'Discover Your Pathway',
    exploreOpportunities: 'Explore Verified Opportunities',

    // Nav
    navHome: 'Home',
    navExplore: 'Explore Careers',
    navRoadmaps: 'My Roadmaps',
    navOpportunities: 'Opportunities',
    navBookBridge: 'BookBridge',
    navMentors: 'Arohan Connect',
    navTeacher: 'Teacher Portal',
    navDashboard: 'Dashboard',
    navSettings: 'Settings & Privacy',
    navLogin: 'Login',
    navRegister: 'Register',
    navLogout: 'Sign Out',

    // Journey
    journeyTitle: 'The 5-Step Journey to Independence',
    step1Title: '1. Discover Strengths',
    step1Desc: 'Reflect on your favorite subjects, practical skills, and interests without feeling limited by marks or rural location.',
    step2Title: '2. Compare Realistic Pathways',
    step2Desc: 'Explore academic, vocational, technical, public-service, and agricultural options with realistic cost and duration breakdowns.',
    step3Title: '3. Build Staged Roadmap',
    step3Desc: 'Follow concrete, sequential milestones with clear next actions that you can save and review even offline.',
    step4Title: '4. Verified Support',
    step4Desc: 'Find official scholarships (NSP, PM-YASASVI), free books via BookBridge, and community mentors.',
    step5Title: '5. Take Practical Action',
    step5Desc: 'Track weekly progress, celebrate completed milestones, and take direct steps toward economic self-reliance.',

    // Common
    verified: 'Verified Official',
    awaitingVerification: 'Awaiting Verification',
    sampleDemo: 'Sample Demonstration Record',
    required: 'Required Requirement',
    recommended: 'Recommended Practice',
    eligibilityCheck: 'Check Eligibility',
    eligible: 'Eligible',
    potentiallyEligible: 'Potentially Eligible',
    insufficientInfo: 'More Info Needed',
    notEligible: 'Not Eligible',
    offlineNotice: 'You are currently working offline. Cached roadmaps remain available.',
    saveNextAction: 'Save Next Action',
    markComplete: 'Mark Completed',
    completed: 'Completed',
    inProgress: 'In Progress',
    saveRoadmap: 'Save Pathway as Roadmap',
    demoModeNotice: 'AI Provider is in Transparent Demo Mode using Arohan Deterministic Career Matching Rules.',
    loading: 'Loading...',
    tryAgain: 'Try Again',
    back: 'Back',
    submit: 'Submit',
    cancel: 'Cancel',

    // BookBridge & Mentors
    bookbridgeHeadline: 'BookBridge: Free Educational Book Sharing',
    bookbridgeSubhead: 'Donate or request school textbooks, competitive guides, and college study materials with safe public handover.',
    listBookCTA: 'Donate a Book',
    requestBookCTA: 'Request Book',
    arohanConnectHeadline: 'Arohan Connect: Youth-Protected Mentorship',
    arohanConnectSubhead: 'Connect with verified mentors from rural backgrounds who have walked the path to higher education and public careers.',
    requestGuidance: 'Request Guidance',

    // Teacher
    teacherHeadline: 'Facilitator & Teacher Guidance Dashboard',
    teacherSubhead: 'Review assigned students, track roadmap progress, and add supportive guidance notes.',
    assignedStudents: 'Authorized Students',
    addGuidanceNote: 'Add Guidance Note',

    // Accessibility
    highContrast: 'High Contrast Mode',
    textSize: 'Text Size',
    voiceInput: 'Voice Input',
  },
  ta: {
    // Brand & Mission
    appName: 'ஆரோகன் AI',
    tagline: 'ஒவ்வொரு கனவிற்கும் ஒரு பாதை உண்டு.',
    headline: 'கற்றலில் இருந்து வாழ்வாதாரத்திற்கு',
    heroSubhead: 'கிராமப்புற மாணவர்களின் திறன்களைக் கண்டறிந்து, நடைமுறைக்கேற்ற தொழில் பாதைகளை உருவாக்கி, சரிபார்க்கப்பட்ட கல்வி உதவித்தொகைகளைப் பெற்று, பொருளாதார தன்னிறைவை அடைய வழிகாட்டுகிறது.',
    getStarted: 'உங்கள் பாதையைக் கண்டறியுங்கள்',
    exploreOpportunities: 'வாய்ப்புகளைக் காண்க',

    // Nav
    navHome: 'முகப்பு',
    navExplore: 'தொழில் வழிகாட்டல்',
    navRoadmaps: 'என் திட்டங்கள்',
    navOpportunities: 'கல்வி வாய்ப்புகள்',
    navBookBridge: 'புத்தகப் பாலம் (BookBridge)',
    navMentors: 'வழிகாட்டி இணைப்பு',
    navTeacher: 'ஆசிரியர் பக்கம்',
    navDashboard: 'கட்டுப்பாட்டகம்',
    navSettings: 'அமைப்புகள் & தனியுரிமை',
    navLogin: 'உள்நுழைக',
    navRegister: 'பதிவு செய்க',
    navLogout: 'வெளியேறு',

    // Journey
    journeyTitle: 'தன்னிறைவுக்கான 5-படி பயணம்',
    step1Title: '1. திறனறிதல்',
    step1Desc: 'மதிப்பெண் அல்லது கிராம எல்லைகள் இல்லாமல் உங்கள் விருப்பமான பாடங்கள் மற்றும் நடைமுறைத் திறன்களைப் புரிந்து கொள்ளுங்கள்.',
    step2Title: '2. பாதைகளை ஒப்பிடுதல்',
    step2Desc: 'கல்வி, தொழிற்கல்வி, அரசுப் பணி, விவசாயம் மற்றும் தொழில்நுட்பப் பாதைகளை செலவு விவரங்களுடன் ஒப்பிடுங்கள்.',
    step3Title: '3. தெளிவான வரைபடம்',
    step3Desc: 'இணையம் இல்லாத போதும் படிக்கக்கூடிய வகையில் அடுத்தடுத்த நடைமுறைப் படிகளுடன் கூடிய கற்றல் வரைபடம்.',
    step4Title: '4. சரிபார்க்கப்பட்ட ஆதரவு',
    step4Desc: 'அரசு உதவித்தொகைகள் (NSP, PM-YASASVI), இலவசப் புத்தகங்கள் மற்றும் சமூக வழிகாட்டிகளின் உதவி பெறுங்கள்.',
    step5Title: '5. நடைமுறைச் செயல்பாடு',
    step5Desc: 'வாரம் தோறும் உங்கள் இலக்குகளை முடித்து பொருளாதார தன்னிறைவை நோக்கி உறுதியுடன் முன்னேறுங்கள்.',

    // Common
    verified: 'சரிபார்க்கப்பட்ட அரசு ஆதாரம்',
    awaitingVerification: 'சரிபார்ப்பு நிலுவையில்',
    sampleDemo: 'மாதிரி செயல்முறை பதிவு',
    required: 'கட்டாயத் தேவை',
    recommended: 'பரிந்துரைக்கப்படும் வழி',
    eligibilityCheck: 'தகுதியைச் சரிபார்',
    eligible: 'தகுதியுடையவர்',
    potentiallyEligible: 'தகுதி பெற வாய்ப்புண்டு',
    insufficientInfo: 'கூடுதல் விவரம் தேவை',
    notEligible: 'தகுதியற்றவர்',
    offlineNotice: 'நீங்கள் இணைய தொடர்பின்றி உள்ளீர்கள். சேமிக்கப்பட்ட வரைபடங்களைப் படிக்கலாம்.',
    saveNextAction: 'அடுத்த செயலைச் சேமி',
    markComplete: 'முடித்ததாகக் குறி',
    completed: 'முடிக்கப்பட்டது',
    inProgress: 'நடப்பில் உள்ளது',
    saveRoadmap: 'வரைபடமாகச் சேமிக்க',
    demoModeNotice: 'AI வசதி மாதிரி முறையில் (Demo Mode) ஆரோகன் விதிமுறைகளின்படி செயல்படுகிறது.',
    loading: 'ஏற்றுகிறது...',
    tryAgain: 'மீண்டும் முயற்சி செய்க',
    back: 'பின்செல்க',
    submit: 'சமர்ப்பிக்க',
    cancel: 'ரத்து செய்',

    // BookBridge & Mentors
    bookbridgeHeadline: 'புத்தகப் பாலம் (BookBridge): இலவசப் புத்தகப் பகிர்வு',
    bookbridgeSubhead: 'பள்ளிப் பாடப்புத்தகங்கள், போட்டித் தேர்வு வழிகாட்டிகளை இலவசமாகப் பகிருங்கள் மற்றும் பெறுங்கள்.',
    listBookCTA: 'புத்தகம் வழங்குக',
    requestBookCTA: 'புத்தகம் கோருக',
    arohanConnectHeadline: 'ஆரோகன் இணைப்பு: பாதுகாப்பான வழிகாட்டல்',
    arohanConnectSubhead: 'கிராமப்புறப் பின்னணியில் இருந்து படித்து முன்னேறிய வழிகாட்டிகளுடன் கலந்தாலோசியுங்கள்.',
    requestGuidance: 'வழிகாட்டல் கோருக',

    // Teacher
    teacherHeadline: 'ஆசிரியர்களுக்கான கட்டுப்பாட்டகம்',
    teacherSubhead: 'மாணவர்களின் கற்றல் வரைபட முன்னேற்றத்தை அறிந்து அவர்களுக்கான வழிகாட்டல் குறிப்புகளைப் பதியுங்கள்.',
    assignedStudents: 'ஒதுக்கப்பட்ட மாணவர்கள்',
    addGuidanceNote: 'வழிகாட்டல் குறிப்பு சேர்க்க',

    // Accessibility
    highContrast: 'உயர் மாறுபட்ட நிற முறைமை',
    textSize: 'எழுத்து அளவு',
    voiceInput: 'குரல் உள்ளீடு',
  }
};
