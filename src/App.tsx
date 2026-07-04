/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, Edit, Trash2, CheckCircle, X } from 'lucide-react';
import { Employee, PageType, SearchState } from './types';
import { getEmployeesFromStorage, saveEmployeesToStorage } from './data/dummyEmployees';
import LoginPage from './components/LoginPage';
import EmployeeListPage from './components/EmployeeListPage';
import AddEmployeePage from './components/AddEmployeePage';
import EmployeeDetailPage from './components/EmployeeDetailPage';

const INITIAL_SEARCH_STATE: SearchState = {
  searchQuery1: '', // general search query
  searchField1: 'all',
  searchQuery2: '', // department / group filter
  searchField2: 'all', // used for status filter string
  currentPage: 1,
  pageSize: 10,
  sortColumn: null,
  sortDirection: 'asc'
};

interface Notification {
  id: string;
  message: string;
  type: 'yellow' | 'red' | 'green';
}

export default function App() {
  // Session & Navigation States
  const [userSession, setUserSession] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<PageType>('LOGIN');
  
  // Data State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  // Persistent filter state across navigations ("data search sebelumnya tidak boleh hilang")
  const [searchState, setSearchState] = useState<SearchState>(INITIAL_SEARCH_STATE);

  // Custom Toast State
  const [notification, setNotification] = useState<Notification | null>(null);

  // Load session and employees on mount
  useEffect(() => {
    const session = localStorage.getItem('employee_management_session');
    if (session) {
      setUserSession(session);
      setCurrentPage('LIST');
    } else {
      setCurrentPage('LOGIN');
    }

    const loadedEmployees = getEmployeesFromStorage();
    setEmployees(loadedEmployees);
  }, []);

  // Helper to trigger a custom colored notification
  const triggerNotification = (message: string, type: 'yellow' | 'red' | 'green') => {
    const id = Date.now().toString();
    setNotification({ id, message, type });
  };

  // Auto-dismiss notification after 4.5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleLoginSuccess = (username: string) => {
    localStorage.setItem('employee_management_session', username);
    setUserSession(username);
    setCurrentPage('LIST');
    triggerNotification(`Selamat datang kembali, ${username}! Sesi login berhasil divalidasi.`, 'green');
  };

  const handleLogout = () => {
    localStorage.removeItem('employee_management_session');
    setUserSession(null);
    setCurrentPage('LOGIN');
    // Clear search states on full logout to provide a fresh interface next time
    setSearchState(INITIAL_SEARCH_STATE);
    triggerNotification('Sesi Anda telah diakhiri. Berhasil keluar.', 'green');
  };

  const handleSaveEmployee = (newEmp: Employee) => {
    const updated = [newEmp, ...employees];
    setEmployees(updated);
    saveEmployeesToStorage(updated);
    setCurrentPage('LIST');
    triggerNotification(`Karyawan baru ${newEmp.firstName} ${newEmp.lastName} (${newEmp.username}) berhasil ditambahkan ke database!`, 'green');
  };

  const handleUpdateEmployee = (updatedEmp: Employee) => {
    const updated = employees.map(emp => emp.username === updatedEmp.username ? updatedEmp : emp);
    setEmployees(updated);
    saveEmployeesToStorage(updated);
    if (selectedEmployee && selectedEmployee.username === updatedEmp.username) {
      setSelectedEmployee(updatedEmp);
    }
    triggerNotification(`Karyawan ${updatedEmp.firstName} ${updatedEmp.lastName} (${updatedEmp.username}) berhasil diperbarui!`, 'yellow');
  };

  const handleImportEmployees = (imported: Employee[]) => {
    const newEmployeeList = [...employees];
    let addedCount = 0;
    let updatedCount = 0;
    
    imported.forEach(newEmp => {
      const idx = newEmployeeList.findIndex(e => e.username === newEmp.username);
      if (idx > -1) {
        newEmployeeList[idx] = newEmp;
        updatedCount++;
      } else {
        newEmployeeList.unshift(newEmp);
        addedCount++;
      }
    });
    
    setEmployees(newEmployeeList);
    saveEmployeesToStorage(newEmployeeList);
    
    if (updatedCount > 0 && addedCount > 0) {
      triggerNotification(`Impor sukses! Berhasil menambahkan ${addedCount} karyawan baru dan memperbarui ${updatedCount} data karyawan.`, 'green');
    } else if (addedCount > 0) {
      triggerNotification(`Impor sukses! Berhasil menambahkan ${addedCount} karyawan baru ke database.`, 'green');
    } else if (updatedCount > 0) {
      triggerNotification(`Impor sukses! Berhasil memperbarui ${updatedCount} data karyawan.`, 'green');
    }
  };

  const handleDeleteEmployee = (username: string) => {
    const updated = employees.filter(emp => emp.username !== username);
    setEmployees(updated);
    saveEmployeesToStorage(updated);
  };

  const handleDetailClick = (emp: Employee) => {
    setSelectedEmployee(emp);
    setCurrentPage('DETAIL');
  };

  return (
    <div id="app-root" className="min-h-screen bg-gray-50 text-gray-900 font-sans antialiased">
      
      {/* Centered Top Toast Banner */}
      <AnimatePresence>
        {notification && (
          <div id="toast-overlay" className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 pointer-events-none">
            <motion.div
              id="toast-pill"
              initial={{ opacity: 0, y: -40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border ${
                notification.type === 'yellow' 
                  ? 'bg-amber-50 border-amber-200 text-amber-900 shadow-amber-100/50' 
                  : notification.type === 'red' 
                  ? 'bg-red-50 border-red-200 text-red-900 shadow-red-100/50' 
                  : 'bg-emerald-50 border-emerald-200 text-emerald-950 shadow-emerald-100/50'
              }`}
            >
              {/* Notification Type Icon */}
              <div className="shrink-0 pt-0.5">
                {notification.type === 'yellow' ? (
                  <div className="p-1.5 bg-amber-500 text-white rounded-lg">
                    <Edit className="w-4 h-4" />
                  </div>
                ) : notification.type === 'red' ? (
                  <div className="p-1.5 bg-red-600 text-white rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="p-1.5 bg-emerald-500 text-white rounded-lg">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Message */}
              <div className="flex-1 text-xs sm:text-sm font-medium pr-2 leading-relaxed">
                <span className="font-bold uppercase tracking-wider text-[11px] block mb-0.5 opacity-70">
                  {notification.type === 'yellow' ? 'Notifikasi Edit (Kuning)' : 
                   notification.type === 'red' ? 'Notifikasi Delete (Merah)' : 'Sistem Sukses'}
                </span>
                {notification.message}
              </div>

              {/* Close Button */}
              <button
                id="toast-close-btn"
                onClick={() => setNotification(null)}
                className="shrink-0 p-1 hover:bg-gray-200/50 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                title="Tutup Notifikasi"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Render Page Routing Switch */}
      <div id="page-content-host" className="w-full">
        {currentPage === 'LOGIN' && (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        )}

        {currentPage === 'LIST' && (
          <EmployeeListPage
            employees={employees}
            searchState={searchState}
            setSearchState={setSearchState}
            onAddClick={() => setCurrentPage('ADD')}
            onDetailClick={handleDetailClick}
            onLogoutClick={handleLogout}
            onTriggerNotification={triggerNotification}
            onDeleteEmployee={handleDeleteEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            onImportEmployees={handleImportEmployees}
          />
        )}

        {currentPage === 'ADD' && (
          <AddEmployeePage
            onSave={handleSaveEmployee}
            onCancel={() => setCurrentPage('LIST')}
            onTriggerNotification={triggerNotification}
          />
        )}

        {currentPage === 'DETAIL' && selectedEmployee && (
          <EmployeeDetailPage
            employee={selectedEmployee}
            onBack={() => setCurrentPage('LIST')}
          />
        )}
      </div>
    </div>
  );
}
