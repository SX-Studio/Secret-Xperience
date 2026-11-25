'use client'
import { useState } from 'react'
import Link from 'next/link'

// ─── Data ────────────────────────────────────────────────────────────────────

type StatusType = 'decriminalized' | 'regulated' | 'tolerated' | 'nordic' | 'abolitionist'

const STATUS_META: Record<StatusType, { label: string; color: string; bg: string; icon: string; desc: string }> = {
  decriminalized: { label: 'Decriminalized', color: '#26d4a0', bg: 'rgba(38,212,160,0.1)', icon: 'ti-circle-check', desc: 'Sex work removed from the penal code. Workers have full labor rights.' },
  regulated:      { label: 'Legal & Regulated', color: '#4b9fff', bg: 'rgba(75,159,255,0.1)', icon: 'ti-shield-check', desc: 'Legal under a licensing or registration framework.' },
  tolerated:      { label: 'Tolerated', color: '#f5c542', bg: 'rgba(245,197,66,0.1)', icon: 'ti-info-circle', desc: 'Neither explicitly legal nor illegal at national level.' },
  nordic:         { label: 'Nordic Model', color: '#f5944a', bg: 'rgba(245,148,74,0.1)', icon: 'ti-alert-triangle', desc: 'Clients criminalized; selling sex is not an offence.' },
  abolitionist:   { label: 'Abolitionist', color: '#e05252', bg: 'rgba(224,82,82,0.1)', icon: 'ti-ban', desc: 'Policy aims to eliminate sex work; legal status ambiguous.' },
}

interface SupportOrg { name: string; type: string; phone?: string; email?: string; website?: string; note: string }
interface Section { title: string; icon: string; items: { heading: string; body: string }[] }
interface CountryData {
  name: string; flag: string; code: string; status: StatusType; statusYear: number
  summary: string; sections: Section[]; support: SupportOrg[]
}

const COUNTRIES: Record<string, CountryData> = {
  BE: {
    name: 'Belgium', flag: '🇧🇪', code: 'BE', status: 'decriminalized', statusYear: 2022,
    summary: 'Belgium enacted one of Europe\'s most progressive sex work reforms in 2022, fully removing sex work from the penal code and granting workers access to labor rights, social security, and legal protections.',
    sections: [
      {
        title: 'Legal Framework', icon: 'ti-scale',
        items: [
          { heading: 'Penal Code Reform (2022)', body: 'Since June 1, 2022 sex work is no longer a criminal offence under the Belgian penal code. Third parties may facilitate sex work provided there is no exploitation, coercion, or trafficking.' },
          { heading: 'Labor Law', body: 'Sex workers may enter into employee contracts with recognized employers. They are entitled to social security coverage, pension contributions, health insurance, and unemployment benefits — the same as any other profession.' },
          { heading: 'Right of Refusal', body: 'The right to refuse any client or any sexual act at any time is explicitly protected by law. Contracts may not override this right, and enforcement is backed by criminal sanctions.' },
          { heading: 'Third-Party Facilitation', body: 'Operators and managers of sex work venues may operate legally if they hold a municipal permit, respect labor law, and demonstrate no exploitation. Exploitative facilitation remains a serious criminal offence.' },
        ]
      },
      {
        title: 'For Sex Workers', icon: 'ti-user',
        items: [
          { heading: 'Registration — Self-Employed', body: 'Self-employed sex workers must register with the Crossroads Bank for Enterprises (CBE / KBO) and obtain a NACE code 96.09 or similar. This gives access to social security as a self-employed person (NSSSO / INASTI).' },
          { heading: 'Registration — Employee', body: 'Workers employed by a recognized venue register through their employer. The employer handles ONSS/RSZ contributions. A recognized employment contract is mandatory.' },
          { heading: 'Taxation', body: 'Income tax (Personenbelasting/IPP) and VAT obligations apply as with any profession. Self-employed workers file annual returns. Employees receive payslips. Keep invoices and records.' },
          { heading: 'Health & Insurance', body: 'Access to RIZIV/INAMI health insurance is granted upon registration. There are no mandatory STI tests, but regular testing is strongly recommended. Occupational health services apply.' },
          { heading: 'Migrant Workers (EU/EEA)', body: 'Citizens of EU/EEA member states have the right to work in Belgium without a permit. They must register with the municipality (commune) within 3 months of arrival.' },
          { heading: 'Migrant Workers (Non-EU)', body: 'Non-EU nationals require a combined permit (combined work and residence permit, "gecombineerde vergunning"). Working without a valid permit carries serious legal risks.' },
        ]
      },
      {
        title: 'For Employers & Venues', icon: 'ti-building',
        items: [
          { heading: 'Municipal Permit', body: 'Premises where sex work takes place require a permit from the local municipality. Requirements vary but typically include a health & safety assessment, anti-trafficking plan, and compliance with labor law.' },
          { heading: 'Employer Obligations', body: 'Employers must provide written employment contracts, pay ONSS/RSZ contributions, ensure workplace health & safety, respect the right of refusal, and not retain workers\' documents or income.' },
          { heading: 'Anti-Exploitation Compliance', body: 'Any form of coercion, debt bondage, document confiscation, or taking a disproportionate share of income constitutes exploitation and is prosecuted under human trafficking law (Art. 433 quinquies Strafwetboek).' },
        ]
      },
      {
        title: 'Health & Safety', icon: 'ti-heart-rate-monitor',
        items: [
          { heading: 'Occupational Health', body: 'As a recognized profession, sex workers are entitled to occupational health services. Employers must conduct risk assessments and ensure a safe working environment.' },
          { heading: 'STI Testing', body: 'No mandatory testing frequency, but quarterly STI screening is strongly recommended. Free or low-cost testing is available through Violett, Espace P, and UTSOPI-affiliated services.' },
          { heading: 'PrEP Access', body: 'PrEP (pre-exposure prophylaxis for HIV prevention) is reimbursed by RIZIV/INAMI for sex workers. Consult a GP or sexual health clinic.' },
          { heading: 'Mental Health', body: 'Psychological support is available through Espace P, Violett, and the broader mental health system. You are entitled to see a psychologist under standard health insurance.' },
        ]
      },
      {
        title: 'Migrant Workers', icon: 'ti-world',
        items: [
          { heading: 'EU/EEA Citizens', body: 'Free to work. Must register with the local commune within 90 days. Access to social security applies once registered and working.' },
          { heading: 'Non-EU Citizens', body: 'A combined permit is required. Applications are made through the relevant regional authority (VDAB, Actiris, FOREM). Processing takes time; working without a permit is illegal and dangerous.' },
          { heading: 'Undocumented Workers', body: 'Undocumented people are in a particularly vulnerable position. UTSOPI, Payoke (Antwerp), Sürya (Brussels), and CIRE can provide confidential support without reporting obligation.' },
          { heading: 'Language Rights', body: 'You have the right to information and contracts in a language you understand. Organizations like Utsopi provide multilingual support.' },
        ]
      },
      {
        title: 'Anti-Trafficking', icon: 'ti-shield',
        items: [
          { heading: 'Recognising Trafficking', body: 'Indicators include: document confiscation, being controlled by a third party, not being free to leave, debt bondage, working without pay. If you are in this situation, you can seek help confidentially.' },
          { heading: 'Where to Get Help', body: 'Payoke (Antwerp): +32 3 201 16 90. Sürya (Brussels/Wallonia): +32 2 534 18 00. CIRE: supports undocumented migrants. Police can be contacted via 101 (confidential victim support available).' },
          { heading: 'Legal Protection for Victims', body: 'Trafficking victims who cooperate with authorities may receive a temporary residence permit and access to shelter, legal aid, and psychological support through the three recognised reception centres.' },
        ]
      },
    ],
    support: [
      { name: 'Utsopi', type: 'Union', phone: '+32 2 512 90 21', email: 'info@utsopi.be', website: 'https://utsopi.be', note: 'Belgian sex worker union — rights, advocacy, peer support.' },
      { name: 'Espace P', type: 'Social Support', phone: '+32 2 219 98 74', website: 'https://www.espace-p.be', note: 'Support in Brussels & Wallonia — outreach, social work, healthcare.' },
      { name: 'Violett', type: 'Health', phone: '+32 2 292 25 40', website: 'https://violett.be', note: 'Healthcare, counseling, and STI testing for sex workers.' },
      { name: 'Payoke', type: 'Anti-Trafficking', phone: '+32 3 201 16 90', website: 'https://payoke.be', note: 'Support for trafficking victims in Antwerp region.' },
      { name: 'Sürya', type: 'Anti-Trafficking', phone: '+32 2 534 18 00', website: 'https://surya.be', note: 'Trafficking victim support in Brussels and Wallonia.' },
    ]
  },

  NL: {
    name: 'Netherlands', flag: '🇳🇱', code: 'NL', status: 'regulated', statusYear: 2000,
    summary: 'The Netherlands lifted its brothel ban in 2000, making sex work legal under a municipal licensing framework. Workers have access to labor protections, though the regulatory landscape varies significantly by municipality.',
    sections: [
      {
        title: 'Legal Framework', icon: 'ti-scale',
        items: [
          { heading: 'Brothel Ban Lifted (2000)', body: 'The ban on brothels (bordeelverbod) was lifted on 1 October 2000. Sex work between consenting adults is legal. Municipalities are responsible for issuing licenses and setting local regulations.' },
          { heading: 'Municipal Licensing', body: 'Venue operators must hold a local operating license (exploitatievergunning). Requirements, the number of licenses available, and designated areas vary per city. Amsterdam, Rotterdam, The Hague, and Utrecht each have distinct systems.' },
          { heading: 'Escort Services', body: 'Escort agencies and independent escort work are legal. Some municipalities require registration of escort operators. Individual sex workers working independently do not need a permit in most cases.' },
          { heading: 'WRPB — Proposed National Law', body: 'The Wet regulering prostitutie en bestrijding misstanden seksbranche (WRPB) has been in parliamentary discussion for over a decade. If enacted, it would introduce a national licensing system and uniform standards. Status as of 2025: not yet in force.' },
        ]
      },
      {
        title: 'For Sex Workers', icon: 'ti-user',
        items: [
          { heading: 'Employee or Self-Employed', body: 'Sex workers can be employed by a licensed venue or operate as self-employed (ZZP). Employees are entitled to the full Dutch labor code including minimum wage, sick pay, and pension (via employer).' },
          { heading: 'Registration — Self-Employed', body: 'Self-employed workers register with the Kamer van Koophandel (KVK). A BTW (VAT) number is required once turnover exceeds the threshold. Income tax is filed annually via the Belastingdienst.' },
          { heading: 'Taxation', body: 'Income from sex work is taxable. Self-employed workers pay income tax and social premiums (ZVW health insurance, AOW pension). Accurate bookkeeping is important.' },
          { heading: 'Health Insurance', body: 'Basic health insurance (basisverzekering) is mandatory for all residents. Sex workers are entitled to the same healthcare as any other worker. The GGD provides free or subsidized STI testing.' },
          { heading: 'Migrant Workers (EU/EEA)', body: 'EU/EEA citizens may work freely. After 3 months you must register at your municipality (DigiD, BSN number). Access to health insurance and social security requires registration.' },
          { heading: 'Migrant Workers (Non-EU)', body: 'Non-EU nationals need a work permit (TWV) and residence permit. Working undocumented is illegal and exposes workers to exploitation and deportation risk.' },
        ]
      },
      {
        title: 'For Employers & Venues', icon: 'ti-building',
        items: [
          { heading: 'Operating License', body: 'Required from the local municipality. Typically includes background checks, building safety assessments, fire safety compliance, and anti-trafficking declarations.' },
          { heading: 'Worker Rights Obligations', body: 'Licensed venues must ensure workers are not coerced, may leave freely, keep their earnings and documents, and have access to health services.' },
          { heading: 'Window Prostitution', body: 'Only permitted in municipalities with designated window zones (tippelzones or raamprostitutie areas). Amsterdam has greatly reduced window prostitution since 2008 (Project 1012).' },
        ]
      },
      {
        title: 'Health & Safety', icon: 'ti-heart-rate-monitor',
        items: [
          { heading: 'STI Testing', body: 'The GGD (Municipal Health Service) provides free STI testing for sex workers at clinics across the country. No mandatory frequency, but quarterly testing is standard practice.' },
          { heading: 'PrEP Access', body: 'PrEP is available via GGD clinics and sexual health centres. For sex workers at higher risk, PrEP is reimbursed under certain conditions.' },
          { heading: 'Condom Use', body: 'Condom use is not legally mandated but is strongly recommended and widely used. P&G069 and SoaAids Nederland provide condom packages and health advice.' },
          { heading: 'Mental Health', body: 'Psychological support is available through P&G069 (Amsterdam), GGD services, and de Waag. Peer support is offered through Proud (national sex worker collective).' },
        ]
      },
      {
        title: 'Migrant Workers', icon: 'ti-world',
        items: [
          { heading: 'EU/EEA Citizens', body: 'Full right to work. Must register with the municipality and obtain a BSN number to access healthcare and tax system. Registration is straightforward at the Gemeente.' },
          { heading: 'Non-EU Citizens', body: 'Work permit required. Limited pathways for non-EU sex workers to work legally. Contact Comensha (national coordination centre) for information.' },
          { heading: 'Undocumented Workers', body: 'Highly vulnerable. HVO Querido, P&G069, and Comensha can provide confidential support. Police in the Netherlands have a "no-reprisal" reporting mechanism for victims of crime.' },
        ]
      },
      {
        title: 'Anti-Trafficking', icon: 'ti-shield',
        items: [
          { heading: 'Reporting', body: 'Report suspicions to CoMensha (Coördinatiecentrum Mensenhandel): 033 448 11 86, or the police (0900-8844 or anonymous 0800-7000 Meld Misdaad Anoniem).' },
          { heading: 'Victim Support', body: 'Recognised victims of trafficking are entitled to a B8/3 residence permit, access to shelters (La Strada), and legal aid.' },
          { heading: 'Inspection Bodies', body: 'The Dutch Labour Authority (NLA) and police jointly inspect licensed venues. Trafficking violations are prosecuted under Art. 273f of the Wetboek van Strafrecht.' },
        ]
      },
    ],
    support: [
      { name: 'SoaAids Nederland', type: 'STI & Prevention', phone: '020 689 2577', website: 'https://soaaids.nl', note: 'Free STI testing, PrEP, sexual health information.' },
      { name: 'P&G069 (Prostitutie & Gezondheid)', type: 'Sex Worker Health', phone: '020 626 2000', website: 'https://pg069.nl', note: 'Specialized healthcare for sex workers in Amsterdam.' },
      { name: 'GGD Amsterdam', type: 'Public Health', phone: '020 555 5555', website: 'https://ggd.amsterdam.nl', note: 'Free STI testing, vaccinations, mental health support.' },
      { name: 'Proud', type: 'Rights & Advocacy', email: 'info@proud.nl', website: 'https://www.proud.nl', note: 'National sex worker collective — peer support and advocacy.' },
      { name: 'CoMensha', type: 'Anti-Trafficking', phone: '033 448 11 86', website: 'https://comensha.nl', note: 'National coordination centre for trafficking victims.' },
    ]
  },

  DE: {
    name: 'Germany', flag: '🇩🇪', code: 'DE', status: 'regulated', statusYear: 2017,
    summary: 'Sex work is legal in Germany under a comprehensive regulatory framework established by the Prostitutionsschutzgesetz (ProstSchG) in 2017. Registration is mandatory for workers and operators alike.',
    sections: [
      {
        title: 'Legal Framework', icon: 'ti-scale',
        items: [
          { heading: 'ProstSchG — Prostitution Protection Act (2017)', body: 'Effective July 1, 2017. Introduced mandatory registration for sex workers and operators, required health counseling, and strengthened protections against exploitation.' },
          { heading: 'ProstG (2002)', body: 'The earlier Prostitutionsgesetz made sex work contracts legally enforceable. Workers have the right to sue for payment. This protection remains in force.' },
          { heading: 'Client Criminalization', body: 'Clients who knowingly engage with a coerced or trafficked person face criminal prosecution (§ 232a StGB). Consensual adult sex work between registered parties remains legal.' },
          { heading: 'Condom Requirement', body: 'Since 2017, offering or performing sex without a condom ("Schutzlosverkehr") is prohibited for both workers and clients. Violators can be fined.' },
        ]
      },
      {
        title: 'For Sex Workers', icon: 'ti-user',
        items: [
          { heading: 'Mandatory Registration (Anmeldebescheinigung)', body: 'Every sex worker must register with the local Ordnungsamt (public order authority). You may use a pseudonym. The certificate is issued with a photo and is valid for 2 years. Registration costs vary by city.' },
          { heading: 'Health Counseling', body: 'Before receiving your Anmeldebescheinigung, you must attend a mandatory health counseling session (§10 ProstSchG) at the local Gesundheitsamt (health authority). This is free and confidential.' },
          { heading: 'Employee or Self-Employed', body: 'You may work as an employee (Arbeitnehmer) with a written contract, or as self-employed (Selbstständige). Employees are entitled to minimum wage, sick pay, and statutory pension.' },
          { heading: 'Taxation', body: 'All income is taxable. Self-employed workers pay Einkommensteuer (income tax) and potentially Umsatzsteuer (VAT). File a Steuererklärung annually. Finanzamt offices can advise.' },
          { heading: 'Health Insurance', body: 'Statutory health insurance (Krankenversicherung) is required. Employees are covered through their employer. Self-employed workers must arrange their own — contact a Krankenkasse.' },
          { heading: 'Migrant Workers (EU/EEA)', body: 'EU/EEA citizens have freedom of movement. Register at the local Einwohnermeldeamt (residents registration office). Access to statutory social insurance follows automatically.' },
          { heading: 'Migrant Workers (Non-EU)', body: 'Non-EU nationals need a residence and work permit. Working without papers is illegal and dangerous. Madonna e.V. and Hydra e.V. provide confidential advice in multiple languages.' },
        ]
      },
      {
        title: 'For Operators & Venues', icon: 'ti-building',
        items: [
          { heading: 'Erlaubnis (Operating License)', body: 'Venue operators must apply for a Betriebserlaubnis from the local authority. Requirements include: premises meeting health & safety standards, anti-trafficking safeguards, and the operator passing a reliability check (Zuverlässigkeitsprüfung).' },
          { heading: 'Prohibited Practices', body: 'Operators may not: require workers to perform specific acts, set minimum service quotas, prohibit condom use, retain workers\' documents, or take a disproportionate share of earnings.' },
          { heading: 'Record-Keeping', body: 'Operators must verify and record workers\' Anmeldebescheinigungen and may not knowingly employ unregistered workers.' },
        ]
      },
      {
        title: 'Health & Safety', icon: 'ti-heart-rate-monitor',
        items: [
          { heading: 'Health Counseling at Registration', body: 'Mandatory and free. Covers STI prevention, condom use, PrEP, vaccination, and where to access healthcare.' },
          { heading: 'STI Testing', body: 'Not legally mandated after registration, but regular testing is strongly advised. Public Gesundheitsämter often provide free or low-cost testing. Madonna e.V. and Hydra e.V. offer outreach services.' },
          { heading: 'PrEP Access', body: 'PrEP is available on prescription. Covered by statutory health insurance for people at significant risk. Sexual health centres can prescribe.' },
          { heading: 'Condom Law', body: 'Offering or purchasing "sex without condom" (AO — ohne) is illegal under §32 ProstSchG. Both parties may be fined.' },
        ]
      },
      {
        title: 'Migrant Workers', icon: 'ti-world',
        items: [
          { heading: 'EU/EEA Citizens', body: 'Right to work freely. Register at the Einwohnermeldeamt upon arrival. Then register as a sex worker at the Ordnungsamt.' },
          { heading: 'Non-EU Citizens', body: 'Need a residence permit with a work permit. Sex work is not listed as a permitted occupation in most visa categories. Legal pathways are very limited for non-EU nationals.' },
          { heading: 'Language Support', body: 'Madonna e.V. (Cologne/Bonn), Hydra e.V. (Berlin), Doña Carmen (Frankfurt), and TAMPEP offer multilingual outreach and support.' },
          { heading: 'Undocumented Workers', body: 'The most vulnerable group. Confidential advice is available from Madonna e.V. and Hydra e.V. Working without a permit is illegal, but support organisations do not report to immigration authorities.' },
        ]
      },
      {
        title: 'Anti-Trafficking', icon: 'ti-shield',
        items: [
          { heading: 'Reporting', body: 'Police emergency: 110. Specialist support: Fachberatungsstellen (specialist counselling centres) in each Bundesland. National list available from the Bundesweiter Koordinierungskreis gegen Menschenhandel (KOK).' },
          { heading: 'Victim Protections', body: 'Recognised trafficking victims may receive a temporary residence permit, shelter, legal aid, and a reflection period before having to decide whether to cooperate with prosecution.' },
          { heading: 'KOK — National Network', body: 'KOK (Bundesweiter Koordinierungskreis gegen Menschenhandel) coordinates specialist support organisations across Germany. Website: kok-gegen-menschenhandel.de' },
        ]
      },
    ],
    support: [
      { name: 'Madonna e.V.', type: 'Health & Counselling', phone: '+49 221 992 3696', website: 'https://madonna-ev.de', note: 'Health counselling, STI testing, social support. Cologne/Bonn area.' },
      { name: 'Hydra e.V.', type: 'Rights & Advocacy', phone: '+49 30 284 4596', website: 'https://hydra-berlin.de', note: 'Legal advice, health information, peer support. Berlin.' },
      { name: 'Doña Carmen e.V.', type: 'Support & Rights', phone: '+49 69 291 564', website: 'https://donacarmen.de', note: 'Outreach, social work, rights advocacy. Frankfurt.' },
      { name: 'TAMPEP International', type: 'Migrant Workers', website: 'https://tampep.eu', note: 'European network supporting migrant sex workers.' },
      { name: 'KOK', type: 'Anti-Trafficking', website: 'https://kok-gegen-menschenhandel.de', note: 'National coordination against human trafficking.' },
    ]
  },

  FR: {
    name: 'France', flag: '🇫🇷', code: 'FR', status: 'nordic', statusYear: 2016,
    summary: 'France adopted the Nordic Model in 2016: selling sex is not an offence, but buying sex is criminalized. Third-party facilitation (proxénétisme) remains a serious criminal offence. Workers face increased vulnerability due to client criminalization pushing the industry further underground.',
    sections: [
      {
        title: 'Legal Framework', icon: 'ti-scale',
        items: [
          { heading: 'Client Criminalization (Loi du 13 avril 2016)', body: 'Since April 13, 2016, paying for sex is a criminal offence (contravention de 5e classe). First offence: up to €1,500 fine. Repeat offence: up to €3,750 fine. Offence is listed on the criminal record.' },
          { heading: 'Status of Sex Workers', body: 'Selling sex is not a criminal offence in France. You cannot be arrested or prosecuted for performing sex work. However, many associated activities remain legally constrained.' },
          { heading: 'Proxénétisme (Third-Party Facilitation)', body: 'Proxénétisme (pimping) remains a criminal offence. This includes renting premises knowing they are used for sex work. This makes safe, shared indoor working very difficult legally.' },
          { heading: 'Street Work Regulations', body: 'Public solicitation (racolage) was decriminalized in 2016 when the Nordic model was adopted. However, local ordinances and police behaviour often create de facto restrictions on where workers can work safely.' },
          { heading: 'Parcours de Sortie (Exit Programme)', body: 'The 2016 law created a state-funded exit programme. Workers who wish to leave can receive a monthly allowance (about €330), a temporary residence permit (for non-EU nationals), and support from approved associations.' },
        ]
      },
      {
        title: 'For Sex Workers', icon: 'ti-user',
        items: [
          { heading: 'Legal Status of Workers', body: 'Sex work is not recognized as a profession in France. Workers cannot register as self-employed sex workers, nor enter labor contracts. Income from sex work is technically taxable but extremely difficult to declare in practice.' },
          { heading: 'Social Protection', body: 'Limited access to social protection. Workers may access universal health coverage (PUMa/CSS — Complémentaire Santé Solidaire) regardless of immigration or professional status.' },
          { heading: 'AME (Aide Médicale d\'État)', body: 'Undocumented workers who have been in France for at least 3 months can apply for AME, which covers most healthcare costs. Contact a PASS (Permanence d\'Accès aux Soins de Santé) at a public hospital.' },
          { heading: 'Migrant Workers (EU/EEA)', body: 'EU/EEA citizens have free movement rights. Access to public health services is possible with EHIC card or through registration. However, lack of formal employment status limits social security access.' },
          { heading: 'Migrant Workers (Non-EU)', body: 'Extremely vulnerable. The exit programme provides a temporary permit, but working undocumented is dangerous. Médecins du Monde and Bus des Femmes offer confidential support.' },
        ]
      },
      {
        title: 'For Operators', icon: 'ti-building',
        items: [
          { heading: 'Venue Operation Risks', body: 'Renting premises to someone you know is a sex worker (or should know) can constitute proxénétisme. This severely restricts access to safe indoor working spaces.' },
          { heading: 'Online Platforms', body: 'Platforms facilitating sex work advertisement have faced increasing scrutiny. Operators must be aware of the proxénétisme risk in running any facilitation service.' },
        ]
      },
      {
        title: 'Health & Safety', icon: 'ti-heart-rate-monitor',
        items: [
          { heading: 'STI Testing', body: 'Free STI testing is available at CDAG/CeGIDD centres across France. No appointment needed at many centres. Testing for HIV, syphilis, chlamydia, gonorrhoea, and hepatitis is available.' },
          { heading: 'PrEP Access', body: 'PrEP is available free of charge in France at CeGIDD centres and prescribing GPs. Undocumented workers with AME can also access PrEP.' },
          { heading: 'Impact of Nordic Model on Safety', body: 'Research by STRASS and Médecins du Monde shows that since 2016, workers have less time to assess clients, work in more isolated locations, and face increased violence. Health organisations unanimously oppose the Nordic model on public health grounds.' },
          { heading: 'Outreach Services', body: 'Médecins du Monde, Bus des Femmes, and AIDES operate outreach vehicles providing condoms, health advice, and social support without requiring documentation or registration.' },
        ]
      },
      {
        title: 'Migrant Workers', icon: 'ti-world',
        items: [
          { heading: 'EU/EEA Citizens', body: 'Free movement applies. Limited formal labor protections but access to health system through EHIC or residency registration.' },
          { heading: 'Non-EU Citizens', body: 'Most vulnerable group. Exit programme provides a temporary 6-month residence permit to those who agree to stop sex work. Renewable up to 3 years. Eligibility requires engagement with an approved support association.' },
          { heading: 'Undocumented Workers', body: 'Médecins du Monde, Bus des Femmes, and Grisélidis (Toulouse) operate without documentation requirements. Police raids have increased since 2016; workers report greater fear of law enforcement.' },
        ]
      },
      {
        title: 'Anti-Trafficking', icon: 'ti-shield',
        items: [
          { heading: 'Reporting', body: 'Police (17) or ALC — Association Départementale d\'Aide aux Victimes. Anonymous tip line: 3114 (national crisis & suicide line — can also refer to trafficking support).' },
          { heading: 'Victim Status', body: 'Recognised trafficking victims receive a 30-day reflection period, followed by a temporary residence permit, shelter, and legal aid. Support via authorised "associations agréées".' },
          { heading: 'Note on Nordic Model', body: 'Multiple French and international public health and human rights organisations (STRASS, Médecins du Monde, Amnesty International, WHO, UNAIDS) have documented that the Nordic Model increases trafficking victims\' vulnerability by reducing their ability to screen clients safely.' },
        ]
      },
    ],
    support: [
      { name: 'Médecins du Monde', type: 'Healthcare & Outreach', website: 'https://medecinsdumonde.org', note: 'Street outreach, free healthcare, harm reduction. Multiple cities.' },
      { name: 'STRASS', type: 'Rights & Advocacy', website: 'https://strass-syndicat.org', email: 'contact@strass-syndicat.org', note: 'National sex worker union. Legal information and advocacy.' },
      { name: 'Bus des Femmes', type: 'Outreach', phone: '+33 1 47 00 25 77', note: 'Mobile outreach in Paris. Health services, condoms, social work.' },
      { name: 'AIDES', type: 'HIV & Health', website: 'https://www.aides.org', note: 'HIV prevention, PrEP access, harm reduction across France.' },
      { name: 'Grisélidis', type: 'Support & Rights', website: 'https://griselidis.fr', note: 'Sex worker rights organisation based in Toulouse.' },
    ]
  },

  LU: {
    name: 'Luxembourg', flag: '🇱🇺', code: 'LU', status: 'tolerated', statusYear: 2000,
    summary: 'Sex work in Luxembourg is not explicitly criminalized but is also not formally regulated. Workers exist in a legal grey zone, without dedicated labor protections or a recognized professional status.',
    sections: [
      {
        title: 'Legal Framework', icon: 'ti-scale',
        items: [
          { heading: 'Legal Status', body: 'Sex work is not a criminal offence in Luxembourg. There is no national law that specifically prohibits selling sex. However, there is no legal framework that recognizes it as a profession either.' },
          { heading: 'Third-Party Facilitation', body: 'Proxénétisme (living off the earnings of a sex worker) is prohibited under Art. 379 of the Code Pénal. This creates legal ambiguity for any managed indoor work environment.' },
          { heading: 'Solicitation', body: 'Public solicitation that disturbs public order may be subject to minor sanctions. In practice, enforcement is inconsistent.' },
          { heading: 'No National Regulation', body: 'Unlike Belgium, Germany, or the Netherlands, Luxembourg has not enacted a comprehensive sex work regulatory framework. Workers have no specific occupational health, registration, or labor standards.' },
        ]
      },
      {
        title: 'For Sex Workers', icon: 'ti-user',
        items: [
          { heading: 'Employment Status', body: 'Sex work is not a recognized profession. Workers cannot formally register as self-employed sex workers or enter employment contracts in this capacity.' },
          { heading: 'Healthcare Access', body: 'All residents (including undocumented people) have access to emergency healthcare. The Caisse Nationale de Santé (CNS) covers those with registered employment or residence.' },
          { heading: 'Taxation', body: 'Income from sex work is technically taxable under "autres revenus" (other income) but practically very difficult to declare without a recognized professional category.' },
          { heading: 'Migrant Workers (EU/EEA)', body: 'EU/EEA citizens have free movement rights and may reside in Luxembourg freely. Access to social security requires formal registration and employment.' },
          { heading: 'Migrant Workers (Non-EU)', body: 'Non-EU nationals require a residence and work permit. Working without documentation is illegal and dangerous.' },
        ]
      },
      {
        title: 'Health & Safety', icon: 'ti-heart-rate-monitor',
        items: [
          { heading: 'STI Testing', body: 'Free and confidential STI testing is available at CHL (Centre Hospitalier de Luxembourg) and the Croix-Rouge Luxembourg. No appointment required for anonymous testing.' },
          { heading: 'PrEP Access', body: 'PrEP is available on prescription. It is reimbursed by CNS for people at significant risk. Contact a GP or HIV clinic.' },
          { heading: 'Outreach', body: 'Lëtz Rise Up and CEFIS provide outreach to sex workers. Médecins du Monde Luxembourg operates for people without access to the regular healthcare system.' },
        ]
      },
      {
        title: 'Migrant Workers', icon: 'ti-world',
        items: [
          { heading: 'EU/EEA Citizens', body: 'Freedom of movement applies. Register at the local commune within 3 months. Access to public services follows registration.' },
          { heading: 'Non-EU Citizens', body: 'Must have valid residence and work authorization. Options are limited. Consult ASTI (Association de Soutien aux Travailleurs Immigrés) for immigration guidance.' },
          { heading: 'Undocumented Workers', body: 'Can access emergency healthcare and some outreach services without documentation. Contact Médecins du Monde Luxembourg or Caritas Luxembourg for confidential support.' },
        ]
      },
      {
        title: 'Anti-Trafficking', icon: 'ti-shield',
        items: [
          { heading: 'Reporting', body: 'Police emergency: 113. Trafficking victim support: SAVTEH (Service d\'Aide aux Victimes de la Traite des Êtres Humains). Contact via Police Grand-Ducale.' },
          { heading: 'Victim Support', body: 'Recognised victims receive a reflection period, temporary residence permit, shelter, and legal support through SAVTEH.' },
        ]
      },
    ],
    support: [
      { name: 'Lëtz Rise Up', type: 'Sex Worker Rights', email: 'contact@letzriseup.lu', note: 'Sex worker-led organisation in Luxembourg.' },
      { name: 'Médecins du Monde Luxembourg', type: 'Healthcare', website: 'https://medecinsdumonde.lu', note: 'Free healthcare for those without access to regular services.' },
      { name: 'Croix-Rouge Luxembourg', type: 'Health & Support', phone: '+352 27 55', website: 'https://croix-rouge.lu', note: 'STI testing, social support, emergency services.' },
      { name: 'ASTI', type: 'Migrant Support', website: 'https://asti.lu', note: 'Immigration and legal advice for migrant workers.' },
    ]
  },

  ES: {
    name: 'Spain', flag: '🇪🇸', code: 'ES', status: 'abolitionist', statusYear: 2023,
    summary: 'Spain has no national law specifically addressing sex work. Selling sex is not a criminal offence, but buying sex is not criminalized nationally either. Third-party management is criminalized as pimping. A proposed national abolitionist law has been debated since 2021.',
    sections: [
      {
        title: 'Legal Framework', icon: 'ti-scale',
        items: [
          { heading: 'National Legal Status', body: 'Sex work is not explicitly illegal at the national level. However, it is not recognized as a profession, leaving workers without labor protections or formal status.' },
          { heading: 'Third-Party Facilitation', body: 'Proxenetismo (managing or profiting from another\'s sex work) is criminalized under Art. 187-188 of the Código Penal, with sentences of 2–5 years. This makes any organised indoor sex work legally risky for operators.' },
          { heading: 'Local Ordinances', body: 'Municipalities vary widely. Some (Barcelona, Lleida) have passed anti-street-solicitation ordinances with fines for clients and/or workers. Other cities have designated zones or take a laissez-faire approach.' },
          { heading: 'Proposed Abolitionist Law (Ley Orgánica)', body: 'A proposed organic law to criminalize clients (Nordic model) has been debated in the Spanish parliament since 2021. As of 2025, it has not been enacted. Sex worker organisations (APROSEX, OTRAS) strongly oppose it.' },
        ]
      },
      {
        title: 'For Sex Workers', icon: 'ti-user',
        items: [
          { heading: 'Legal Status', body: 'Sex work is not a recognized profession. Workers cannot formally register. Income is technically taxable as "otras actividades económicas" but practically difficult to declare.' },
          { heading: 'Healthcare Access', body: 'All residents — including undocumented people — have access to primary healthcare under Spanish law (Real Decreto-ley 7/2018). Present at a CAP (Centre d\'Atenció Primaria) to register.' },
          { heading: 'Migrant Workers (EU/EEA)', body: 'Free movement applies. Register at the local Oficina de Extranjería within 90 days. Access to social security requires formal registration and (non-sex work) employment or self-employment.' },
          { heading: 'Migrant Workers (Non-EU)', body: 'Residence and work permits required. The lack of recognized professional status means no legal pathway via sex work. Contact APROSEX or Médicos del Mundo for guidance.' },
        ]
      },
      {
        title: 'Health & Safety', icon: 'ti-heart-rate-monitor',
        items: [
          { heading: 'STI Testing', body: 'Free at public health centres (Centros de Salud Sexual y Reproductiva). Also available via Médicos del Mundo, Cáritas, and Stop Sida (Catalonia).' },
          { heading: 'PrEP Access', body: 'PrEP is reimbursed by the Spanish public health system (SNS) for people at high risk. Available via specialist infectious disease units.' },
          { heading: 'Harm Reduction', body: 'Médicos del Mundo, Fundación Salud y Comunidad, and local NGOs provide outreach, condoms, and healthcare without documentation requirements.' },
        ]
      },
      {
        title: 'Migrant Workers', icon: 'ti-world',
        items: [
          { heading: 'EU/EEA Citizens', body: 'Free movement. Register at the Oficina de Extranjería. Access to public health and education for dependents.' },
          { heading: 'Non-EU Citizens', body: 'Must have valid NIE (Número de Identidad de Extranjero) and work authorisation. Limited pathways. High vulnerability among undocumented workers.' },
          { heading: 'Undocumented Workers', body: 'Médicos del Mundo and Cáritas offer services without documentation. The proposed national law has raised concerns about increasing vulnerability for undocumented sex workers.' },
        ]
      },
      {
        title: 'Anti-Trafficking', icon: 'ti-shield',
        items: [
          { heading: 'Reporting', body: 'Police (091) or 24-hour trafficking helpline: 900 105 090 (free, confidential). UCRIF (Unidad Central de Redes de Inmigración Ilegal y Falsedades Documentales) handles trafficking investigations.' },
          { heading: 'Victim Support', body: 'Recognised victims receive a 90-day reflection period, a temporary residence permit, shelter, legal aid, and psychosocial support via approved NGOs.' },
        ]
      },
    ],
    support: [
      { name: 'APROSEX', type: 'Rights & Advocacy', website: 'https://aprosex.org', email: 'info@aprosex.org', note: 'Sex worker association. Legal information and peer support. Catalonia.' },
      { name: 'Médicos del Mundo', type: 'Healthcare', phone: '+34 91 543 60 33', website: 'https://medicosdelmundo.org', note: 'Free healthcare, STI testing, outreach. Multiple cities.' },
      { name: 'HETAIRA', type: 'Rights', website: 'https://colectivohetaira.org', note: 'Sex worker collective based in Madrid.' },
      { name: 'Fundación Salud y Comunidad', type: 'Health', website: 'https://fsyc.org', note: 'Harm reduction, outreach, health services.' },
    ]
  },

  AT: {
    name: 'Austria', flag: '🇦🇹', code: 'AT', status: 'regulated', statusYear: 1984,
    summary: 'Sex work is legal in Austria and regulated at the level of the individual Bundesländer (states). Workers must register and obtain a health certificate. Mandatory STI testing frequency varies by region.',
    sections: [
      {
        title: 'Legal Framework', icon: 'ti-scale',
        items: [
          { heading: 'National Legal Status', body: 'Sex work is legal in Austria under federal law. The Sexualstrafrecht covers coercion and trafficking but not consensual adult sex work. Regulation is delegated to the nine Bundesländer.' },
          { heading: 'Bundesländer Variation', body: 'Each state has its own Prostitutionsgesetz or equivalent. Requirements for registration, health certificates, designated zones, and permitted premises differ significantly between Vienna, Lower Austria, Styria, Tyrol, etc.' },
          { heading: 'Prostitution Prohibition Zones', body: 'Each state designates areas where sex work is and is not permitted. Street-based work is restricted to designated zones in most cities. Vienna\'s Strich (street zone) operates under specific rules.' },
        ]
      },
      {
        title: 'For Sex Workers', icon: 'ti-user',
        items: [
          { heading: 'Registration', body: 'Mandatory in all Bundesländer. In Vienna: register at Magistratisches Bezirksamt (MBA) for your district. Requires valid ID/passport, proof of address, and payment of a registration fee.' },
          { heading: 'Health Certificate (Gesundheitszeugnis)', body: 'Required for registration and must be renewed regularly. In Vienna: required every 6 weeks. Other regions: often quarterly. Testing includes HIV, syphilis, gonorrhoea, chlamydia, and hepatitis.' },
          { heading: 'Health Insurance', body: 'Sex workers are entitled to register with the SVS (Sozialversicherungsanstalt der Selbständigen) or equivalent as self-employed. This provides access to statutory healthcare.' },
          { heading: 'Taxation', body: 'Income is taxable. File with Finanzamt. Many sex workers work as self-employed (Einzelunternehmer). VAT may apply once income exceeds the threshold (€35,000/year).' },
          { heading: 'Migrant Workers (EU/EEA)', body: 'Free movement applies. Register at the local Meldeamt within 3 days of finding accommodation. Then register as a sex worker with the relevant Bezirksamt.' },
          { heading: 'Migrant Workers (Non-EU)', body: 'Need a valid residence and work permit. LEFÖ (Vienna) provides specialist advice and support for migrant sex workers.' },
        ]
      },
      {
        title: 'Health & Safety', icon: 'ti-heart-rate-monitor',
        items: [
          { heading: 'Mandatory Testing (Vienna)', body: 'Every 6 weeks: HIV, syphilis, gonorrhoea, chlamydia. Available at the Magistrat or at specialist clinics. Low cost or free for registered workers.' },
          { heading: 'PrEP Access', body: 'Available through HIV-specialist practices and the Wiener Gesundheitsverbund. Partially reimbursed by statutory insurance for high-risk individuals.' },
          { heading: 'Sophie (Vienna)', body: 'Sophie Frauenberatung provides health counselling, social work, and legal advice specifically for sex workers in Vienna. Free and confidential.' },
        ]
      },
      {
        title: 'Migrant Workers', icon: 'ti-world',
        items: [
          { heading: 'EU/EEA Citizens', body: 'Registration at Meldeamt required within 3 days. Subsequent sex worker registration is straightforward for EU citizens with valid ID.' },
          { heading: 'Non-EU Citizens', body: 'LEFÖ provides specialist migration and legal advice. Working without a permit is illegal and extremely dangerous.' },
        ]
      },
      {
        title: 'Anti-Trafficking', icon: 'ti-shield',
        items: [
          { heading: 'Reporting', body: 'Police: 133. LEFÖ-IBF (Interventionsstelle für Betroffene des Frauenhandels): +43 1 796 36 70. Confidential victim support without reporting obligation.' },
          { heading: 'Victim Support', body: 'LEFÖ-IBF is Austria\'s primary specialised support centre for trafficking victims. Provides shelter, legal aid, psychological support, and immigration advice.' },
        ]
      },
    ],
    support: [
      { name: 'LEFÖ', type: 'Migrant Workers & Anti-Trafficking', phone: '+43 1 796 36 70', website: 'https://lefoe.at', note: 'Support for migrant women and trafficking victims. Vienna.' },
      { name: 'Sophie Frauenberatung', type: 'Health & Counselling', phone: '+43 1 581 28 82', note: 'Free, confidential health and social counselling for sex workers. Vienna.' },
      { name: 'TAMPEP Austria', type: 'Migrant Outreach', website: 'https://tampep.eu', note: 'Multilingual outreach for migrant sex workers across Austria.' },
    ]
  },

  CH: {
    name: 'Switzerland', flag: '🇨🇭', code: 'CH', status: 'regulated', statusYear: 1942,
    summary: 'Sex work is legal in Switzerland and has been regulated since 1942. Regulation is managed at the cantonal and communal level. Workers must register with local authorities and access a comprehensive healthcare system.',
    sections: [
      {
        title: 'Legal Framework', icon: 'ti-scale',
        items: [
          { heading: 'Federal Legal Status', body: 'Sex work is legal under Swiss federal law. The Criminal Code prohibits exploitation and trafficking (Art. 195 StGB) but not consensual adult sex work.' },
          { heading: 'Cantonal Regulation', body: 'Each canton has its own rules on registration, designated areas, and permitted premises. Geneva, Zurich, Bern, Basel, and Lausanne each have distinct regimes.' },
          { heading: 'Third-Party Facilitation', body: 'Operating a venue that hosts sex work is legal if properly licensed. Exploitative facilitation (debt bondage, coercion, document confiscation) is a criminal offence under Art. 195 StGB.' },
        ]
      },
      {
        title: 'For Sex Workers', icon: 'ti-user',
        items: [
          { heading: 'Registration', body: 'Required in most cantons. In Geneva: register at the cantonal police. In Zurich: register at the Stadtpolizei. Requires valid ID. Some cantons issue a registration card.' },
          { heading: 'Work Permit (Permits B/C/L)', body: 'EU/EFTA citizens holding a valid residence permit (B, C, or L) may work freely. Third-country nationals need a specific work permit — sex work is generally not a permitted occupation for non-EU/EFTA nationals.' },
          { heading: 'Taxation', body: 'Income from sex work is taxable. Workers are taxed at source (Quellensteuer) if employed, or file annual returns if self-employed. Cantons handle tax filing.' },
          { heading: 'Health Insurance', body: 'Mandatory basic health insurance (Grundversicherung / LAMal) for all residents. Workers must arrange their own insurance through a Krankenkasse / caisse-maladie. Premiums are income-based with subsidies available.' },
          { heading: 'Migrant Workers (EU/EFTA)', body: 'Free movement under the Agreement on the Free Movement of Persons. Must register within 3 months. Permit L (short-stay) or B (residence) issued based on employment status and duration.' },
          { heading: 'Migrant Workers (Non-EU/EFTA)', body: 'Very limited pathways. Third-country nationals generally cannot obtain work permits for sex work. Highly vulnerable if undocumented.' },
        ]
      },
      {
        title: 'Health & Safety', icon: 'ti-heart-rate-monitor',
        items: [
          { heading: 'STI Testing', body: 'Strongly recommended. Available at Checkpoint clinics (Zurich, Geneva, Bern, Lausanne), Aspasie (Geneva), and cantonal health services. Free or low-cost for sex workers.' },
          { heading: 'PrEP Access', body: 'PrEP is available on prescription and is covered by basic insurance (with a deductible). Available at Checkpoint clinics and HIV specialist practices.' },
          { heading: 'Aspasie (Geneva)', body: 'Aspasie is a peer-led organisation run by sex workers. Provides health counselling, outreach, legal information, and advocacy. Fundamental resource for Geneva-based workers.' },
          { heading: 'ProKoRe (Bern)', body: 'Coordination and support network for sex workers in the Berne region. Health resources, outreach, advocacy.' },
        ]
      },
      {
        title: 'Migrant Workers', icon: 'ti-world',
        items: [
          { heading: 'EU/EFTA Citizens', body: 'Free movement applies. Register at your commune (Gemeinde/commune). You will receive a residence permit which also allows you to work.' },
          { heading: 'Non-EU/EFTA Citizens', body: 'Very limited legal pathways. Aspasie and Fleur de Pavé (Geneva) provide confidential support without reporting to authorities.' },
        ]
      },
      {
        title: 'Anti-Trafficking', icon: 'ti-shield',
        items: [
          { heading: 'Reporting', body: 'Police: 117. FIZ (Fachstelle Frauenhandel und Frauenmigration): +41 44 436 90 00. Confidential support without obligation to report.' },
          { heading: 'Victim Support', body: 'FIZ provides shelter, legal aid, and support for trafficking victims across Switzerland. Aspasie covers Geneva canton.' },
        ]
      },
    ],
    support: [
      { name: 'Aspasie', type: 'Health & Rights', phone: '+41 22 906 40 40', website: 'https://aspasie.ch', note: 'Sex worker-run. Health, legal, outreach. Geneva.' },
      { name: 'ProKoRe', type: 'Coordination & Support', phone: '+41 31 534 10 10', website: 'https://prokore.ch', note: 'Berne region. Health resources, networking, advocacy.' },
      { name: 'Fleur de Pavé', type: 'Outreach', website: 'https://fleurdepavedge.ch', note: 'Mobile outreach and support in Geneva.' },
      { name: 'FIZ', type: 'Anti-Trafficking', phone: '+41 44 436 90 00', website: 'https://fiz-info.ch', note: 'Specialist support for trafficking victims. Nationwide.' },
      { name: 'Checkpoint (Zurich/Geneva)', type: 'Sexual Health', website: 'https://checkpointgva.ch', note: 'Free STI testing, PrEP, HIV services. Key cities.' },
    ]
  },
}

const COUNTRY_ORDER = ['BE', 'NL', 'DE', 'FR', 'LU', 'ES', 'AT', 'CH']

// ─── Component ────────────────────────────────────────────────────────────────

export default function RegulationsPage() {
  const [activeCountry, setActiveCountry] = useState('BE')
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ 'Legal Framework': true })

  const country = COUNTRIES[activeCountry]
  const status = STATUS_META[country.status]

  const toggleSection = (title: string) =>
    setOpenSections(prev => ({ ...prev, [title]: !prev[title] }))

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--t)', fontFamily: 'var(--sans)' }}>

      {/* NAV */}
      <nav className="sx-subnav" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', height: '64px', position: 'sticky', top: 0, zIndex: 200, background: 'rgba(8,6,18,0.92)', backdropFilter: 'blur(18px)', borderBottom: '0.5px solid var(--b)' }}>
        <Link href="/" style={{ fontFamily: 'var(--serif)', fontSize: '28px', color: 'var(--gold)', letterSpacing: '.02em', textDecoration: 'none', filter: 'drop-shadow(0 0 14px rgba(197,160,90,0.35))' }}>
          Secret<em style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</em>
        </Link>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link href="/medical" style={{ height: '36px', padding: '0 14px', background: 'transparent', border: '0.5px solid var(--b2)', borderRadius: 'var(--r)', color: 'var(--t2)', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i className="ti ti-heart-rate-monitor" /> Medical Info
          </Link>
          <Link href="/" style={{ height: '36px', padding: '0 14px', background: 'transparent', border: '0.5px solid var(--b2)', borderRadius: 'var(--r)', color: 'var(--t2)', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i className="ti ti-arrow-left" /> Home
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: '4.5rem 1.5rem 3.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden', borderBottom: '0.5px solid var(--b)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(197,160,90,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ fontFamily: 'var(--sans)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.3em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
            <i className="ti ti-scale" style={{ marginRight: '8px' }} />Regulation & Information
          </div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 400, lineHeight: 1.15, margin: '0 0 1rem' }}>
            Know Your <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Rights</em> Across Europe
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--t2)', lineHeight: 1.7, maxWidth: '540px', margin: '0 auto' }}>
            Accurate, up-to-date legal frameworks, worker protections, health standards, and support resources — by country.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.75rem' }}>
            <Link href="/medical" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '10px 22px', background: 'var(--gbg)', border: '0.5px solid var(--gbrd)', borderRadius: 'var(--r)', color: 'var(--gold)', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
              <i className="ti ti-heart-rate-monitor" /> Medical Resources
            </Link>
            <a href="#country" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '10px 22px', background: 'transparent', border: '0.5px solid var(--b2)', borderRadius: 'var(--r)', color: 'var(--t2)', fontSize: '13px', textDecoration: 'none' }}>
              <i className="ti ti-map-pin" /> Select Country
            </a>
          </div>
        </div>
      </section>

      {/* STATUS LEGEND */}
      <div style={{ borderBottom: '0.5px solid var(--b)', background: 'var(--bg1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {Object.entries(STATUS_META).map(([key, s]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--t2)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', borderRadius: '50%', background: s.bg, color: s.color }}>
                <i className={`ti ${s.icon}`} style={{ fontSize: '9px' }} />
              </span>
              <span style={{ color: s.color, fontWeight: 600 }}>{s.label}</span>
              <span>— {s.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* COUNTRY SELECTOR */}
      <div id="country" style={{ position: 'sticky', top: '64px', zIndex: 100, background: 'rgba(8,6,18,0.97)', backdropFilter: 'blur(18px)', borderBottom: '0.5px solid var(--b)', padding: '0 1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none', padding: '.75rem 0' }}>
          {COUNTRY_ORDER.map(code => {
            const c = COUNTRIES[code]
            const s = STATUS_META[c.status]
            const active = activeCountry === code
            return (
              <button key={code} onClick={() => { setActiveCountry(code); setOpenSections({ 'Legal Framework': true }) }}
                style={{ height: '36px', padding: '0 14px', borderRadius: '20px', border: `0.5px solid ${active ? s.color : 'var(--b)'}`, background: active ? s.bg : 'transparent', color: active ? s.color : 'var(--t2)', fontSize: '13px', fontWeight: active ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px', transition: 'all .2s' }}>
                <span>{c.flag}</span><span>{c.name}</span>
                <span style={{ fontSize: '10px', opacity: 0.7 }}>({c.statusYear})</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* CONTENT */}
      <div className="sx-two-col" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem 6rem', display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'start' }}>

        {/* LEFT: Accordion sections */}
        <div>
          {/* Country header */}
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '2rem' }}>{country.flag}</span>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: '2rem', fontWeight: 400, margin: 0 }}>{country.name} Regulations</h2>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 14px', borderRadius: '20px', background: status.bg, border: `0.5px solid ${status.color}`, color: status.color, fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
                <i className={`ti ${status.icon}`} />
                {status.label} ({country.statusYear})
              </div>
              <p style={{ fontSize: '14px', color: 'var(--t2)', lineHeight: 1.7, maxWidth: '640px', margin: 0 }}>{country.summary}</p>
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{ background: 'rgba(197,160,90,0.06)', border: '0.5px solid rgba(197,160,90,0.2)', borderRadius: 'var(--r)', padding: '12px 16px', marginBottom: '1.5rem', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <i className="ti ti-info-circle" style={{ color: 'var(--gold)', flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '12px', color: 'var(--t3)', margin: 0, lineHeight: 1.6 }}>
              This information is for general guidance only and is not legal advice. Laws change — always verify with a qualified lawyer or local support organisation before making decisions.
            </p>
          </div>

          {/* Accordion */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {country.sections.map(section => {
              const isOpen = !!openSections[section.title]
              return (
                <div key={section.title} style={{ background: 'var(--bg1)', border: '0.5px solid var(--b)', borderRadius: 'var(--rl)', overflow: 'hidden' }}>
                  <button onClick={() => toggleSection(section.title)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t)', textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <i className={`ti ${section.icon}`} style={{ fontSize: '18px', color: 'var(--gold)', width: '22px' }} />
                      <span style={{ fontFamily: 'var(--serif)', fontSize: '18px', fontWeight: 500 }}>{section.title}</span>
                    </div>
                    <i className={`ti ${isOpen ? 'ti-chevron-up' : 'ti-chevron-down'}`} style={{ fontSize: '16px', color: 'var(--t3)', flexShrink: 0 }} />
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '0.5px solid var(--b)' }}>
                      {section.items.map((item, i) => (
                        <div key={i} style={{ padding: '1rem 0', borderBottom: i < section.items.length - 1 ? '0.5px solid var(--b)' : 'none' }}>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--t)', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--gold)', flexShrink: 0, display: 'inline-block' }} />
                            {item.heading}
                          </div>
                          <p style={{ fontSize: '13px', color: 'var(--t2)', lineHeight: 1.7, margin: '0 0 0 10px' }}>{item.body}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* RIGHT: Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Support orgs */}
          <div style={{ background: 'var(--bg1)', border: '0.5px solid var(--b)', borderRadius: 'var(--rl)', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '0.5px solid var(--b)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="ti ti-heart-handshake" style={{ color: 'var(--gold)' }} />
              <span style={{ fontFamily: 'var(--serif)', fontSize: '17px', fontWeight: 500 }}>Support in {country.name}</span>
            </div>
            <div style={{ padding: '0.5rem' }}>
              {country.support.map((org, i) => (
                <div key={i} style={{ padding: '0.85rem 0.75rem', borderRadius: 'var(--r)', transition: 'background .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--t)' }}>{org.name}</span>
                    <span style={{ fontSize: '10px', color: 'var(--gold)', background: 'var(--gbg)', border: '0.5px solid var(--gbrd)', borderRadius: '8px', padding: '1px 8px', fontWeight: 600 }}>{org.type}</span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--t3)', margin: '0 0 5px', lineHeight: 1.5 }}>{org.note}</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {org.phone && (
                      <a href={`tel:${org.phone}`} style={{ fontSize: '11px', color: 'var(--t2)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <i className="ti ti-phone" style={{ fontSize: '11px' }} />{org.phone}
                      </a>
                    )}
                    {org.email && (
                      <a href={`mailto:${org.email}`} style={{ fontSize: '11px', color: 'var(--t2)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <i className="ti ti-mail" style={{ fontSize: '11px' }} />{org.email}
                      </a>
                    )}
                    {org.website && (
                      <a href={org.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: 'var(--gold)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <i className="ti ti-external-link" style={{ fontSize: '11px' }} />Visit website
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency */}
          <div style={{ background: 'rgba(224,82,82,0.06)', border: '0.5px solid rgba(224,82,82,0.2)', borderRadius: 'var(--rl)', padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
              <i className="ti ti-alert-triangle" style={{ color: '#e05252' }} />
              <span style={{ fontWeight: 600, fontSize: '14px', color: '#e05252' }}>In immediate danger?</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--t2)', margin: '0 0 0.75rem', lineHeight: 1.6 }}>If you are being coerced, trafficked, or are in immediate danger, contact emergency services or a specialist helpline.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span style={{ fontSize: '12px', color: 'var(--t3)' }}><i className="ti ti-phone" style={{ marginRight: '6px' }} />Emergency (EU-wide): <strong style={{ color: 'var(--t)' }}>112</strong></span>
              <span style={{ fontSize: '12px', color: 'var(--t3)' }}><i className="ti ti-phone" style={{ marginRight: '6px' }} />EU Anti-Trafficking Hotline: <strong style={{ color: 'var(--t)' }}>+32 2 555 45 50</strong></span>
            </div>
          </div>

          {/* Medical link */}
          <Link href="/medical" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem 1.25rem', background: 'var(--bg1)', border: '0.5px solid var(--b)', borderRadius: 'var(--rl)', textDecoration: 'none', transition: 'border-color .2s' }}
            onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.borderColor = 'rgba(197,160,90,0.4)')}
            onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.borderColor = 'var(--b)')}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(197,160,90,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="ti ti-heart-rate-monitor" style={{ color: 'var(--gold)', fontSize: '20px' }} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--t)', marginBottom: '2px' }}>Medical Information</div>
              <div style={{ fontSize: '12px', color: 'var(--t3)' }}>Testing centres, healthcare, and health organisations by country.</div>
            </div>
            <i className="ti ti-arrow-right" style={{ color: 'var(--t3)', marginLeft: 'auto', flexShrink: 0 }} />
          </Link>
        </div>
      </div>

      {/* FOOTER NOTE */}
      <div style={{ borderTop: '0.5px solid var(--b)', background: 'var(--bg1)', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <p style={{ fontSize: '13px', color: 'var(--t3)', maxWidth: '700px', margin: '0 auto', lineHeight: 1.7 }}>
          Information is updated periodically but laws change. Always verify with a qualified local lawyer or support organisation.
          Sources include TAMPEP, UNAIDS, NSWP, Utsopi, Hydra e.V., STRASS, Aspasie, LEFÖ, and national legislative databases.
          SecretXperience does not provide legal advice.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
          <Link href="/medical" style={{ fontSize: '13px', color: 'var(--gold)', textDecoration: 'none' }}>Medical Resources →</Link>
          <Link href="/partners" style={{ fontSize: '13px', color: 'var(--t2)', textDecoration: 'none' }}>Partner Directory →</Link>
          <Link href="/" style={{ fontSize: '13px', color: 'var(--t2)', textDecoration: 'none' }}>Back to Platform →</Link>
        </div>
      </div>
    </div>
  )
}
