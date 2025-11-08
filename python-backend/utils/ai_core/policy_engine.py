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

    # In backend/utils/ai_core/policy_engine.py

# --- REPLACE THE ENTIRE delexicalize METHOD WITH THIS ---

    def delexicalize(self, query: str, plan: Dict[str, Any]) -> Dict[str, Any]:
        """
        [UPGRADED] Dynamically delexicalizes a query based on the
        parameters in the provided plan.
        """
        user_pattern = query
        plan_template = copy.deepcopy(plan)
        params = plan_template.get("parameters", {})

        if not params:
            return {
                "user_pattern": user_pattern,
                "plan_template": plan_template
            }

        # --- DYNAMIC REPLACEMENT LOGIC ---
        # Create a list of (value, placeholder) tuples, sorted by length
        # so we replace "BS Computer Science" before "BSCS"
        replacements = []
        for key, value in params.items():
            if not isinstance(value, str) and not isinstance(value, int):
                continue # Skip lists, dicts, etc.
            
            val_str = str(value).strip()
            if not val_str: # Skip empty strings
                continue

            # 1. Create the placeholder (e.g., {PROGRAM}, {PERSON_NAME})
            placeholder = f"{{{key.upper()}}}" 
            
            # 2. Add the value and placeholder to our list
            replacements.append((val_str, placeholder))
            
            # 3. Also replace the value in the plan_template
            params[key] = placeholder

        # Sort by length of the value (longest first) to avoid partial-word bugs
        replacements.sort(key=lambda x: len(x[0]), reverse=True)

        # 4. Loop through and replace all occurrences in the user_pattern
        for value, placeholder in replacements:
            # Use regex for whole-word, case-insensitive replacement
            try:
                pattern = re.compile(r'\b' + re.escape(value) + r'\b', re.IGNORECASE)
                user_pattern = pattern.sub(placeholder, user_pattern)
            except re.error:
                # Fallback for complex strings that break regex
                user_pattern = user_pattern.replace(value, placeholder)
        
        # --- END DYNAMIC LOGIC ---

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

    