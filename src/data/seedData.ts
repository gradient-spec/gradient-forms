import { Form, FormResponse, Workspace, WorkspaceMember } from '../types';
import { PRESET_THEMES } from './presetThemes';


export const DEFAULT_CURRENT_USER: WorkspaceMember = {
  id: 'usr-1',
  name: 'Alex Rivera',
  email: 'alex@gradientforms.io',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  role: 'owner',
  status: 'active',
  joinedAt: '2026-08-01T10:00:00Z'
};

export const INITIAL_WORKSPACE: Workspace = {
  id: 'ws-1',
  name: 'Gradient Labs',
  logo: '⚡',
  plan: 'free',
  members: [DEFAULT_CURRENT_USER]
};

export const SEED_FORMS: Form[] = [
  {
    id: 'form-cs-feedback',
    title: 'Computer Science Course & Lab Feedback',
    description: 'Help us improve the CS304 Algorithms & Web Architecture course experience for Autumn 2026.',
    isPublished: true,
    status: 'published',
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-14T15:30:00Z',
    responseCount: 142,
    authorName: 'Alex Rivera',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    workspaceId: 'ws-1',
    theme: PRESET_THEMES[0],
    settings: {
      collectEmail: true,
      limitOneResponse: true,
      allowEditResponse: false,
      saveProgress: true,
      showProgressBar: true,
      shuffleQuestions: false,
      quizMode: true,
      releaseGradeImmediately: true,
      confirmationMessage: 'Thank you for your feedback! Your evaluation score has been recorded.'
    },
    sections: [
      { id: 'sec-1', title: 'Student Information & Background', description: 'Please provide your details for course verification.' },
      { id: 'sec-2', title: 'Course Quality & Lab Assessment', description: 'Rate the lectures, labs, and assignments.' }
    ],
    logicRules: [
      {
        id: 'log-1',
        sourceQuestionId: 'q-is-enrolled',
        operator: 'equals',
        value: 'Yes, full-time',
        action: 'show',
        targetQuestionId: 'q-major'
      }
    ],
    versions: [],
    questions: [
      {
        id: 'q-name',
        sectionId: 'sec-1',
        type: 'short_answer',
        title: 'Full Student Name',
        placeholder: 'e.g. Maya Lin',
        required: true,
      },
      {
        id: 'q-email',
        sectionId: 'sec-1',
        type: 'email',
        title: 'University Email Address',
        placeholder: 'student@university.edu',
        required: true,
        validation: { required: true, pattern: '^[^@]+@[^@]+\\.[^@]+$' }
      },
      {
        id: 'q-is-enrolled',
        sectionId: 'sec-1',
        type: 'multiple_choice',
        title: 'Are you officially enrolled in CS304?',
        required: true,
        options: [
          { id: 'opt-1', label: 'Yes, full-time student' },
          { id: 'opt-2', label: 'Auditing course' },
          { id: 'opt-3', label: 'Teaching Assistant' }
        ]
      },
      {
        id: 'q-major',
        sectionId: 'sec-1',
        type: 'dropdown',
        title: 'Academic Department / Major',
        required: false,
        options: [
          { id: 'm-1', label: 'Computer Science & Engineering' },
          { id: 'm-2', label: 'Data Science & AI' },
          { id: 'm-3', label: 'Electrical Engineering' },
          { id: 'm-4', label: 'Information Technology' }
        ]
      },
      {
        id: 'q-rating-pacing',
        sectionId: 'sec-2',
        type: 'scale',
        title: 'How would you rate the pacing of practical lab assignments?',
        description: '1 = Too slow, 5 = Balanced, 10 = Extremely fast / intense',
        required: true,
        scaleMin: 1,
        scaleMax: 10,
        scaleMinLabel: 'Too slow',
        scaleMaxLabel: 'Overwhelmingly fast'
      },
      {
        id: 'q-fav-topics',
        sectionId: 'sec-2',
        type: 'checkboxes',
        title: 'Which key course modules did you find most valuable?',
        required: true,
        options: [
          { id: 't-1', label: 'Dynamic Programming & Graph Algorithms' },
          { id: 't-2', label: 'Modern React Architecture & WebGL 3D' },
          { id: 't-3', label: 'Distributed Systems & Database Indexing' },
          { id: 't-4', label: 'AI Prompt Engineering & LLM APIs' }
        ]
      },
      {
        id: 'q-algo-quiz',
        sectionId: 'sec-2',
        type: 'multiple_choice',
        title: 'Quick Knowledge Check: What is the worst-case time complexity of QuickSelect?',
        description: 'Quiz Question (worth 10 points)',
        required: true,
        points: 10,
        correctAnswer: 'opt-q-3',
        options: [
          { id: 'opt-q-1', label: 'O(1)' },
          { id: 'opt-q-2', label: 'O(N log N)' },
          { id: 'opt-q-3', label: 'O(N²)', isCorrect: true },
          { id: 'opt-q-4', label: 'O(2^N)' }
        ]
      },
      {
        id: 'q-suggestions',
        sectionId: 'sec-2',
        type: 'paragraph',
        title: 'What specific improvements would you suggest for next semester?',
        placeholder: 'Share any lab exercises, project ideas, or lecture topic requests...',
        required: false
      }
    ]
  },
  {
    id: 'form-summit-rsvp',
    title: 'Cyberpunk 2026 Developer Summit Application',
    description: 'Apply for keynotes, workshops, and VIP access at the premier 3D & AI Web Engineering Conference.',
    isPublished: true,
    status: 'published',
    createdAt: '2026-08-05T09:00:00Z',
    updatedAt: '2026-08-12T14:10:00Z',
    responseCount: 389,
    authorName: 'Elena Rostova',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    workspaceId: 'ws-1',
    theme: PRESET_THEMES[2], // Cyber
    settings: {
      collectEmail: true,
      limitOneResponse: true,
      allowEditResponse: true,
      saveProgress: true,
      showProgressBar: true,
      shuffleQuestions: false,
      quizMode: false,
      releaseGradeImmediately: false,
      confirmationMessage: 'Application received! You will receive VIP pass confirmation via email within 48 hours.'
    },
    sections: [
      { id: 'sec-s1', title: 'Attendee Profile', description: 'Tell us about your technical background.' }
    ],
    logicRules: [],
    versions: [],
    questions: [
      {
        id: 'qs-1',
        sectionId: 'sec-s1',
        type: 'short_answer',
        title: 'Full Name',
        placeholder: 'Sarah Connor',
        required: true
      },
      {
        id: 'qs-2',
        sectionId: 'sec-s1',
        type: 'email',
        title: 'Work Email Address',
        placeholder: 'sarah@techcorp.io',
        required: true
      },
      {
        id: 'qs-3',
        sectionId: 'sec-s1',
        type: 'dropdown',
        title: 'Primary Engineering Role',
        required: true,
        options: [
          { id: 'r-1', label: 'Frontend Architect / 3D Dev' },
          { id: 'r-2', label: 'Full Stack Engineer' },
          { id: 'r-3', label: 'AI/ML Systems Specialist' },
          { id: 'r-4', label: 'Product Designer / UX Engineer' },
          { id: 'r-5', label: 'Engineering Lead / CTO' }
        ]
      },
      {
        id: 'qs-4',
        sectionId: 'sec-s1',
        type: 'rating',
        title: 'How many years of experience do you have with Three.js / WebGL / Framer Motion?',
        required: true,
        ratingMax: 5
      },
      {
        id: 'qs-5',
        sectionId: 'sec-s1',
        type: 'url',
        title: 'GitHub or Portfolio URL',
        placeholder: 'https://github.com/username',
        required: true
      }
    ]
  },
  {
    id: 'form-job-app',
    title: 'Senior Frontend & UX Architect Application',
    description: 'Join the Gradient Forms core product team building next-generation SaaS workspace tools.',
    isPublished: true,
    status: 'published',
    createdAt: '2026-08-08T11:00:00Z',
    updatedAt: '2026-08-13T18:00:00Z',
    responseCount: 68,
    authorName: 'Alex Rivera',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    workspaceId: 'ws-1',
    theme: PRESET_THEMES[1], // Nebula
    settings: {
      collectEmail: true,
      limitOneResponse: true,
      allowEditResponse: false,
      saveProgress: true,
      showProgressBar: true,
      shuffleQuestions: false,
      quizMode: false,
      releaseGradeImmediately: false,
      confirmationMessage: 'Thank you for applying! Our engineering team will review your portfolio.'
    },
    sections: [
      { id: 'j-1', title: 'Applicant Details', description: 'Personal details and credentials.' }
    ],
    logicRules: [],
    versions: [],
    questions: [
      {
        id: 'jq-1',
        sectionId: 'j-1',
        type: 'short_answer',
        title: 'Full Name',
        required: true
      },
      {
        id: 'jq-2',
        sectionId: 'j-1',
        type: 'email',
        title: 'Email Address',
        required: true
      },
      {
        id: 'jq-3',
        sectionId: 'j-1',
        type: 'file_upload',
        title: 'Attach Resume / CV (PDF)',
        helpText: 'Max file size: 10MB',
        required: true
      },
      {
        id: 'jq-4',
        sectionId: 'j-1',
        type: 'paragraph',
        title: 'What is the most technically complex web UI or 3D feature you have built?',
        required: true
      }
    ]
  }
];

export const SEED_RESPONSES: FormResponse[] = [
  {
    id: 'resp-101',
    formId: 'form-cs-feedback',
    submittedAt: '2026-08-14T14:22:00Z',
    respondentEmail: 'jordan.lee@university.edu',
    respondentName: 'Jordan Lee',
    score: 10,
    maxScore: 10,
    timeSpentSeconds: 145,
    answers: {
      'q-name': 'Jordan Lee',
      'q-email': 'jordan.lee@university.edu',
      'q-is-enrolled': 'Yes, full-time student',
      'q-major': 'Computer Science & Engineering',
      'q-rating-pacing': 8,
      'q-fav-topics': ['Modern React Architecture & WebGL 3D', 'AI Prompt Engineering & LLM APIs'],
      'q-algo-quiz': 'opt-q-3',
      'q-suggestions': 'Loved the hands-on WebGL 3D assignments! Would like more deep-dives into real-time WebSockets next term.'
    }
  },
  {
    id: 'resp-102',
    formId: 'form-cs-feedback',
    submittedAt: '2026-08-14T11:05:00Z',
    respondentEmail: 'amara.okafor@university.edu',
    respondentName: 'Amara Okafor',
    score: 0,
    maxScore: 10,
    timeSpentSeconds: 180,
    answers: {
      'q-name': 'Amara Okafor',
      'q-email': 'amara.okafor@university.edu',
      'q-is-enrolled': 'Yes, full-time student',
      'q-major': 'Data Science & AI',
      'q-rating-pacing': 6,
      'q-fav-topics': ['Dynamic Programming & Graph Algorithms'],
      'q-algo-quiz': 'opt-q-2',
      'q-suggestions': 'Provide clearer grading rubrics for midterm projects.'
    }
  },
  {
    id: 'resp-103',
    formId: 'form-cs-feedback',
    submittedAt: '2026-08-13T16:40:00Z',
    respondentEmail: 'lucas.silva@university.edu',
    respondentName: 'Lucas Silva',
    score: 10,
    maxScore: 10,
    timeSpentSeconds: 110,
    answers: {
      'q-name': 'Lucas Silva',
      'q-email': 'lucas.silva@university.edu',
      'q-is-enrolled': 'Yes, full-time student',
      'q-major': 'Computer Science & Engineering',
      'q-rating-pacing': 9,
      'q-fav-topics': ['Modern React Architecture & WebGL 3D', 'Distributed Systems & Database Indexing'],
      'q-algo-quiz': 'opt-q-3',
      'q-suggestions': 'The course was phenomenal!'
    }
  },
  {
    id: 'resp-201',
    formId: 'form-summit-rsvp',
    submittedAt: '2026-08-12T09:15:00Z',
    respondentEmail: 'kaito.t@techcorp.jp',
    respondentName: 'Kaito Tanaka',
    timeSpentSeconds: 95,
    answers: {
      'qs-1': 'Kaito Tanaka',
      'qs-2': 'kaito.t@techcorp.jp',
      'qs-3': 'Frontend Architect / 3D Dev',
      'qs-4': 5,
      'qs-5': 'https://github.com/kaito-dev'
    }
  },
  {
    id: 'resp-tf2-001',
    formId: 'form-trial-2-antigraviti',
    submittedAt: '2026-08-26T17:45:00Z',
    respondentEmail: 'alex.rivera@gradient.io',
    respondentName: 'Alex Rivera',
    timeSpentSeconds: 42,
    answers: {
      'q-tf2-1': 'Alex Rivera',
      'q-tf2-2': 'alex.rivera@gradient.io',
      'q-tf2-3': 'React + TypeScript',
      'q-tf2-4': ['Three.js / WebGL 3D UI', 'Automated Vitest & Unit Testing'],
      'q-tf2-5': 5,
      'q-tf2-6': 10,
      'q-tf2-7': '2026-08-26',
      'q-tf2-8': true
    }
  },
  {
    id: 'resp-tf2-002',
    formId: 'form-trial-2-antigraviti',
    submittedAt: '2026-08-26T17:52:00Z',
    respondentEmail: 'elena.rostova@gradient.io',
    respondentName: 'Elena Rostova',
    timeSpentSeconds: 35,
    answers: {
      'q-tf2-1': 'Elena Rostova',
      'q-tf2-2': 'elena.rostova@gradient.io',
      'q-tf2-3': 'Next.js App Router',
      'q-tf2-4': ['Advanced State & Context Management', 'REST API & Prisma Database'],
      'q-tf2-5': 5,
      'q-tf2-6': 9,
      'q-tf2-7': '2026-08-26',
      'q-tf2-8': true
    }
  }
];
