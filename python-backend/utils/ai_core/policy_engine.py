# backend/utils/ai_core/policy_engine.py

import re
import copy
import spacy # <-- Import spacy
from typing import List, Dict, Any, Optional


class PolicyEngine:
    """
    [HYBRID VERSION] Uses a combination of regex for simple, domain-specific
    entities and a SpaCy NLP model for robust person name recognition.
    """
    def __init__(self, known_programs: List[str]):
        self.known_programs = {p.lower() for p in known_programs}
        
        # Load the small English SpaCy model.
        # This happens once when the AIAnalyst starts.
        try:
            self.nlp = spacy.load("en_core_web_sm")
            print("✅ SpaCy NLP model ('en_core_web_sm') loaded successfully for PolicyEngine.")
        except OSError:
            print("❌ SpaCy model not found. Please run: python -m spacy download en_core_web_sm")
            self.nlp = None

    # In policy_engine.py

    def delexicalize(self, query: str, plan: Dict[str, Any]) -> Dict[str, Any]:
        user_pattern = query
        plan_template = copy.deepcopy(plan)
        params = plan_template.get("parameters", {})

        # --- Phase 1: Use Regex for simple, predictable entities ---
        # 1. Replace known programs
        for prog in self.known_programs:
            prog_pattern = re.compile(r'\b' + re.escape(prog) + r'\b', re.IGNORECASE)
            if prog_pattern.search(user_pattern):
                user_pattern = prog_pattern.sub('{PROGRAM}', user_pattern)
            for key, value in params.items():
                if isinstance(value, str) and prog_pattern.search(value):
                    params[key] = '{PROGRAM}'

        # --- START OF NEWLY ADDED BLOCK ---
        # 2. Replace year levels (e.g., "2", "3rd year")
        year_pattern = re.compile(r'\b\d(?:st|nd|rd|th)?\s*year\b|\b\d\b', re.IGNORECASE)
        if year_pattern.search(user_pattern):
            user_pattern = year_pattern.sub('{YEAR}', user_pattern)
        for key, value in params.items():
            # Check for the specific parameter name and that it has a value
            if key == "year_level" and value:
                params[key] = '{YEAR}'
        # --- END OF NEWLY ADDED BLOCK ---

        # --- Phase 2: Use SpaCy for robust Person Name Recognition ---
        if self.nlp:
            doc = self.nlp(user_pattern)
            for ent in doc.ents:
                if ent.label_ == "PERSON":
                    user_pattern = user_pattern.replace(ent.text, '{PERSON_NAME}')

        for key, value in params.items():
            if "name" in key and isinstance(value, str) and value:
                params[key] = '{PERSON_NAME}'
        
        return {
            "user_pattern": user_pattern,
            "plan_template": plan_template
        }
    



    def get_intent(self, query: str) -> Optional[str]:
        """
        A fast, local, rule-based intent classifier.
        This is used by the ExampleManager for its Tier 1 retrieval.
        """
        q_lower = query.lower().strip()

        # --- Tier 1: Direct, high-confidence matches ---

        # get_person_profile
        if re.search(r'^(who is|what is|profile of|tell me about)\b', q_lower):
            return "get_person_profile"

        # get_person_schedule
        if re.search(r'\b(schedule|class|when is|classes)\b', q_lower):
            return "get_person_schedule"
        
        # get_student_grades
        if re.search(r'\b(grades|gwa|scores|class standing)\b', q_lower):
            return "get_student_grades"

        # query_curriculum
        if re.search(r'\b(curriculum|subjects|what subjects)\b', q_lower):
            return "query_curriculum"

        # find_people (group)
        if re.search(r'\b(list all|how many|find all|show all)\b', q_lower):
            if re.search(r'\b(students|faculty|teachers)\b', q_lower):
                return "find_people"

        # answer_conversational_query
        if q_lower in ['hi', 'hello', 'hey', 'thanks', 'thank you', 'ok', 'okay']:
            return "answer_conversational_query"

        # --- Tier 2: Fallback (if no high-confidence match) ---
        # If it *looks* like a person query, guess get_person_profile
        if len(q_lower.split()) <= 4:
            # This is a weak heuristic, but it's our best local guess
            return "get_person_profile" 

        # If we have no idea, return None and let the main LLM planner decide
        return None

    