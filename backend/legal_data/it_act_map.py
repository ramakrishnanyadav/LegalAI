from .schema import LegalSection, LegalAct
from datetime import date
from typing import Dict

IT_ACT_SECTIONS = {
    "IT Act 43": LegalSection(
        title="Penalty and compensation for damage to computer, computer system, etc.",
        description="Unauthorized access, download, or damage to any computer or computer system.",
        punishment="Compensation to person affected.",
        act=LegalAct.IT_ACT,
        status="active",
        effective_date=date(2000, 10, 17),
        keywords=["hacking", "unauthorized access", "data theft", "virus"],
        severity="non-bailable"
    ),
    "IT Act 66": LegalSection(
        title="Computer related offences",
        description="If any person, dishonestly or fraudulently, does any act referred to in section 43.",
        punishment="Up to 3 years imprisonment or fine up to 5 lakh rupees.",
        act=LegalAct.IT_ACT,
        status="active",
        effective_date=date(2000, 10, 17),
        keywords=["fraud", "computer offence", "data theft"],
        severity="cognizable"
    ),
    "IT Act 66C": LegalSection(
        title="Punishment for identity theft",
        description="Fraudulent or dishonest use of electronic signature, password or any other unique identification feature.",
        punishment="Up to 3 years imprisonment and fine up to 1 lakh rupees.",
        act=LegalAct.IT_ACT,
        status="active",
        effective_date=date(2008, 10, 27),
        keywords=["identity theft", "password theft", "impersonation"],
        severity="cognizable"
    ),
    "IT Act 66D": LegalSection(
        title="Punishment for cheating by personation by using computer resource",
        description="Cheating by personation over a computer system or network.",
        punishment="Up to 3 years imprisonment and fine up to 1 lakh rupees.",
        act=LegalAct.IT_ACT,
        status="active",
        effective_date=date(2008, 10, 27),
        keywords=["phishing", "impersonation", "fake profile", "fraud"],
        severity="cognizable"
    ),
    "IT Act 66E": LegalSection(
        title="Punishment for violation of privacy",
        description="Capturing, publishing or transmitting the image of a private area of any person without consent.",
        punishment="Up to 3 years imprisonment or fine up to 2 lakh rupees, or both.",
        act=LegalAct.IT_ACT,
        status="active",
        effective_date=date(2008, 10, 27),
        keywords=["privacy violation", "hidden camera", "non-consensual imagery"],
        severity="bailable"
    ),
    "IT Act 67": LegalSection(
        title="Publishing of information which is obscene in electronic form",
        description="Publishing or transmitting obscene material in electronic form.",
        punishment="First conviction: up to 3 years. Second conviction: up to 5 years.",
        act=LegalAct.IT_ACT,
        status="active",
        effective_date=date(2000, 10, 17),
        keywords=["obscene", "pornography", "cyber crime"],
        severity="cognizable"
    ),
    "IT Act 66A": LegalSection(
        title="Punishment for sending offensive messages",
        description="Struck down by the Supreme Court in Shreya Singhal case. No longer valid law.",
        punishment="None (Struck down)",
        act=LegalAct.IT_ACT,
        status="replaced",
        effective_date=date(2000, 10, 17),
        keywords=["offensive message", "social media", "freedom of speech"],
        severity="bailable"
    ),
}

# Add CERT-In/DPDP overlaps here if requested later
