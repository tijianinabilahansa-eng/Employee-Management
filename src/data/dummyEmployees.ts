/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Employee } from '../types';

export function normalizeEmployees(input: unknown[]): Employee[] {
  if (!Array.isArray(input)) return [];

  return input.map((item, index) => {
    const employee = (item ?? {}) as Partial<Employee> & Record<string, unknown>;

    const username = String(employee.username || `employee-${index + 1}`).trim();
    const firstName = String(employee.firstName || 'Employee').trim();
    const lastName = String(employee.lastName || String(index + 1)).trim();
    const email = String(employee.email || `employee${index + 1}@example.com`).trim();
    const birthDate = typeof employee.birthDate === 'string' && employee.birthDate ? employee.birthDate : new Date().toISOString();
    const basicSalary = Number(employee.basicSalary ?? 0);
    const status = String(employee.status || 'Active').trim() || 'Active';
    const group = String(employee.group || 'Unassigned').trim() || 'Unassigned';
    const description = typeof employee.description === 'string' && employee.description ? employee.description : new Date().toISOString();

    return {
      username: username || `employee-${index + 1}`,
      firstName: firstName || 'Employee',
      lastName: lastName || String(index + 1),
      email: email || `employee${index + 1}@example.com`,
      birthDate,
      basicSalary: Number.isFinite(basicSalary) ? basicSalary : 0,
      status,
      group,
      description
    };
  });
}

export const DUMMY_GROUPS = [
  'IT Support',
  'Human Resources',
  'Finance & Accounting',
  'Marketing & Sales',
  'Operations',
  'Product Management',
  'Quality Assurance',
  'Legal & Compliance',
  'Customer Success',
  'Research & Development'
];

export const DUMMY_STATUSES = [
  'Active',
  'Inactive',
  'Contract',
  'Probation',
  'Suspended'
];

const INDO_FIRST_NAMES = [
  'Budi', 'Siti', 'Joko', 'Ani', 'Bambang', 'Sri', 'Agus', 'Dewi', 'Hendra', 'Indah',
  'Yusuf', 'Rini', 'Anton', 'Megawati', 'Rudi', 'Kartika', 'Ahmad', 'Lilis', 'Eko', 'Yanti',
  'Taufik', 'Dian', 'Adi', 'Ratna', 'Surya', 'Maria', 'Heri', 'Tri', 'Agung', 'Linda',
  'Fajar', 'Novi', 'Rian', 'Riska', 'Andi', 'Fitri', 'Dedi', 'Wulan', 'Aris', 'Siska',
  'Denny', 'Sari', 'Indra', 'Ayu', 'Roni', 'Nita', 'Arif', 'Eva', 'Sony', 'Gita'
];

const INDO_LAST_NAMES = [
  'Santoso', 'Aminah', 'Widodo', 'Suryani', 'Wijaya', 'Lestari', 'Pratama', 'Wulandari', 'Hidayat', 'Purwanti',
  'Saputra', 'Kusuma', 'Setiawan', 'Siregar', 'Nasution', 'Ginting', 'Harahap', 'Panjaitan', 'Simanjuntak', 'Situmorang',
  'Hutapea', 'Sinaga', 'Sitorus', 'Lubis', 'Tanjung', 'Sembiring', 'Tarigan', 'Sitepu', 'Barus', 'Meliala',
  'Pramono', 'Subekti', 'Kurniawan', 'Nugroho', 'Prasetyo', 'Budiman', 'Gunawan', 'Sutrisno', 'Haryanto', 'Wibowo',
  'Purnomo', 'Suhendra', 'Dharmawan', 'Sucipto', 'Sudarsono', 'Hardjo', 'Kartanegara', 'Adiningrat', 'Wiryawan', 'Yulianto'
];

export function generate100Employees(): Employee[] {
  const list: Employee[] = [];
  
  // Use a pseudo-random approach based on index to make it perfectly deterministic on initial load
  for (let i = 1; i <= 100; i++) {
    const fNameIdx = (i * 3 + 7) % INDO_FIRST_NAMES.length;
    const lNameIdx = (i * 7 + 13) % INDO_LAST_NAMES.length;
    const firstName = INDO_FIRST_NAMES[fNameIdx];
    const lastName = INDO_LAST_NAMES[lNameIdx];
    
    const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@comp.id`;
    
    // Distribute birth years between 1970 and 2004
    const birthYear = 1970 + (i % 35);
    const birthMonth = String((i % 12) + 1).padStart(2, '0');
    const birthDay = String((i % 28) + 1).padStart(2, '0');
    const birthHour = String(i % 24).padStart(2, '0');
    const birthMin = String((i * 3) % 60).padStart(2, '0');
    const birthDate = `${birthYear}-${birthMonth}-${birthDay}T${birthHour}:${birthMin}:00Z`;
    
    // Salaries between Rp. 4,500,000 and Rp. 32,000,000
    const basicSalary = 4500000 + ((i * 275000) % 27500000);
    
    const status = DUMMY_STATUSES[i % DUMMY_STATUSES.length];
    const group = DUMMY_GROUPS[i % DUMMY_GROUPS.length];
    
    // Description:datetime - let's make this represent hiring date/time or record creation time
    const descYear = 2015 + (i % 11);
    const descMonth = String(((i * 2) % 12) + 1).padStart(2, '0');
    const descDay = String(((i * 3) % 28) + 1).padStart(2, '0');
    const descDate = `${descYear}-${descMonth}-${descDay}T09:00:00Z`;

    list.push({
      username,
      firstName,
      lastName,
      email,
      birthDate,
      basicSalary,
      status,
      group,
      description: descDate
    });
  }
  
  return list;
}

export function getEmployeesFromStorage(): Employee[] {
  const data = localStorage.getItem('employee_management_employees');
  if (data) {
    try {
      const parsed = JSON.parse(data);
      return normalizeEmployees(parsed);
    } catch (e) {
      console.error('Error parsing employee data from localStorage', e);
    }
  }
  
  // If not present, generate and save
  const initial = generate100Employees();
  localStorage.setItem('employee_management_employees', JSON.stringify(initial));
  return initial;
}

export function saveEmployeesToStorage(employees: Employee[]): void {
  localStorage.setItem('employee_management_employees', JSON.stringify(employees));
}
