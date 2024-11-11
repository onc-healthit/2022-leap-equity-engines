
# EQUITY ENGINES: Enabling Patient Generated Health Data in Clinical Care & Research

This repository contians the code for the ONC LEAP Equity Engines project that aimed to demonstrate the use of patient-generated health data (PGHD) to improve equity in clinical care and research:

Goals: The project's goals included developing the health IT infrastructure and standards for PGHD technologies to facilitate sharing PGHD between providers, patients and researchers.

Project duration: The project began in 2022 and completed in 2024.
Project team: The MedStar Health Research Institute led the project. 
 
## BACKGROUND

The two dominant EMRs, Epic and Cerner, represent roughly 64% marketshare and thus represent the predominate patient experience. 

A variety of historical challenges have faced effective use of patient data for solving challenges and gaps in equitably delivered care. 

### DELAY: 
In 2015, Marissa Mayer at the Web 2.0 conference revealed that a 0.5 second delay caused a 20% traffic drop-off that never recovered. Today's patient portals rarely enable "Google-speed" search. This results in an as-yet to be quantified potential drop-off in patient engagement. 

### TRIAGE:
Healthcare data can be overwhelming in detail. Patients can have upwards of 300+ labs in their portals. Sorting what to give priority attention is rarely facilitated in existing portals. 

### TRENDING:
Many EMRs tag labs that when they become abnormal but fail to indicate when something is trending unfavorably so it can be caught before a problem occurs. 

## FEATURES

This project aimed to provide a provider-patient co-portal with features to aid three areas of patient care: 

### Patient As CEO of their Own Health
Search Speed: The portal includes features to enable sub-second search speed of lab data. 
Trends: The portal includes trending capabilties and sorting of trends to quickly observe which labs are trending favorably or unfavorably. 
Dates: Instead of absolute dates (e.g. 1/11/2024), relative dates are utilized (e.g. 4 days ago) to simplfiy real-time conversations about labs over time and trends. 

### Facilitating Provider-Patient Conversation
Favorites: To enable providers or patients to prioritize certain labs and trends or tag them for pending conversations - a favoriting capability is provided. 
Sorting: Because clinical time can be limited and not everything can be covered in a visit that might need to be, the ability to sort labs by most abnormal was created to help triage what might be the highest priority conversations to have.
Juxtaposing: So the inter-relationships between two different labs - labs can be pinned to the viewer to be compared to other important labs. 

### Patient Provided Data
Written Data: Patients are often known to bring in written data to clinicians. This data can be lost as EMRs have few places to capture that data or indicate it is patient provided. Using an interface to a Large Language Model (LLM) - the portal includes the capability to import written logs of data from patients. 
Pictures of Labs: Sometimes patient receive labs on paper. The portal includes capability using LLMs to import faxed, screenshotted or photographed labs. The labs are mapped to SNOMED codes for grouping. 
Documents: Some PDF reports, forms and images are necessary for effective patient care. The system includes capabilities for attaching documents to the co-portal.


# INSTALLATION

The instructions below describe how to install the software. 

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.


## Acknowledgments

This project was supported by the Office of the National Coordinator for Health Information Technology (ONC) of the U.S. Department of Health and Human Services (HHS). The views, information, and conclusions expressed by these authors are solely their own and should not be interpreted as representing the official stance or policies of the ONC, HHS, or the U.S. Government, nor should they be taken as endorsements from these entities.




