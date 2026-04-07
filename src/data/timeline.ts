// --- Chapter data for horizontal scroll timeline ---

import {
  PRESENT_YEAR,
  yearToPosition,
} from "@/components/sections/timeline/TimelineStrip";

export interface ChapterCommit {
  prefix: string; // "feat:", "fix:", "chore:"
  message: string;
  year?: string;
  /** Force text alignment: "left" | "right" | "center". Overrides auto-detection. */
  anchor?: "left" | "right" | "center";
  /** Shown in the UI — falls back to `year` when omitted. Use when the
   *  positioning year differs from the label you want displayed. */
  displayYear?: string;
}

/** A floating annotation positioned by year range — no commit dot */
export interface ChapterNote {
  text: string;
  /** Year range the note spans — centered between these two years */
  fromYear: number;
  toYear: number;
}

export interface TimelineChapter {
  id: string;
  title: string;
  subtitle: string;
  logo?: string;
  yearRange: string;
  /** Short narrative paragraph shown when zoomed into this chapter */
  description?: string;
  /** Position along the strip as a fraction [0, 1] — used for zoom targeting */
  stripPosition: number;
  commits: ChapterCommit[];
  branches?: TimelineBranch[];
  /** Floating notes (no dot) — positioned between two years */
  notes?: ChapterNote[];
}

export const timelineChapters: TimelineChapter[] = [
  {
    id: "formative-years",
    title: "Formative Years",
    subtitle: "Cordwalles · Maritzburg College",
    yearRange: "2000 – 2018",
    description:
      "Started taking things apart in my dad's workshop to understand how they worked. That curiosity grew into a love of maths and problem-solving, earning me a closed scholarship, leadership roles, and 8 distinctions with a 90% aggregate.",
    stripPosition: (yearToPosition(2000) + yearToPosition(2019)) / 2, // midpoint of full formative span (2000 boundary to 2019 boundary)
    notes: [
      {
        text: "Early love of mathematics, achieving 110% & placed 2nd in Grade 7. Sporting KZN Inland Cricket",
        fromYear: 2005,
        toYear: 2014,
      },
      {
        text: "Cricket, Squash, Table Tennis. Debating. Placing 1st in Grade",
        fromYear: 2014,
        toYear: 2017,
      },
    ],
    commits: [
      {
        prefix: "feat:",
        message:
          "Prefect\nHead of Academics\nHead of Peer Tutoring\nProvincial Debating Captain",
        year: "Jan 2018",
      },
      {
        prefix: "feat:",
        message: "8 Distinctions\n90% Aggregate",
        year: "Dec 2018",
      },
    ],
  },
  {
    id: "stellenbosch",
    title: "Stellenbosch University",
    subtitle: "BEng Mechatronics",
    logo: "/images/logos/stellenbosch-university.jpg",
    yearRange: "2019 – 2023",
    description:
      "Studied Mechatronics Engineering on a full academic scholarship, graduating with a Senior Merit Award in the top 5% of the engineering faculty. Interned in robotics research and autonomous vehicle development.",
    stripPosition: yearToPosition(2021.5), // midpoint of 2019–2024 boundary
    commits: [
      {
        prefix: "feat:",
        message:
          "Senior Merit Award — \nTop 5% in Faculty\nGolden Key International \nHonour Society",
        year: "2020.0",
        displayYear: "Jan 2020",
        anchor: "center",
      },
      {
        prefix: "feat:",
        message:
          "Graduate\nFinal-Year \nProject Distinction\n7 Dean's Merit Awards",
        year: "2023.5",
        displayYear: "Dec 2023",
        anchor: "right",
      },
    ],
    branches: [
      {
        name: "feat/internships",
        events: [
          {
            prefix: "feat:",
            text: "MAD Research Group\nResearch Intern",
            date: "Jun 2022",
          },
          {
            prefix: "feat:",
            text: "MellowVans\nEngineering Intern",
            date: "Nov 2022",
          },
        ],
        forkYear: "2020.5",
        mergeYear: "2023",
      },
    ],
  },
  {
    id: "battalion",
    title: "BATTALION Technologies",
    subtitle: "Mechatronics Engineer",
    logo: "/images/logos/battalion-technologies.jpeg",
    yearRange: "2024 – 2025",
    description:
      "Joined an industrial robotics startup building AGVs. Took ownership of the entire software stack — from low-level C++ CANOpen drivers to state machines, sensor fusion, and fleet communication. Led the end-to-end deployment of a production AGV fleet at Toyota SA Manufacturing, with a scalable architecture designed to support further line expansion.",
    stripPosition: yearToPosition(2025), // midpoint of 2024–2026 boundary
    commits: [
      {
        prefix: "feat:",
        message:
          "Internship\nOperator Dashboard\nFull-Time Offer\nEstablished Software\nEngineering Practice",
        year: "2024.3",
        displayYear: "May-Sep 2024",
        anchor: "left",
      },
      {
        prefix: "feat:",
        message: "Ford & VW Demo",
        year: "2024.6",
        displayYear: "Oct-Dec 2025",
        anchor: "center",
      },
      {
        prefix: "feat:",
        message:
          "Laser-Guided AGV Training\nDelivered DOZERs to Toyota Africa Parts Centre",
        year: "2024.9",
        displayYear: "Jan-Mar 2025",
        anchor: "center",
      },
      {
        prefix: "feat:",
        message:
          "Isuzu & S4 Demo\nTechnical Lead\nToyota Africa Parts Centre\nNetwork Upgrade",
        year: "2025.2",
        displayYear: "Apr-Jun 2025",
        anchor: "center",
      },
      {
        prefix: "feat:",
        message: "",
        year: "2025.5",
        displayYear: "Jul-Sep 2025",
        anchor: "center",
      },
      {
        prefix: "feat:",
        message:
          "Successful Trials\nAGV Fleet Deployment\nToyota SA Manufacturing",
        year: "2025.8",
        displayYear: "Oct-Dec 2025",
      },
    ],
    // branches: [
    //   {
    //     name: "feat/open-source-contributions",
    //     events: [
    //       {
    //         prefix: "feat:",
    //         text: "NAV2",
    //         date: "Jun 2025",
    //       },
    //       {
    //         prefix: "feat:",
    //         text: "SMACC2 Research Group",
    //         date: "Aug 2025",
    //       },
    //     ],
    //     forkYear: "2024.8",
    //     mergeYear: "2025.8",
    //   },
    // ],
  },
  {
    id: "present",
    title: "Freelance Mechatronics Engineer",
    subtitle: "Independent",
    yearRange: "2026 – Present",
    description:
      "Now available for full-time and freelance/contract work — production robotics systems, embedded development, industrial automation, and full-stack web applications. Based in South Africa and open to relocation.",
    stripPosition: yearToPosition((2026 + PRESENT_YEAR) / 2), // midpoint of 2026–Present
    commits: [
      {
        prefix: "feat:",
        message: "Industrial IoT\nDelivered Website \n& Invoicing System",
        year: "2026.4",
        displayYear: "Mar 2026",
        anchor: "left",
      },
      {
        prefix: "feat:",
        message: "Industrial Automation",
        year: "2027.2",
        displayYear: "Apr 2026",
        anchor: "center",
      },
    ],
  },
];

// --- Year-level data for timeline strip and mobile fallback ---

export interface TimelineEvent {
  month: string;
  text: string;
  subtitle?: string;
  logo?: string;
  isTitle?: boolean;
  /** "left" = institutions/roles, "right" = achievements/awards */
  side: "left" | "right";
}

export interface BranchEvent {
  text: string;
  prefix: string; // e.g. "feat:" or "fix:"
  date?: string; // display date below the label
}

export interface TimelineBranch {
  name: string; // e.g. "feat/internships"
  events: BranchEvent[];
  forkYear?: string; // year where branch forks from main line
  mergeYear: string; // year where branch merges back into main line
}

export interface TimelineYear {
  year: string;
  events: TimelineEvent[];
  branch?: TimelineBranch;
}

// Past to present — top to bottom
export const timelineYears: TimelineYear[] = [
  {
    year: "2005",
    events: [
      {
        month: "January",
        text: "Cordwalles",
        subtitle: "Preparatory School",
        logo: "/images/logos/cordwalles.png",
        side: "left",
      },
    ],
  },
  {
    year: "2013",
    events: [
      {
        month: "June",
        text: "Cordwalles Closed (Academic) Scholarship to Maritzburg College",
        side: "right",
      },
      { month: "December", text: "2nd in Grade 7", side: "right" },
    ],
  },
  {
    year: "2014",
    events: [],
  },
  {
    year: "2018",
    events: [
      {
        month: "",
        text: "Maritzburg College",
        subtitle: "National Senior Certificate",
        logo: "/images/logos/maritzburg-college.png",
        side: "left",
      },
      { month: "September", text: "Prefect", side: "right" },
      { month: "January", text: "Head of Academics", side: "right" },
      {
        month: "January",
        text: "8 Distinctions, 90% Aggregate",
        side: "right",
      },
      {
        month: "June",
        text: "Recruitment Bursary to Stellenbosch University",
        side: "right",
      },
    ],
  },
  {
    year: "2019",
    events: [
      { month: "", text: "Senior Merit Award", side: "right" },
      {
        month: "",
        text: "Golden Key International Honour Society",
        side: "right",
      },
    ],
  },
  {
    year: "2022",
    events: [
      {
        month: "",
        text: "Stellenbosch University",
        subtitle: "BEng Mechatronics",
        logo: "/images/logos/stellenbosch-university.jpg",
        side: "left",
      },
    ],
    branch: {
      name: "feat/internships",
      events: [
        { prefix: "feat:", text: "Research Intern — MAD Group" },
        { prefix: "feat:", text: "Engineering Intern — MellowVans" },
      ],
      mergeYear: "2023",
    },
  },
  {
    year: "2023",
    events: [
      {
        month: "November",
        text: "Final-Year Project Distinction",
        side: "right",
      },
      { month: "December", text: "Graduate", side: "right" },
    ],
  },
  {
    year: "2024",
    events: [
      {
        month: "May",
        text: "BATTALION Technologies",
        subtitle: "Mechatronics Engineer",
        logo: "/images/logos/battalion-technologies.jpeg",
        side: "left",
      },
    ],
  },
  {
    year: "2025",
    events: [
      { month: "December", text: "AGV Deployment Feature", side: "right" },
    ],
    branch: {
      name: "feat/open-source-contributions",
      events: [
        { prefix: "feat:", text: "NAV2" },
        { prefix: "feat:", text: "SMACC2 Research Group" },
      ],
      mergeYear: "2026",
    },
  },
  {
    year: "2026",
    events: [
      {
        month: "February",
        text: "Freelance Mechatronics Engineer",
        subtitle: "Independent",
        isTitle: true,
        side: "left",
      },
    ],
  },
];
