import pandas as pd
import re
import json
import os
import numpy as np
import pdfplumber as pl 

with pl.open(r'D:\Google\JobMatch\data2\cv-complex.pdf') as pdf:
    text = "\n" .join(page.extract_text() for page in pdf.pages)
text = re.sub(r'\n+', '\n', text)
text = re.sub(r'[^\x00-\x7F]+', ' ', text)
# print (text)
sections = re.split(r'\n(?=[A-Z\s]{5,})', text)
section_map = {s.split('\n')[0].strip(): '\n'.join(s.split('\n')[1:]) for s in sections}


def extract_name_profile(lines):
    name = lines[0].strip() if lines[0].isupper() and len(lines[0].split()) <= 4 else None
    profile_lines = []
    for line in lines[1:]:
        if re.match(r'^[A-Z\s]{4,}$', line):  # Section title
            break
        profile_lines.append(line)
    profile = ' '.join(profile_lines).strip()
    return name, profile


def extract_contact(text):
    email = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    phone = re.search(r'(\+?\d{1,3}[-\s]?\(?\d{2,4}\)?[-\s]?\d{3,4}[-\s]?\d{3,4})', text)
    website = re.search(r'(www\.[^\s]+)', text)
    address = re.search(r'\d{1,5}[\w\s.,\-]+(?:Street|St|Avenue|Ave|City|Town)', text, re.IGNORECASE)

    return {
        "phone": phone.group(0) if phone else None,
        "email": email.group(0) if email else None,
        "website": website.group(0) if website else None,
        "address": address.group(0) if address else None,
    }


def extract_list_section(text_section):
    items = re.split(r',|\n|\r|•|-', text_section)
    items = [item.strip() for item in items if len(item.strip()) > 1]
    return items


def extract_education(section_text):
    edu_entries = []
    blocks = re.split(r'\n{2,}', section_text) 

    for block in blocks:
        degree = re.search(r'(Bachelor|Master|PhD)[^,\n]+', block, re.IGNORECASE)
        institution = re.search(r'(?i)(University|College|Academy)[^\n]*', block)
        years = re.search(r'\d{4} ?- ?(?:PRESENT|\d{4})', block)
        gpa = re.search(r'GPA[: ]?(\d\.\d+)', block)

        if institution and degree:
            edu_entries.append({
                "institution": institution.group(0).strip(),
                "degree": degree.group(0).strip(),
                "gpa": gpa.group(1) if gpa else None,
                "years": years.group(0) if years else None
            })

    return edu_entries


def extract_experience(section_text):
    exp_entries = []
    blocks = re.split(r'\n{2,}', section_text)

    for block in blocks:
        company = re.search(r'(Inc|LLC|Studio|Corp|Company|Group)[^\n]*', block, re.IGNORECASE)
        title = re.search(r'(Manager|Specialist|Engineer|Lead|Director|Consultant)[^\n]*', block, re.IGNORECASE)
        years = re.search(r'\d{4} ?- ?(?:PRESENT|\d{4})', block)

        if company and title:
            exp_entries.append({
                "company": company.group(0).strip(),
                "title": title.group(0).strip(),
                "years": years.group(0) if years else None
            })
    return exp_entries


def extract_references(section_text):
    refs = []
    blocks = re.split(r'\n{2,}', section_text)

    for block in blocks:
        name = re.search(r'^[A-Z][a-z]+\s[A-Z][a-z]+', block)
        role = re.search(r'(CEO|CTO|Manager|Director|Lead)[^\n]*', block)
        company = re.search(r'(Inc|LLC|Studio|Corp|Company|Group)[^\n]*', block)
        phone = re.search(r'(\+?\d{1,3}[-\s]?\(?\d{2,4}\)?[-\s]?\d{3,4}[-\s]?\d{3,4})', block)
        email = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', block)

        if name:
            refs.append({
                "name": name.group(0).strip(),
                "role": role.group(0).strip() if role else None,
                "company": company.group(0).strip() if company else None,
                "phone": phone.group(0) if phone else None,
                "email": email.group(0) if email else None
            })
    return refs

name, profile = extract_name_profile(text)
contact = extract_contact(text)
skills = extract_list_section(section_map["SKILLS"])
languages = extract_list_section(section_map["LANGUAGES"])
education = extract_education(section_map["EDUCATION"])
experience = extract_experience(section_map["EXPERIENCE"])
reference = extract_references(section_map["REFERENCE"])


cv_data = {
    "name": name,
    "profile": profile,
    "contact": contact,
    "skills": skills,
    "languages": languages,
    "education": education,
    "experience": experience,
    "reference": reference
}
import json
with open('parsed_cv.json', 'w') as f:
    json.dump(cv_data, f, indent=2)
