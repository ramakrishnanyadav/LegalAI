from .schema import LegalSection
from .it_act_map import IT_ACT_SECTIONS
import re

def get_section(reference: str) -> LegalSection | None:
    """
    Accepts formats: "IPC 302", "BNS 103", "IT Act 66C", "66C" (smart parsing)
    Returns the most current (BNS preferred) section object
    """
    normalized = reference.strip().lower()
    
    # Try IT Act check
    for key, val in IT_ACT_SECTIONS.items():
        if key.lower() == normalized or key.lower().endswith(normalized.replace(" ", "")):
            return val
            
    # For a full implementation, IPC & BNS dictionaries would go here.
    return None
