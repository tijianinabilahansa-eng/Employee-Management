/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, Calendar, Mail, DollarSign, User, Tag, 
  Clock, AlertCircle, Check, Search, ChevronDown 
} from 'lucide-react';
import { Employee } from '../types';
import { DUMMY_GROUPS, DUMMY_STATUSES } from '../data/dummyEmployees';

interface AddEmployeePageProps {
  onSave: (employee: Employee) => void;
  onCancel: () => void;
  onTriggerNotification: (message: string, type: 'yellow' | 'red' | 'green') => void;
}

export default function AddEmployeePage({ onSave, onCancel, onTriggerNotification }: AddEmployeePageProps) {
  // Form State
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [basicSalary, setBasicSalary] = useState('');
  const [status, setStatus] = useState('Active');
  const [group, setGroup] = useState('');
  const [description, setDescription] = useState(''); // Treated as datetime as per requirement

  // Custom Group Dropdown with Search states
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Errors state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsGroupDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter 10 dummy groups for custom searchable dropdown
  const filteredGroups = useMemo(() => {
    return DUMMY_GROUPS.filter(g => 
      g.toLowerCase().includes(groupSearchQuery.toLowerCase())
    );
  }, [groupSearchQuery]);

  // Max birthdate constraint: Cannot be in the future (must be <= today)
  const maxBirthDatetimeString = useMemo(() => {
    const now = new Date();
    // Format to yyyy-MM-ddThh:mm for datetime-local input
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }, []);

  // Real-time validations
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // 1. Check empty / mandatory
    if (!username.trim()) newErrors.username = 'Username wajib diisi.';
    if (!firstName.trim()) newErrors.firstName = 'Nama depan wajib diisi.';
    if (!lastName.trim()) newErrors.lastName = 'Nama belakang wajib diisi.';
    if (!status.trim()) newErrors.status = 'Status wajib dipilih.';
    if (!group.trim()) newErrors.group = 'Grup / departemen wajib dipilih.';
    
    // 2. Email format validation
    if (!email.trim()) {
      newErrors.email = 'Email wajib diisi.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = 'Format email tidak valid (contoh: budi@company.com).';
      }
    }

    // 3. Birthdate Validation (must be <= today)
    if (!birthDate) {
      newErrors.birthDate = 'Tanggal lahir wajib diisi.';
    } else {
      const selectedDate = new Date(birthDate);
      const currentDate = new Date();
      if (selectedDate > currentDate) {
        newErrors.birthDate = 'Tanggal lahir tidak boleh melebihi hari ini.';
      }
    }

    // 4. Basic Salary Validation (must be numeric and positive)
    if (!basicSalary) {
      newErrors.basicSalary = 'Gaji pokok wajib diisi.';
    } else {
      const salaryNum = parseFloat(basicSalary);
      if (isNaN(salaryNum)) {
        newErrors.basicSalary = 'Gaji pokok harus berupa angka.';
      } else if (salaryNum <= 0) {
        newErrors.basicSalary = 'Gaji pokok harus lebih besar dari 0.';
      }
    }

    // 5. Description validation (mandatory datetime, as requested)
    if (!description) {
      newErrors.description = 'Deskripsi waktu (Description Datetime) wajib diisi.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);

    const isValid = validateForm();
    if (!isValid) {
      onTriggerNotification('Gagal menyimpan. Harap lengkapi seluruh field formulir dengan benar.', 'red');
      return;
    }

    const newEmployee: Employee = {
      username: username.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      birthDate: new Date(birthDate).toISOString(),
      basicSalary: parseFloat(basicSalary),
      status,
      group,
      description: new Date(description).toISOString()
    };

    onSave(newEmployee);
  };

  return (
    <div id="add-employee-container" className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Back Link */}
        <button
          id="back-btn"
          onClick={onCancel}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-6 transition-colors font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Karyawan
        </button>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-blue-600 px-8 py-6 text-white">
            <h2 id="add-employee-title" className="text-2xl font-bold tracking-tight">Form Tambah Karyawan</h2>
            <p className="text-xs text-blue-100 mt-1">
              Seluruh data di bawah ini bersifat mandatory dan wajib diisi dengan lengkap.
            </p>
          </div>

          <form onSubmit={handleSave} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Field 1: Username */}
              <div>
                <label htmlFor="form-username" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="form-username"
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (hasSubmitted) validateForm();
                    }}
                    placeholder="Contoh: budi.santoso"
                    className={`block w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-all ${
                      errors.username 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50/20' 
                        : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50 text-slate-900'
                    }`}
                  />
                </div>
                {errors.username && (
                  <p id="err-username" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.username}
                  </p>
                )}
              </div>

              {/* Field 2: Email */}
              <div>
                <label htmlFor="form-email" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="form-email"
                    type="text"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (hasSubmitted) validateForm();
                    }}
                    placeholder="Contoh: budi@company.com"
                    className={`block w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-all ${
                      errors.email 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50/20' 
                        : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50 text-slate-900'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p id="err-email" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Field 3: First Name */}
              <div>
                <label htmlFor="form-firstName" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Nama Depan <span className="text-red-500">*</span>
                </label>
                <input
                  id="form-firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (hasSubmitted) validateForm();
                  }}
                  placeholder="Contoh: Budi"
                  className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-all ${
                    errors.firstName 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50/20' 
                      : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50 text-slate-900'
                  }`}
                />
                {errors.firstName && (
                  <p id="err-firstName" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.firstName}
                  </p>
                )}
              </div>

              {/* Field 4: Last Name */}
              <div>
                <label htmlFor="form-lastName" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Nama Belakang <span className="text-red-500">*</span>
                </label>
                <input
                  id="form-lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (hasSubmitted) validateForm();
                  }}
                  placeholder="Contoh: Santoso"
                  className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-all ${
                    errors.lastName 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50/20' 
                      : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50 text-slate-900'
                  }`}
                />
                {errors.lastName && (
                  <p id="err-lastName" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.lastName}
                  </p>
                )}
              </div>

              {/* Field 5: Birth Date (DateTime Picker <= Today) */}
              <div>
                <label htmlFor="form-birthDate" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Tanggal Lahir (Datetime) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    id="form-birthDate"
                    type="datetime-local"
                    max={maxBirthDatetimeString}
                    value={birthDate}
                    onChange={(e) => {
                      setBirthDate(e.target.value);
                      if (hasSubmitted) validateForm();
                    }}
                    className={`block w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-all ${
                      errors.birthDate 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50/20' 
                        : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50 text-slate-900'
                    }`}
                  />
                </div>
                {errors.birthDate && (
                  <p id="err-birthDate" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.birthDate}
                  </p>
                )}
              </div>

              {/* Field 6: Basic Salary (Numeric only) */}
              <div>
                <label htmlFor="form-basicSalary" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Gaji Pokok (Rupiah) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <input
                    id="form-basicSalary"
                    type="number"
                    step="0.01"
                    min="1"
                    value={basicSalary}
                    onChange={(e) => {
                      setBasicSalary(e.target.value);
                      if (hasSubmitted) validateForm();
                    }}
                    placeholder="Contoh: 12500000"
                    className={`block w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-all ${
                      errors.basicSalary 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50/20' 
                        : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50 text-slate-900'
                    }`}
                  />
                </div>
                {errors.basicSalary && (
                  <p id="err-basicSalary" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.basicSalary}
                  </p>
                )}
              </div>

              {/* Field 7: Group (Searchable Dropdown List with Search TextBox on Top) */}
              <div ref={dropdownRef} className="relative">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Grup / Departemen <span className="text-red-500">*</span>
                </label>
                <div 
                  id="form-group-dropdown-trigger"
                  onClick={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
                  className={`flex items-center justify-between px-3 py-2 border rounded-lg cursor-pointer bg-gray-50/50 focus:outline-none focus:ring-2 text-sm transition-all select-none ${
                    errors.group 
                      ? 'border-red-300 ring-red-500' 
                      : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                >
                  <span className={group ? 'text-slate-900 font-medium' : 'text-gray-400'}>
                    {group || '-- Pilih Departemen --'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>

                {isGroupDropdownOpen && (
                  <div 
                    id="group-dropdown-panel"
                    className="absolute z-30 mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-200 py-2.5 flex flex-col max-h-64"
                  >
                    {/* Search textbox inside the dropdown top */}
                    <div className="px-3 pb-2 border-b border-gray-100">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
                        <input
                          id="group-search-textbox"
                          type="text"
                          autoFocus
                          value={groupSearchQuery}
                          onChange={(e) => setGroupSearchQuery(e.target.value)}
                          placeholder="Cari departemen..."
                          className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-250 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 bg-white"
                        />
                      </div>
                    </div>

                    {/* Filtered list */}
                    <div className="overflow-y-auto flex-1 mt-1.5">
                      {filteredGroups.length === 0 ? (
                        <p className="px-3 py-2 text-xs text-gray-400 italic">Departemen tidak ditemukan</p>
                      ) : (
                        filteredGroups.map((g) => (
                           <div
                            id={`group-item-${g.replace(/\s+/g, '-').toLowerCase()}`}
                            key={g}
                            onClick={() => {
                              setGroup(g);
                              setIsGroupDropdownOpen(false);
                              setGroupSearchQuery('');
                              if (hasSubmitted) {
                                // Validate with a slight timeout so state update propagates
                                setTimeout(validateForm, 0);
                              }
                            }}
                            className={`px-4 py-2 text-xs text-gray-750 hover:bg-blue-50 hover:text-blue-900 cursor-pointer flex items-center justify-between ${
                              group === g ? 'bg-blue-55 bg-blue-50 font-semibold text-blue-900' : ''
                            }`}
                          >
                            <span>{g}</span>
                            {group === g && <Check className="w-3.5 h-3.5 text-blue-600" />}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
                {errors.group && (
                  <p id="err-group" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.group}
                  </p>
                )}
              </div>

              {/* Field 8: Status */}
              <div>
                <label htmlFor="form-status" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Status Karyawan <span className="text-red-500">*</span>
                </label>
                <select
                  id="form-status"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    if (hasSubmitted) validateForm();
                  }}
                  className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50/50 text-slate-900"
                >
                  {DUMMY_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.status && (
                  <p id="err-status" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.status}
                  </p>
                )}
              </div>

              {/* Field 9: Description (Datetime Picker) */}
              <div className="md:col-span-2">
                <label htmlFor="form-description" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Deskripsi Tanggal / Waktu Bergabung (Datetime) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <input
                    id="form-description"
                    type="datetime-local"
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (hasSubmitted) validateForm();
                    }}
                    className={`block w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-all ${
                      errors.description 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50/20' 
                        : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50 text-slate-900'
                    }`}
                  />
                </div>
                {errors.description && (
                  <p id="err-description" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.description}
                  </p>
                )}
              </div>

            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-end items-center gap-3">
              <button
                id="cancel-btn"
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-center bg-white"
              >
                Cancel
              </button>
              <button
                id="save-btn"
                type="submit"
                className="w-full sm:w-auto px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow-md transition-colors cursor-pointer text-center active:scale-98"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
