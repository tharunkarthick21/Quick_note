/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
  attachmentsCount?: number;
}

export type ActiveTab = 'all' | 'pinned' | 'tags';
