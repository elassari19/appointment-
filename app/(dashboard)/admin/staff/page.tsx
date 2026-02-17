'use client';

import { useState, useEffect } from 'react';
import { 
  Loader2, Search, Plus, Eye, Edit, MoreHorizontal,
  ChevronDown, X
} from 'lucide-react';

interface StaffMember {
  id: string;
  userId: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: string;
  joinDate: string;
  avatar: string | null;
}

const getStatusBadge = (status: string) => {
  if (status === 'Active') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2"></span>
      On Leave
    </span>
  );
};

const getInitials = (name: string) => {
  return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
};

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetchStaff();
  }, [pagination.page, searchQuery, roleFilter, statusFilter]);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', pagination.page.toString());
      params.set('limit', '20');
      
      if (searchQuery) params.set('search', searchQuery);
      if (roleFilter !== 'all') params.set('role', roleFilter);

      const response = await fetch(`/api/admin/staff?${params}`);
      const data = await response.json();

      let filtered = data.staff || [];
      
      if (statusFilter !== 'all') {
        filtered = filtered.filter((s: StaffMember) => 
          statusFilter === 'active' ? s.status === 'Active' : s.status !== 'Active'
        );
      }

      setStaff(filtered);
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 0,
      }));
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="p-4 md:p-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground dark:text-white">
            Staff Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage clinic staff and employees.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-64 bg-card border-border rounded-xl text-sm border focus:ring-primary focus:border-primary outline-none transition-all"
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-muted hover:bg-muted/80 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            >
              <MoreHorizontal className="w-4 h-4" />
              Filters
              {(roleFilter !== 'all' || statusFilter !== 'all') && (
                <span className="w-2 h-2 bg-primary rounded-full"></span>
              )}
            </button>
            {showFilters && (
              <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-lg z-10">
                <div className="p-3 border-b border-border flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Filters</p>
                  <button onClick={() => {
                    setRoleFilter('all');
                    setStatusFilter('all');
                    setShowFilters(false);
                  }} className="text-xs text-primary hover:underline">Clear</button>
                </div>
                <div className="p-3 space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Role</p>
                    <select 
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="w-full bg-muted border-none text-sm rounded-lg px-3 py-2"
                    >
                      <option value="all">All Roles</option>
                      <option value="admin">Admin</option>
                      <option value="doctor">Doctor</option>
                    </select>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Status</p>
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full bg-muted border-none text-sm rounded-lg px-3 py-2"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">On Leave</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
          <button className="bg-primary hover:opacity-90 text-primary-foreground font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2">
            <Plus className="w-5 h-5" />
            <span>Add Staff</span>
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : staff.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">No staff members found.</p>
        </div>
      ) : (
        <div className="bg-card rounded-3xl shadow-sm border border-border flex flex-col overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">ID</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Name</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Role</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Department</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Contact</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Join Date</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {staff.map((member) => (
                  <tr key={member.id} className="group hover:bg-muted/30 transition-all">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-foreground">{member.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                          {member.avatar ? (
                            <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm font-bold text-muted-foreground">{getInitials(member.name)}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-foreground">{member.role}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-muted-foreground">{member.department}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-muted-foreground">{member.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-muted-foreground">{member.joinDate}</p>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(member.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-border flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} staff
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border border-border rounded-lg text-sm disabled:opacity-50 hover:bg-muted"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setPagination(prev => ({ ...prev, page }))}
                    className={`px-3 py-1 border rounded-lg text-sm ${
                      pagination.page === page 
                        ? 'border-primary bg-primary text-primary-foreground font-bold' 
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button 
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 border border-border rounded-lg text-sm disabled:opacity-50 hover:bg-muted"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
