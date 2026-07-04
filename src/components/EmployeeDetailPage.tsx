/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, User, Mail, Calendar, DollarSign, Tag, 
  Clock, Briefcase, FileText, CheckCircle, ShieldAlert 
} from 'lucide-react';
import { Employee } from '../types';

interface EmployeeDetailPageProps {
  employee: Employee;
  onBack: () => void;
}

export default function EmployeeDetailPage({ employee, onBack }: EmployeeDetailPageProps) {
  
  // Format salary to Indonesian Rupiah style (e.g., Rp. 12.500.000,00)
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  // Format Date ISO strings into readable local Indonesian Datetime
  const formatDateTime = (isoString: string) => {
    if (!isoString) return '-';
    try {
      const date = new Date(isoString);
      return date.toLocaleString('id-ID', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div id="detail-container" className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Back Link */}
        <button
          id="detail-back-top-btn"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-6 transition-colors font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Karyawan
        </button>

        {/* Detail Card Wrapper */}
        <motion.div
          id="detail-card"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-10 text-white relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <User className="w-32 h-32" />
            </div>
            
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white text-2xl font-extrabold uppercase shadow-inner">
                {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
              </div>
              <div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-blue-100 border border-blue-450/30 mb-2`}>
                  {employee.group}
                </span>
                <h2 id="detail-employee-name" className="text-3xl font-bold tracking-tight">
                  {employee.firstName} {employee.lastName}
                </h2>
                <p className="text-sm text-blue-200 mt-1 font-mono">
                  @{employee.username}
                </p>
              </div>
            </div>
          </div>

          {/* Attributes Grid */}
          <div className="p-8 space-y-8">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2">
              Informasi Detail Karyawan
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username Card */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <User className="w-3.5 h-3.5 text-blue-500" />
                  <span>Username</span>
                </div>
                <p id="detail-val-username" className="text-base font-bold text-gray-900 font-mono">
                  {employee.username}
                </p>
              </div>

              {/* Email Card */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <Mail className="w-3.5 h-3.5 text-blue-500" />
                  <span>Alamat Email</span>
                </div>
                <a 
                  id="detail-val-email"
                  href={`mailto:${employee.email}`} 
                  className="text-base font-bold text-blue-600 hover:underline font-mono block break-all"
                >
                  {employee.email}
                </a>
              </div>

              {/* First Name */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  <span>Nama Depan</span>
                </div>
                <p id="detail-val-firstName" className="text-base font-semibold text-gray-900">
                  {employee.firstName}
                </p>
              </div>

              {/* Last Name */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  <span>Nama Belakang</span>
                </div>
                <p id="detail-val-lastName" className="text-base font-semibold text-gray-900">
                  {employee.lastName}
                </p>
              </div>

              {/* Birth Date (Formatted) */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  <span>Tanggal Lahir (Datetime)</span>
                </div>
                <p id="detail-val-birthDate" className="text-sm font-semibold text-gray-900">
                  {formatDateTime(employee.birthDate)}
                </p>
              </div>

              {/* Basic Salary (Rp. xx.xxx,xx format) */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <DollarSign className="w-3.5 h-3.5 text-blue-500" />
                  <span>Gaji Pokok (Formatted IDR)</span>
                </div>
                <p id="detail-val-basicSalary" className="text-lg font-extrabold text-blue-700 font-mono">
                  {formatRupiah(employee.basicSalary)}
                </p>
              </div>

              {/* Group / Department */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                  <span>Grup / Departemen</span>
                </div>
                <p id="detail-val-group" className="text-base font-bold text-gray-900">
                  {employee.group}
                </p>
              </div>

              {/* Status */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <Tag className="w-3.5 h-3.5 text-blue-500" />
                  <span>Status Karyawan</span>
                </div>
                <div className="pt-0.5">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${
                    employee.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                    employee.status === 'Contract' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    employee.status === 'Probation' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    employee.status === 'Suspended' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-gray-50 text-gray-700 border-gray-200'
                  }`}>
                    {employee.status}
                  </span>
                </div>
              </div>

              {/* Description (Datetime) */}
              <div className="md:col-span-2 p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span>Deskripsi Waktu bergabung (Description Datetime)</span>
                </div>
                <p id="detail-val-description" className="text-sm font-semibold text-gray-900">
                  {formatDateTime(employee.description)}
                </p>
              </div>
            </div>

            {/* OK Button */}
            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button
                id="detail-ok-button"
                onClick={onBack}
                className="w-full sm:w-auto px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors cursor-pointer text-center active:scale-98"
              >
                OK
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
