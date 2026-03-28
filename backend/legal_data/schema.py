from pydantic import BaseModel
from enum import Enum
from typing import Literal, List, Optional
from datetime import date

class LegalAct(str, Enum):
    IPC = "IPC"
    BNS = "BNS"
    IT_ACT = "IT_ACT"
    DPDP_ACT = "DPDP_ACT"

class LegalSection(BaseModel):
    ipc_section: Optional[str] = None
    bns_section: Optional[str] = None
    title: str
    description: str
    punishment: str
    act: LegalAct
    status: Literal["active", "replaced", "amended"]
    effective_date: date
    keywords: List[str]
    severity: Literal["bailable", "non-bailable", "cognizable"]

    @property
    def display_reference(self) -> str:
        if self.status == "active" and self.bns_section:
            return self.bns_section
        elif self.bns_section and self.ipc_section:
            return f"{self.bns_section} (formerly {self.ipc_section})"
        return self.ipc_section or self.bns_section or ""

class BNSMapping(BaseModel):
    ipc_section: str
    bns_section: str
    title: str
    change_type: Literal["renumbered", "amended", "merged", "new_provision"]
    notes: str
