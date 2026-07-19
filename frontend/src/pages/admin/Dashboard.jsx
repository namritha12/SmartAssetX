import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { 
  Laptop, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  FolderTree, 
  GitPullRequest, 
  ShieldAlert,
  Calendar
} from 'lucide-react';
import { Chart as ChartJS } from 'chart.js/auto';
import { Bar, Doughnut } from 'react-chartjs-2';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [deptData, setDeptData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, catRes, deptRes] = await Promise.all([
        api.get('/reports/dashboard'),
        api.get('/reports/assets-by-category'),
        api.get('/reports/assets-by-department')
      ]);

      setStats(statsRes.data);
      setCategoryData(catRes.data);
      setDeptData(deptRes.data);
    } catch (err) {
      console.error("Error loading admin dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <Layout>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }

  // Chart configuration: Assets by Category (Doughnut)
  const categoryChartData = {
    labels: categoryData.map(c => c.categoryName),
    datasets: [{
      label: 'Assets Count',
      data: categoryData.map(c => c.count),
      backgroundColor: [
        'rgba(99, 102, 241, 0.75)', // Violet
        'rgba(16, 185, 129, 0.75)', // Emerald
        'rgba(245, 158, 11, 0.75)', // Amber
        'rgba(239, 68, 68, 0.75)',  // Red
        'rgba(6, 182, 212, 0.75)',  // Cyan
        'rgba(168, 85, 247, 0.75)', // Purple
      ],
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1
    }]
  };

  // Chart configuration: Assets by Department (Bar)
  const deptChartData = {
    labels: deptData.map(d => d.departmentName),
    datasets: [{
      label: 'Assets Count',
      data: deptData.map(d => d.count),
      backgroundColor: 'rgba(99, 102, 241, 0.6)',
      borderColor: '#6366f1',
      borderWidth: 1,
      borderRadius: 8
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#f8fafc',
          font: { family: 'Outfit' }
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { family: 'Outfit' } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { family: 'Outfit' } }
      }
    }
  };

  return (
    <Layout>
      <div className="container-fluid">
        <h3 className="text-white mb-4 fw-bold">Admin Dashboard</h3>

        {/* Stats Grid */}
        <div className="row g-4 mb-4">
          <div className="col-xl-3 col-md-6">
            <div className="glass-panel glass-panel-hover p-4 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted d-block small mb-1">Total</span>
                <h2 className="text-white mb-0 fw-bold">{stats.totalAssets}</h2>
              </div>
              <div className="p-3 bg-indigo bg-opacity-10 rounded-4 text-indigo" style={{ color: '#8b5cf6' }}>
                <Laptop size={24} />
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="glass-panel glass-panel-hover p-4 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted d-block small mb-1">Available</span>
                <h2 className="text-white mb-0 fw-bold">{stats.availableAssets}</h2>
              </div>
              <div className="p-3 bg-success bg-opacity-10 rounded-4 text-success">
                <CheckCircle size={24} />
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="glass-panel glass-panel-hover p-4 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted d-block small mb-1">Assigned</span>
                <h2 className="text-white mb-0 fw-bold">{stats.assignedAssets}</h2>
              </div>
              <div className="p-3 bg-info bg-opacity-10 rounded-4 text-info" style={{ color: '#06b6d4' }}>
                <Users size={24} />
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="glass-panel glass-panel-hover p-4 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted d-block small mb-1">Pending</span>
                <h2 className="text-white mb-0 fw-bold">{stats.pendingRequests}</h2>
              </div>
              <div className="p-3 bg-warning bg-opacity-10 rounded-4 text-warning">
                <GitPullRequest size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Second Row Stats */}
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="glass-panel glass-panel-hover p-3 d-flex align-items-center gap-3">
              <div className="p-2 rounded-3 bg-secondary-subtle">
                <FolderTree size={20} className="text-white" />
              </div>
              <div>
                <small className="text-muted d-block">Departments</small>
                <h5 className="text-white fw-bold mb-0">{stats.totalDepartments}</h5>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="glass-panel glass-panel-hover p-3 d-flex align-items-center gap-3">
              <div className="p-2 rounded-3 bg-secondary-subtle">
                <Users size={20} className="text-white" />
              </div>
              <div>
                <small className="text-muted d-block">Employees / Managers</small>
                <h5 className="text-white fw-bold mb-0">{stats.totalEmployees} / {stats.totalManagers}</h5>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="glass-panel glass-panel-hover p-3 d-flex align-items-center gap-3">
              <div className="p-2 rounded-3 bg-danger bg-opacity-10">
                <ShieldAlert size={20} className="text-danger" />
              </div>
              <div>
                <small className="text-muted d-block">Warranty Expiry Alert (6M)</small>
                <h5 className="text-white fw-bold mb-0">{stats.expiringWarranty} Assets</h5>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="row g-4">
          {/* Category Chart */}
          <div className="col-lg-5">
            <div className="glass-panel p-4 h-100">
              <h5 className="text-white mb-4 fw-bold">Assets by Category</h5>
              <div className="chart-container" style={{ position: 'relative', height: '280px' }}>
                {categoryData.length === 0 ? (
                  <div className="text-center py-5 text-muted">No category data available</div>
                ) : (
                  <Doughnut data={categoryChartData} options={{...chartOptions, cutout: '70%'}} />
                )}
              </div>
            </div>
          </div>

          {/* Department Chart */}
          <div className="col-lg-7">
            <div className="glass-panel p-4 h-100">
              <h5 className="text-white mb-4 fw-bold">Assets by Department</h5>
              <div className="chart-container" style={{ position: 'relative', height: '280px' }}>
                {deptData.length === 0 ? (
                  <div className="text-center py-5 text-muted">No department data available</div>
                ) : (
                  <Bar data={deptChartData} options={chartOptions} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
