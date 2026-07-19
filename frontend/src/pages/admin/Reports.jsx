import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { FileSpreadsheet, FileText, Calendar, ShieldAlert, AlertCircle } from 'lucide-react';

const Reports = () => {
  const [warrantyAssets, setWarrantyAssets] = useState([]);
  const [amcAssets, setAmcAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchExpiringData();
  }, []);

  const fetchExpiringData = async () => {
    try {
      setLoading(true);
      const [warrantyRes, amcRes] = await Promise.all([
        api.get('/reports/warranty-expiry'),
        api.get('/reports/amc-expiry')
      ]);
      setWarrantyAssets(warrantyRes.data);
      setAmcAssets(amcRes.data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load expiry lists.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await api.get('/reports/export/excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'smartassetx_report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Excel export failed.');
    }
  };

  const handleExportPdf = async () => {
    try {
      const response = await api.get('/reports/export/pdf', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'smartassetx_report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('PDF export failed.');
    }
  };

  return (
    <Layout>
      <div className="container-fluid">
        <h3 className="text-white fw-bold mb-4">Reports & Downloads</h3>

        {/* Quick Exports Section */}
        <div className="glass-panel p-4 mb-4">
          <h5 className="text-white mb-3 fw-bold">Quick Exports</h5>
          <p className="text-muted small mb-4">Export complete inventory list with serial numbers, brands, categories, purchase costs, and departments.</p>
          <div className="d-flex flex-wrap gap-3">
            <button onClick={handleExportExcel} className="btn btn-premium d-flex align-items-center gap-2" style={{ background: 'var(--success-gradient)' }}>
              <FileSpreadsheet size={18} /> Export to Excel
            </button>
            <button onClick={handleExportPdf} className="btn btn-premium d-flex align-items-center gap-2" style={{ background: 'var(--primary-gradient)' }}>
              <FileText size={18} /> Export to PDF
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger d-flex align-items-center gap-2 rounded-3 py-2 small mb-4">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="row g-4">
          {/* Warranty Expiry (6 Months) */}
          <div className="col-lg-6">
            <div className="glass-panel p-4 h-100">
              <h5 className="text-white mb-3 fw-bold d-flex align-items-center gap-2">
                <ShieldAlert className="text-danger" /> Warranty Expiring Soon (6 Months)
              </h5>
              
              <div className="overflow-x-auto">
                <table className="table glass-table mb-0 w-100" style={{ fontSize: '0.9rem' }}>
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Asset Name</th>
                      <th>Expiry Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="3" className="text-center py-3 text-muted">Loading...</td></tr>
                    ) : warrantyAssets.length === 0 ? (
                      <tr><td colSpan="3" className="text-center py-3 text-muted">No assets expiring in 6 months.</td></tr>
                    ) : (
                      warrantyAssets.map(asset => (
                        <tr key={asset.id}>
                          <td className="text-white fw-medium">{asset.assetCode}</td>
                          <td>{asset.assetName}</td>
                          <td className="text-danger font-medium">{asset.warrantyExpiry}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* AMC Expiry (6 Months) */}
          <div className="col-lg-6">
            <div className="glass-panel p-4 h-100">
              <h5 className="text-white mb-3 fw-bold d-flex align-items-center gap-2">
                <Calendar className="text-warning" /> AMC Expiring Soon (6 Months)
              </h5>

              <div className="overflow-x-auto">
                <table className="table glass-table mb-0 w-100" style={{ fontSize: '0.9rem' }}>
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Asset Name</th>
                      <th>Expiry Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="3" className="text-center py-3 text-muted">Loading...</td></tr>
                    ) : amcAssets.length === 0 ? (
                      <tr><td colSpan="3" className="text-center py-3 text-muted">No AMC leases expiring in 6 months.</td></tr>
                    ) : (
                      amcAssets.map(asset => (
                        <tr key={asset.id}>
                          <td className="text-white fw-medium">{asset.assetCode}</td>
                          <td>{asset.assetName}</td>
                          <td className="text-warning font-medium">{asset.amcExpiry}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
