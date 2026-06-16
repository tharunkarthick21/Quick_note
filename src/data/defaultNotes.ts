/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Note } from '../types';

export const INITIAL_NOTES: Note[] = [
  {
    id: 'note-1',
    title: 'Quarterly Product Roadmap',
    content: 'Focus on the productivity-driven minimalism aesthetic for the next sprint. Need to finalize the 4px grid implementation and ensure accessibility compliance across all components, keeping page loading under 100ms.',
    tags: ['STRATEGY', 'Q3', 'WORK'],
    isPinned: true,
    createdAt: '2026-06-12T10:00:00.000Z',
    updatedAt: '2026-06-12T10:00:00.000Z',
    attachmentsCount: 0
  },
  {
    id: 'note-2',
    title: 'The Architecture of Minimalist Interfaces',
    content: 'Productivity-driven minimalism is not about doing less, but about removing the obstacles to thought. When designing an interface for a note-taking application, every pixel must justify its existence.\n\nMathematical spacing creates a rhythm that the mind recognizes as order. The 4px grid used here isn\'t just a constraint; it\'s a structural foundation that ensures cognitive load remains low.\n\nKey Principles:\n1. Tonal layering over heavy shadows.\n2. Typography as the primary visual driver.\n3. Restricted color palettes for focus.',
    tags: ['IDEA', 'PROJECT'],
    isPinned: true,
    createdAt: '2026-06-14T11:45:00.000Z',
    updatedAt: '2026-06-16T11:45:00.000Z',
    attachmentsCount: 0
  },
  {
    id: 'note-3',
    title: 'Grocery List',
    content: '- Oat milk (unsweetened)\n- Fresh basil and tomatoes\n- Sourdough loaf\n- Coffee beans (medium roast)',
    tags: ['PERSONAL'],
    isPinned: false,
    createdAt: '2026-06-15T08:30:00.000Z',
    updatedAt: '2026-06-15T08:32:00.000Z',
    attachmentsCount: 0
  },
  {
    id: 'note-4',
    title: 'Meeting Notes: Design System',
    content: 'Discussed the importance of "structured freedom". Use subtle outlines instead of heavy shadows. Standardize the 800px max-width for the core writing canvas so reading line length remains optimal (45-75 characters).',
    tags: ['WORK', 'DESIGN'],
    isPinned: false,
    createdAt: '2026-06-13T14:10:00.000Z',
    updatedAt: '2026-06-13T15:00:00.000Z',
    attachmentsCount: 0
  },
  {
    id: 'note-5',
    title: 'Project Inspiration',
    content: 'Looking at Brutalist architecture for UI layout ideas. Emphasis on raw materials, honest structure, and clear hierarchy. Limit card depth and use simple solid borders to separate sections.',
    tags: ['IDEAS', 'DESIGN'],
    isPinned: false,
    createdAt: '2026-06-12T09:15:00.000Z',
    updatedAt: '2026-06-12T09:15:00.000Z',
    attachmentsCount: 1
  },
  {
    id: 'note-6',
    title: 'Meeting Minutes: Sync with Dev Team',
    content: 'Discussed API documentation and the new authentication flow. Security guidelines mandate using server-side proxies for all secret API keys to shield client browsers.',
    tags: ['WORK'],
    isPinned: false,
    createdAt: '2026-06-10T11:00:00.000Z',
    updatedAt: '2026-06-10T11:30:00.000Z',
    attachmentsCount: 0
  },
  {
    id: 'note-7',
    title: 'Workspace Redesign Concept',
    content: 'Moodboard and layout ideas for the new office environment. Standardizing the collaboration hubs and drafting ergonomics standards for personal desks.',
    tags: ['WORK', 'DESIGN'],
    isPinned: false,
    createdAt: '2026-06-08T16:20:00.000Z',
    updatedAt: '2026-06-08T16:20:00.000Z',
    attachmentsCount: 2
  },
  {
    id: 'note-8',
    title: 'Email Draft: Client Onboarding',
    content: 'Standardizing the introduction and resource sharing process. Here is the list of topics we should cover in our first kickoff session:\n1. Scope validation & priorities definition\n2. Design system overview\n3. Milestones tracking sheet setup',
    tags: ['WORK'],
    isPinned: false,
    createdAt: '2026-06-05T13:45:00.000Z',
    updatedAt: '2026-06-05T14:15:00.000Z',
    attachmentsCount: 0
  }
];
