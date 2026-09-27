import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Department } from '../types';
import { 
  Building2, 
  Users, 
  Clock, 
  Wrench, 
  PlusCircle, 
  CheckCircle2, 
  X, 
  Edit3,
  Phone,
  Mail
} from 'lucide-react';

export const AdminDepartmentsView: React.FC = () => {
  const { user, showToast } = useApp();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New dept form
  const [name, setName] = useState('');
  const [head, setHead] = useState('');
  const [contact, setContact] = useState('');
  const [staffCount, setStaffCount] = useState(6);

  const fetchDepts = async () => {
    try {
      setLoading(true);
      const res = await api.getDepartments();
      setDepartments(res.departments);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepts();
  }, []);

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !head || !user) return;
    try {
      await api.createDepartment({
        name,
        head,
        contact,
        activeStaffCount: Number(staffCount)
      }, user);
      showToast(`Department "${name}" created.`, 'success');
      setShowAddModal(false);
      setName('');
      setHead('');
      setContact('');
      fetchDepts();
    } catch (err) {
      showToast('Failed to create department', 'error');
    }
  };

  const toggleDeptStatus = async (dept: Department) => {
    if (!user) return;
    const nextStatus = dept.status === 'active' ? 'busy' : 'active';
    try {
      await api.updateDepartment(dept.id, { status: nextStatus }, user);
      showToast(`${dept.name} status updated to ${nextStatus}.`, 'info');
      fetchDepts();
    } catch (err) {
      showToast('Failed to update department', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk']">
            Department Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure campus maintenance units, staff capacity, and dispatch availability.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => {
          return (
            <div
              key={dept.id}
              className="glass-card rounded-[28px] p-6 border border-slate-200/80 dark:border-slate-800 space-y-4 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {dept.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Lead: {dept.head}
                  </p>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  dept.status === 'active'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {dept.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-400">Active Staff</span>
                  <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    {dept.activeStaffCount} Techs
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-400">Avg Resolution</span>
                  <p className="text-lg font-bold text-blue-600 dark:text-cyan-400 mt-0.5">
                    {dept.avgResolutionHours} hrs
                  </p>
                </div>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 pt-1 flex items-center gap-1.5 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{dept.contact}</span>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => toggleDeptStatus(dept)}
                  className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600"
                >
                  Toggle Availability
                </button>
                <span className="text-xs font-bold text-blue-600 dark:text-cyan-400">
                  {dept.openTickets} Active Tickets
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Department Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Campus Department</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDept} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. HVAC & Climate Control"
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Department Head / Supervisor</label>
                <input
                  type="text"
                  required
                  value={head}
                  onChange={(e) => setHead(e.target.value)}
                  placeholder="e.g. Lead Engineer Sarah Croft"
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email / Contact</label>
                <input
                  type="email"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="dept@campus.edu"
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Staff Capacity</label>
                <input
                  type="number"
                  min={1}
                  value={staffCount}
                  onChange={(e) => setStaffCount(Number(e.target.value))}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
