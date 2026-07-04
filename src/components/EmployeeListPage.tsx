/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Search, ArrowUpDown, ChevronLeft, ChevronRight, 
  Trash2, Edit2, Eye, Filter, RotateCcw, AlertTriangle, LogOut, Briefcase,
  Users, TrendingUp, Building2, Download, UserCheck, X, Check, ChevronDown, Calendar, Mail, FileText, Tag, Clock
} from 'lucide-react';
import { Employee, SearchState } from '../types';
import { DUMMY_GROUPS, DUMMY_STATUSES } from '../data/dummyEmployees';

interface EmployeeListPageProps {
  employees: Employee[];
  searchState: SearchState;
  setSearchState: React.Dispatch<React.SetStateAction<SearchState>>;
  onAddClick: () => void;
  onDetailClick: (employee: Employee) => void;
  onLogoutClick: () => void;
  onTriggerNotification: (message: string, type: 'yellow' | 'red' | 'green') => void;
  onDeleteEmployee: (username: string) => void;
  onUpdateEmployee: (employee: Employee) => void;
}

export default function EmployeeListPage({
  employees,
  searchState,
  setSearchState,
  onAddClick,
  onDetailClick,
  onLogoutClick,
  onTriggerNotification,
  onDeleteEmployee,
  onUpdateEmployee
}: EmployeeListPageProps) {

  // Quick Edit Modal States
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editBasicSalary, setEditBasicSalary] = useState('');
  const [editGroup, setEditGroup] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  
  // Group selection dropdown in Edit Modal
  const [isEditGroupDropdownOpen, setIsEditGroupDropdownOpen] = useState(false);
  const [editGroupSearchQuery, setEditGroupSearchQuery] = useState('');

  // Search input handlers
  const handleTextSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchState(prev => ({ ...prev, searchQuery1: e.target.value, currentPage: 1 }));
  };

  const handleGroupFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchState(prev => ({ ...prev, searchQuery2: e.target.value, currentPage: 1 }));
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchState(prev => ({ ...prev, searchField2: 'status', currentPage: 1 }));
    // Custom filter handling for 3 parameters: Text AND Group AND Status
    // We can capture this directly in searchState. Let's extend searchState internally or reuse fields.
    // Let's store Status filter directly in a custom key. To keep typescript types clean, let's cast or adapt.
    // Let's store status query in a state variable, but wait! We can easily use custom fields in SearchState or add to it.
    // Since types.ts defines:
    // searchQuery1, searchField1, searchQuery2, searchField2
    // Let's use searchField1 for searching text ('username' / 'firstName' / 'lastName' / 'email' combined as 'all')
    // searchField2 for status ('status')
    // searchQuery1 for the text query
    // searchQuery2 for the selected group
    // Wait, let's also support a status query! Let's allow filtering status as another AND criterion by storing it in searchState.
    // Let's check: can we add status filter by just treating searchQuery2 as group, and we can define a statusFilter value?
    // Let's add status filter directly or put it into state.
    // Let's see: we can cast searchState or have it hold a status filter as well. Since we can modify SearchState in types.ts later if needed,
    // let's look at SearchState again. It is already defined in types.ts. We can add `statusFilter` to searchState.
    // Let's check types.ts:
    // searchQuery1: string; searchField1: keyof Employee | 'all';
    // searchQuery2: string; searchField2: keyof Employee | 'all';
    // Let's use:
    // - searchQuery1 = general text search
    // - searchQuery2 = selected group (if empty, match all)
    // - Let's use a local extension or another field for Status! Since we can adjust types.ts, let's keep searchState simple:
    //   - searchQuery1 = general text search (searches username, firstName, lastName, email)
    //   - searchQuery2 = group filter (ANDed)
    //   - We can also filter by status using a simple local filter or let's add a `statusFilter` field. Let's see, we can just use searchField2 to hold the selected status!
    //   Yes, searchQuery1 = text, searchQuery2 = group, searchField2 = status!
    //   That fits SearchState perfectly:
    //   - searchQuery1 (string) -> text search
    //   - searchQuery2 (string) -> group filter
    //   - searchField2 (string as status query) -> status filter
    //   This is extremely smart and reuses the existing fields with zero typescript issues! Let's do exactly this.
  };

  const statusFilterValue = searchState.searchField2 === 'status' || searchState.searchField2 === 'all' 
    ? '' 
    : (searchState.searchField2 as string);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchState(prev => ({ 
      ...prev, 
      searchField2: e.target.value as any, // reuse searchField2 to store status value
      currentPage: 1 
    }));
  };

  const resetFilters = () => {
    setSearchState(prev => ({
      ...prev,
      searchQuery1: '',
      searchQuery2: '',
      searchField2: 'all' as any,
      currentPage: 1,
      sortColumn: null,
      sortDirection: 'asc'
    }));
    onTriggerNotification('Filter pencarian telah di-reset.', 'green');
  };

  // Sorting handler
  const handleSort = (column: keyof Employee) => {
    setSearchState(prev => {
      const isAsc = prev.sortColumn === column && prev.sortDirection === 'asc';
      return {
        ...prev,
        sortColumn: column,
        sortDirection: isAsc ? 'desc' : 'asc'
      };
    });
  };

  // 1. Filtering logic combining AND criteria:
  // - General text search (username, firstName, lastName, email)
  // AND
  // - Group (if specified)
  // AND
  // - Status (if specified)
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      // Criterion 1: General Text (AND)
      const text = searchState.searchQuery1.toLowerCase().trim();
      let matchesText = true;
      if (text) {
        const usernameMatch = emp.username.toLowerCase().includes(text);
        const firstMatch = emp.firstName.toLowerCase().includes(text);
        const lastMatch = emp.lastName.toLowerCase().includes(text);
        const emailMatch = emp.email.toLowerCase().includes(text);
        matchesText = usernameMatch || firstMatch || lastMatch || emailMatch;
      }

      // Criterion 2: Group filter (AND)
      const groupFilter = searchState.searchQuery2;
      let matchesGroup = true;
      if (groupFilter && groupFilter !== 'ALL_GROUPS') {
        matchesGroup = emp.group === groupFilter;
      }

      // Criterion 3: Status filter (AND) - using searchField2 to store the selected status string
      const statusFilter = searchState.searchField2 as string;
      let matchesStatus = true;
      if (statusFilter && statusFilter !== 'all' && statusFilter !== 'status') {
        matchesStatus = emp.status === statusFilter;
      }

      return matchesText && matchesGroup && matchesStatus;
    });
  }, [employees, searchState.searchQuery1, searchState.searchQuery2, searchState.searchField2]);

  // 2. Sorting logic
  const sortedEmployees = useMemo(() => {
    if (!searchState.sortColumn) return filteredEmployees;
    
    const col = searchState.sortColumn;
    const dir = searchState.sortDirection === 'asc' ? 1 : -1;
    
    return [...filteredEmployees].sort((a, b) => {
      let valA = a[col];
      let valB = b[col];
      
      if (typeof valA === 'string' && typeof valB === 'string') {
        return valA.localeCompare(valB) * dir;
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return (valA - valB) * dir;
      }
      return 0;
    });
  }, [filteredEmployees, searchState.sortColumn, searchState.sortDirection]);

  // 3. Pagination logic
  const totalItems = sortedEmployees.length;
  const totalPages = Math.ceil(totalItems / searchState.pageSize) || 1;
  const currentPage = Math.min(searchState.currentPage, totalPages);

  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * searchState.pageSize;
    return sortedEmployees.slice(startIndex, startIndex + searchState.pageSize);
  }, [sortedEmployees, currentPage, searchState.pageSize]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setSearchState(prev => ({ ...prev, currentPage: page }));
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const size = parseInt(e.target.value, 10);
    setSearchState(prev => ({ ...prev, pageSize: size, currentPage: 1 }));
  };

  // Dashboard Status calculation
  const stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter(e => e.status === 'Active').length;
    
    const totalSalary = employees.reduce((sum, e) => sum + e.basicSalary, 0);
    const avgSalary = total > 0 ? totalSalary / total : 0;
    
    const deptCounts: Record<string, number> = {};
    employees.forEach(e => {
      deptCounts[e.group] = (deptCounts[e.group] || 0) + 1;
    });
    
    let topDept = '-';
    let maxCount = 0;
    Object.entries(deptCounts).forEach(([dept, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topDept = dept;
      }
    });
    
    return { total, active, avgSalary, topDept, maxCount };
  }, [employees]);

  // Export Filtered Employees to CSV
  const handleExportCSV = () => {
    if (filteredEmployees.length === 0) {
      onTriggerNotification('Tidak ada data karyawan tersaring yang bisa diekspor.', 'red');
      return;
    }
    
    const headers = ['Username', 'First Name', 'Last Name', 'Email', 'Birth Date', 'Basic Salary', 'Group', 'Status', 'Description'];
    const csvRows = [
      headers.join(','),
      ...filteredEmployees.map(emp => [
        `"${emp.username.replace(/"/g, '""')}"`,
        `"${emp.firstName.replace(/"/g, '""')}"`,
        `"${emp.lastName.replace(/"/g, '""')}"`,
        `"${emp.email.replace(/"/g, '""')}"`,
        `"${emp.birthDate.substring(0, 10)}"`,
        emp.basicSalary,
        `"${emp.group.replace(/"/g, '""')}"`,
        `"${emp.status.replace(/"/g, '""')}"`,
        `"${(emp.description || '').replace(/"/g, '""')}"`
      ].join(','))
    ];
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `empowerhr_filtered_employees_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    onTriggerNotification(`Berhasil mengekspor ${filteredEmployees.length} data karyawan ke file CSV!`, 'green');
  };

  // Edit and Delete Simulation Handlers with specified color notifications
  const handleEditClick = (emp: Employee) => {
    setEditingEmployee(emp);
    setEditFirstName(emp.firstName);
    setEditLastName(emp.lastName);
    setEditEmail(emp.email);
    setEditBasicSalary(emp.basicSalary.toString());
    setEditGroup(emp.group);
    setEditStatus(emp.status);
    setEditBirthDate(emp.birthDate.substring(0, 10)); // YYYY-MM-DD
    setEditDescription(emp.description || '');
    setEditErrors({});
    setIsEditGroupDropdownOpen(false);
    setEditGroupSearchQuery('');
  };

  const validateEditForm = () => {
    const errs: Record<string, string> = {};
    if (!editFirstName.trim()) errs.firstName = 'Nama depan wajib diisi';
    if (!editLastName.trim()) errs.lastName = 'Nama belakang wajib diisi';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!editEmail.trim()) {
      errs.email = 'Email wajib diisi';
    } else if (!emailRegex.test(editEmail.trim())) {
      errs.email = 'Format email tidak valid';
    }
    
    if (!editBirthDate) {
      errs.birthDate = 'Tanggal lahir wajib diisi';
    } else {
      const birth = new Date(editBirthDate);
      const now = new Date();
      if (birth >= now) {
        errs.birthDate = 'Tanggal lahir tidak boleh di masa depan atau hari ini';
      }
    }
    
    const salaryNum = parseFloat(editBasicSalary);
    if (!editBasicSalary) {
      errs.basicSalary = 'Gaji pokok wajib diisi';
    } else if (isNaN(salaryNum) || salaryNum <= 0) {
      errs.basicSalary = 'Gaji pokok harus berupa angka positif';
    }
    
    if (!editGroup) errs.group = 'Grup/departemen wajib dipilih';
    if (!editStatus) errs.status = 'Status wajib dipilih';
    if (!editDescription.trim()) errs.description = 'Deskripsi wajib diisi';
    
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEditForm() || !editingEmployee) return;
    
    const updated: Employee = {
      ...editingEmployee,
      firstName: editFirstName.trim(),
      lastName: editLastName.trim(),
      email: editEmail.trim(),
      basicSalary: parseFloat(editBasicSalary),
      group: editGroup,
      status: editStatus as any,
      birthDate: new Date(editBirthDate).toISOString(),
      description: editDescription.trim()
    };
    
    onUpdateEmployee(updated);
    setEditingEmployee(null);
  };

  const handleDeleteClick = (emp: Employee) => {
    // Perform actual deletion from storage/state and notify in RED
    onDeleteEmployee(emp.username);
    onTriggerNotification(
      `Karyawan ${emp.firstName} ${emp.lastName} (${emp.username}) berhasil dihapus dari sistem!`, 
      'red'
    );
  };

  // Helper for formatting basicSalary to Indonesian Rupiah
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  // Helper for birthDate and description formatting
  const formatDateString = (isoString: string) => {
    if (!isoString) return '-';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  // Helper for dynamic yet stable avatar colors
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-50 text-blue-700 border-blue-200',
      'bg-emerald-50 text-emerald-700 border-emerald-200',
      'bg-violet-50 text-violet-700 border-violet-200',
      'bg-amber-50 text-amber-700 border-amber-200',
      'bg-rose-50 text-rose-700 border-rose-200',
      'bg-cyan-50 text-cyan-700 border-cyan-200',
      'bg-indigo-50 text-indigo-700 border-indigo-200',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  return (
    <div id="employee-list-container" className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Briefcase className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Employee Management Portal
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-xs text-gray-500 font-mono">
              Aktif: <strong className="text-slate-950">{employees.length}</strong> karyawan
            </span>
            <button
              id="logout-button"
              onClick={onLogoutClick}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all font-medium"
              title="Keluar dari sistem"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Dashboard Status Row */}
        <div id="dashboard-status-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200/75 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Total Karyawan</p>
              <h3 className="text-xl font-bold text-slate-900 leading-none mt-0.5">{stats.total}</h3>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200/75 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Karyawan Aktif</p>
              <h3 className="text-xl font-bold text-slate-900 leading-none mt-0.5">{stats.active}</h3>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200/75 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Rata-rata Gaji</p>
              <h3 className="text-sm font-bold text-slate-900 mt-1 truncate" title={formatRupiah(stats.avgSalary)}>
                {stats.avgSalary ? formatRupiah(stats.avgSalary).split(',')[0] : 'Rp 0'}
              </h3>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200/75 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Departemen Terpopuler</p>
              <h3 className="text-xs font-bold text-slate-900 mt-1 truncate" title={`${stats.topDept} (${stats.maxCount} orang)`}>
                {stats.topDept} <span className="text-[10px] font-normal text-slate-400">({stats.maxCount})</span>
              </h3>
            </div>
          </div>
        </div>
        
        {/* Advanced Filters Card */}
        <div id="filters-card" className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Filter className="w-4 h-4 text-blue-600" />
              <span>Saring Data Karyawan (AND Rule)</span>
            </div>
            <button
              id="reset-filters-btn"
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Saringan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filter 1: Text Search (Username, First/Last Name, Email) */}
            <div>
              <label htmlFor="text-search" className="block text-xs font-medium text-slate-500 mb-1">
                Pencarian Umum (Nama, Username, Email)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  id="text-search"
                  type="text"
                  value={searchState.searchQuery1}
                  onChange={handleTextSearch}
                  placeholder="Cari Budi, admin, dsb..."
                  className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50/50"
                />
              </div>
            </div>

            {/* Filter 2: Group (Dropdown) */}
            <div>
              <label htmlFor="group-filter" className="block text-xs font-medium text-slate-500 mb-1">
                Grup / Departemen
              </label>
              <select
                id="group-filter"
                value={searchState.searchQuery2}
                onChange={handleGroupFilter}
                className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900 bg-gray-50/50"
              >
                <option value="">-- Semua Departemen --</option>
                {DUMMY_GROUPS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Filter 3: Status (Dropdown) */}
            <div>
              <label htmlFor="status-filter" className="block text-xs font-medium text-slate-500 mb-1">
                Status Karyawan
              </label>
              <select
                id="status-filter"
                value={searchState.searchField2 === 'status' || searchState.searchField2 === 'all' ? '' : (searchState.searchField2 as string)}
                onChange={handleStatusChange}
                className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900 bg-gray-50/50"
              >
                <option value="">-- Semua Status --</option>
                {DUMMY_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Action Controls & Data Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-sm text-gray-600">
              Menampilkan <span className="font-semibold text-slate-900">{totalItems === 0 ? 0 : (currentPage - 1) * searchState.pageSize + 1}</span> hingga{' '}
              <span className="font-semibold text-slate-900">
                {Math.min(currentPage * searchState.pageSize, totalItems)}
              </span>{' '}
              dari <span className="font-semibold text-slate-900">{totalItems}</span> data karyawan
              {filteredEmployees.length !== employees.length && (
                <span className="text-blue-600 font-medium"> (disaring)</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              id="export-csv-button"
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-white hover:bg-gray-50 text-slate-700 border border-gray-200 font-medium text-sm px-4 py-2 rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Ekspor CSV
            </button>
            <button
              id="add-employee-button"
              onClick={onAddClick}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Tambah Karyawan
            </button>
          </div>
        </div>

        {/* Table Datagrid Wrapper */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">No.</th>
                  <th 
                    onClick={() => handleSort('firstName')} 
                    className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-pointer hover:bg-gray-100 select-none transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      Nama Lengkap
                      <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('username')} 
                    className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-pointer hover:bg-gray-100 select-none transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      Username
                      <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('email')} 
                    className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-pointer hover:bg-gray-100 select-none transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      Email
                      <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('group')} 
                    className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-pointer hover:bg-gray-100 select-none transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      Departemen
                      <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('basicSalary')} 
                    className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 text-right cursor-pointer hover:bg-gray-100 select-none transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      Gaji Pokok
                      <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('status')} 
                    className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-pointer hover:bg-gray-100 select-none transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      Status
                      <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-500 bg-gray-50/50">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <AlertTriangle className="w-8 h-8 text-yellow-500 animate-pulse" />
                        <p className="font-medium">Data karyawan tidak ditemukan</p>
                        <p className="text-xs text-gray-400">Silakan sesuaikan filter pencarian atau saringan Anda.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedEmployees.map((emp, index) => {
                    const originalIndex = (currentPage - 1) * searchState.pageSize + index + 1;
                    return (
                      <tr 
                        key={emp.username} 
                        className="hover:bg-blue-50/30 transition-all group"
                      >
                        <td className="py-3.5 px-4 text-sm font-mono text-gray-400">{originalIndex}.</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 select-none uppercase tracking-wider ${getAvatarColor(emp.firstName + emp.lastName)}`}>
                              {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                                {emp.firstName} {emp.lastName}
                              </div>
                              <div className="text-[11px] text-gray-400 font-mono">Lahir: {formatDateString(emp.birthDate)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-sm text-gray-600 font-mono">{emp.username}</td>
                        <td className="py-3.5 px-4 text-sm text-gray-500 font-mono">{emp.email}</td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                            {emp.group}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-sm text-right font-semibold text-slate-900 font-mono">
                          {formatRupiah(emp.basicSalary)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            emp.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                            emp.status === 'Contract' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            emp.status === 'Probation' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            emp.status === 'Suspended' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-gray-50 text-gray-700 border-gray-200'
                          }`}>
                            {emp.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Detail Button */}
                            <button
                              id={`detail-btn-${emp.username}`}
                              onClick={() => onDetailClick(emp)}
                              className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg hover:text-blue-800 transition-colors"
                              title="Lihat Detail Karyawan"
                            >
                              <Eye className="w-4.5 h-4.5" />
                            </button>

                            {/* Dummy Edit Button - Yellow alert notification as requested */}
                            <button
                              id={`edit-btn-${emp.username}`}
                              onClick={() => handleEditClick(emp)}
                              className="p-1.5 hover:bg-amber-50 text-amber-600 rounded-lg hover:text-amber-800 transition-colors"
                              title="Edit (Simulasi)"
                            >
                              <Edit2 className="w-4.5 h-4.5" />
                            </button>

                            {/* Dummy Delete Button - Red alert notification + deletion */}
                            <button
                              id={`delete-btn-${emp.username}`}
                              onClick={() => handleDeleteClick(emp)}
                              className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg hover:text-red-800 transition-colors"
                              title="Hapus Karyawan"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer / Paging Controls */}
          {totalPages > 1 && (
            <div id="pagination-controls" className="bg-white px-4 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Tampilkan data:</span>
                <select
                  id="page-size-selector"
                  value={searchState.pageSize}
                  onChange={handlePageSizeChange}
                  className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value={5}>5 Karyawan</option>
                  <option value={10}>10 Karyawan</option>
                  <option value={20}>20 Karyawan</option>
                  <option value={50}>50 Karyawan</option>
                  <option value={100}>100 Karyawan</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  id="prev-page-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Elegant Page Numbers with ellipse handling if needed */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  // Show pages around the current page, first, and last
                  const isNear = Math.abs(pageNum - currentPage) <= 1;
                  const isFirstLast = pageNum === 1 || pageNum === totalPages;
                  if (!isNear && !isFirstLast) {
                    if (pageNum === 2 || pageNum === totalPages - 1) {
                      return <span key={pageNum} className="px-1.5 text-gray-400 text-xs">...</span>;
                    }
                    return null;
                  }

                  return (
                    <button
                      id={`page-btn-${pageNum}`}
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`min-w-9 h-9 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        pageNum === currentPage
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'border border-gray-200 text-slate-700 bg-white hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  id="next-page-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Quick Edit Modal */}
      <AnimatePresence>
        {editingEmployee && (
          <div id="edit-modal-backdrop" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              id="edit-modal-card"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="bg-slate-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                    <Edit2 className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Quick Edit Karyawan</h3>
                    <p className="text-[11px] text-gray-500 font-mono">ID: {editingEmployee.username}</p>
                  </div>
                </div>
                <button
                  id="close-edit-modal-btn"
                  onClick={() => setEditingEmployee(null)}
                  className="p-1.5 hover:bg-gray-200/50 text-gray-400 hover:text-gray-600 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      Nama Depan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editFirstName}
                      onChange={(e) => setEditFirstName(e.target.value)}
                      className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-all bg-white text-slate-900 ${
                        editErrors.firstName 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50/20' 
                          : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    {editErrors.firstName && (
                      <p className="text-xs text-red-600 mt-1">{editErrors.firstName}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      Nama Belakang <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editLastName}
                      onChange={(e) => setEditLastName(e.target.value)}
                      className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-all bg-white text-slate-900 ${
                        editErrors.lastName 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50/20' 
                          : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    {editErrors.lastName && (
                      <p className="text-xs text-red-600 mt-1">{editErrors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      Alamat Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-all bg-white text-slate-900 ${
                        editErrors.email 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50/20' 
                          : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    {editErrors.email && (
                      <p className="text-xs text-red-600 mt-1">{editErrors.email}</p>
                    )}
                  </div>

                  {/* Birth Date */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Tanggal Lahir <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={editBirthDate}
                      onChange={(e) => setEditBirthDate(e.target.value)}
                      className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-all bg-white text-slate-900 ${
                        editErrors.birthDate 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50/20' 
                          : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    {editErrors.birthDate && (
                      <p className="text-xs text-red-600 mt-1">{editErrors.birthDate}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Basic Salary */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                      Gaji Pokok (IDR) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={editBasicSalary}
                      onChange={(e) => setEditBasicSalary(e.target.value)}
                      className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-all bg-white text-slate-900 ${
                        editErrors.basicSalary 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50/20' 
                          : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    {editErrors.basicSalary && (
                      <p className="text-xs text-red-600 mt-1">{editErrors.basicSalary}</p>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-slate-400" />
                      Status Karyawan <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-slate-900"
                    >
                      {DUMMY_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Group Dropdown search selection */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    Grup / Departemen <span className="text-red-500">*</span>
                  </label>
                  <div 
                    onClick={() => setIsEditGroupDropdownOpen(!isEditGroupDropdownOpen)}
                    className={`flex items-center justify-between px-3 py-2 border rounded-lg cursor-pointer bg-white focus:outline-none focus:ring-2 text-sm transition-all select-none ${
                      editErrors.group 
                        ? 'border-red-300 ring-red-500' 
                        : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                  >
                    <span className={editGroup ? 'text-slate-900 font-medium' : 'text-gray-400'}>
                      {editGroup || '-- Pilih Departemen --'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                  {editErrors.group && (
                    <p className="text-xs text-red-600 mt-1">{editErrors.group}</p>
                  )}

                  {isEditGroupDropdownOpen && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-25 max-h-48 overflow-hidden flex flex-col">
                      <div className="p-2 border-b border-gray-100 bg-gray-50">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400" />
                          <input
                            type="text"
                            value={editGroupSearchQuery}
                            onChange={(e) => setEditGroupSearchQuery(e.target.value)}
                            placeholder="Cari departemen..."
                            onClick={(e) => e.stopPropagation()}
                            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 bg-white"
                          />
                        </div>
                      </div>
                      <div className="overflow-y-auto flex-1 py-1">
                        {DUMMY_GROUPS.filter(g => g.toLowerCase().includes(editGroupSearchQuery.toLowerCase())).length === 0 ? (
                          <p className="px-3 py-2 text-xs text-gray-400 italic">Departemen tidak ditemukan</p>
                        ) : (
                          DUMMY_GROUPS.filter(g => g.toLowerCase().includes(editGroupSearchQuery.toLowerCase())).map((g) => (
                            <div
                              key={g}
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditGroup(g);
                                setIsEditGroupDropdownOpen(false);
                              }}
                              className={`px-4 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-900 cursor-pointer flex items-center justify-between ${
                                editGroup === g ? 'bg-blue-50 font-semibold text-blue-900' : ''
                              }`}
                            >
                              <span>{g}</span>
                              {editGroup === g && <Check className="w-3.5 h-3.5 text-blue-600" />}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Deskripsi Waktu bergabung <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Contoh: Bergabung pada tanggal 10 April 2026 sebagai staf pemasaran..."
                    className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-all bg-white text-slate-900 ${
                      editErrors.description 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50/20' 
                        : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                  />
                  {editErrors.description && (
                    <p className="text-xs text-red-600 mt-1">{editErrors.description}</p>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-white shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditingEmployee(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold text-xs rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-center bg-white"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-md transition-colors cursor-pointer text-center active:scale-98"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
