/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Employee {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string; // Datetime stored as ISO String
  basicSalary: number; // Double/Number
  status: string; // e.g. Active, Inactive, Contract
  group: string; // One of 10 dummy groups
  description: string; // Datetime stored as ISO String, as per "description:datetime" requirement
}

export type PageType = 'LOGIN' | 'LIST' | 'ADD' | 'DETAIL';

export interface SearchState {
  searchQuery1: string;
  searchField1: keyof Employee | 'all';
  searchQuery2: string;
  searchField2: keyof Employee | 'all';
  currentPage: number;
  pageSize: number;
  sortColumn: keyof Employee | null;
  sortDirection: 'asc' | 'desc';
}
