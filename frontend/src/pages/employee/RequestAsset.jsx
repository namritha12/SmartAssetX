import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { 
  HelpCircle, 
  AlertCircle, 
  Send, 
  Check, 
  Search, 
  X, 
  Laptop, 
  Smartphone, 
  Tv, 
  HardDrive,
  Cpu
} from 'lucide-react';

const RequestAsset = () => {
  const [assets, setAssets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [pageLoading, setPageLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchAvailableAssets();
  }, []);

  const fetchAvailableAssets = async () => {
    try {
      setPageLoading(true);
      const res = await api.get('/assets');
      setAssets(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load available equipment.');
    } finally {
      setPageLoading(false);
    }
  };

  const handleOpenRequestModal = (asset) => {
    setSelectedAsset(asset);
    setErrorMsg('');
    setSuccess(false);
    // Pre-fill a premium, descriptive justification
    setReason(`Requesting available ${asset.categoryName}: ${asset.brand} ${asset.assetName} (Model: ${asset.model || 'Standard'}, Code: ${asset.assetCode}) for official project assignments.`);
  };

  const handleCloseModal = () => {
    setSelectedAsset(null);
    setReason('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAsset) return;

    setErrorMsg('');
    setSuccess(false);

    if (!reason.trim()) {
      setErrorMsg('Please provide a justification for this request.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/requests', {
        categoryId: selectedAsset.categoryId,
        reason: reason.trim()
      });
      setSuccess(true);
      setTimeout(() => {
        handleCloseModal();
        navigate('/employee/request-history');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit asset request.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to return visual hardware icons based on category name
  const getCategoryIcon = (categoryName) => {
    const name = (categoryName || '').toLowerCase();
    if (name.includes('laptop') || name.includes('notebook') || name.includes('macbook')) {
      return <Laptop size={24} />;
    }
    if (name.includes('phone') || name.includes('mobile') || name.includes('android') || name.includes('iphone')) {
      return <Smartphone size={24} />;
    }
    if (name.includes('monitor') || name.includes('display') || name.includes('screen') || name.includes('tv')) {
      return <Tv size={24} />;
    }
    if (name.includes('server') || name.includes('cpu') || name.includes('processor')) {
      return <Cpu size={24} />;
    }
    return <HardDrive size={24} />;
  };

  // Filter out only 'Available' status assets
  const availableAssets = assets.filter(
    (asset) => (asset.status || '').toLowerCase() === 'available'
  );

  // Apply search query filters
  const filteredAssets = availableAssets.filter((asset) => {
    const term = searchQuery.toLowerCase();
    return (
      (asset.assetName || '').toLowerCase().includes(term) ||
      (asset.brand || '').toLowerCase().includes(term) ||
      (asset.model || '').toLowerCase().includes(term) ||
      (asset.assetCode || '').toLowerCase().includes(term) ||
      (asset.categoryName || '').toLowerCase().includes(term)
    );
  });

  return (
    <Layout>
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="text-white fw-bold mb-1">Request Equipment</h3>
            <p className="text-muted small mb-0">Browse and request available items from the central hardware catalog</p>
          </div>
        </div>

        {errorMsg && !selectedAsset && (
          <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger d-flex align-items-center gap-2 rounded-3 py-2 small mb-4">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Search Catalog */}
        <div className="glass-panel p-3 mb-4 d-flex align-items-center gap-3">
          <div className="position-relative flex-grow-1">
            <Search className="position-absolute top-50 translate-middle-y text-muted" size={18} style={{ left: '16px' }} />
            <input
              type="text"
              placeholder="Search equipment by name, brand, category, or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control glass-input w-100"
              style={{ paddingLeft: '45px' }}
            />
          </div>
        </div>

        {/* Equipment Catalog Grid */}
        {pageLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading equipment catalog...</span>
            </div>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="glass-panel p-5 text-center">
            <HelpCircle size={48} className="text-muted mb-3" />
            <h5 className="text-white fw-bold mb-1">No Available Equipment Found</h5>
            <p className="text-muted small">
              {searchQuery ? 'Try adjusting your search terms.' : 'All equipment in the catalog is currently assigned.'}
            </p>
          </div>
        ) : (
          <div className="row g-4">
            {filteredAssets.map((asset) => (
              <div className="col-xl-3 col-lg-4 col-md-6" key={asset.id}>
                <div className="glass-panel glass-panel-hover p-4 d-flex flex-column justify-content-between h-100">
                  <div>
                    {/* Header: Icon & Category Name */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="p-3 bg-primary bg-opacity-10 rounded-4 text-primary" style={{ color: '#8b5cf6' }}>
                        {getCategoryIcon(asset.categoryName)}
                      </div>
                      <span className="badge bg-primary bg-opacity-10 text-primary-hover px-2.5 py-1.5 rounded-pill small" style={{ fontSize: '0.75rem' }}>
                        {asset.categoryName}
                      </span>
                    </div>

                    {/* Brand & Name */}
                    <h5 className="text-white fw-bold mb-1">{asset.brand} {asset.assetName}</h5>
                    <p className="text-muted small mb-3">Model: {asset.model || 'N/A'}</p>

                    {/* Code Tag */}
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <span className="text-white-50 small font-monospace bg-dark bg-opacity-35 px-2 py-1 rounded">
                        {asset.assetCode}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <button 
                    onClick={() => handleOpenRequestModal(asset)}
                    className="btn btn-premium w-100 d-flex align-items-center justify-content-center gap-2"
                  >
                    Request Equipment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating React Glassmorphic Modal for Request Submission */}
      {selectedAsset && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ 
            backgroundColor: 'rgba(9, 9, 14, 0.75)', 
            backdropFilter: 'blur(12px)',
            zIndex: 1050 
          }}
        >
          <div className="glass-panel p-4 w-100 m-3" style={{ maxWidth: '540px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="text-white fw-bold mb-0">Confirm Equipment Request</h5>
              <button 
                onClick={handleCloseModal}
                className="btn btn-sm btn-outline-secondary border-0 text-white-50"
              >
                <X size={20} />
              </button>
            </div>

            {errorMsg && (
              <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger d-flex align-items-center gap-2 rounded-3 py-2 small mb-3">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {success && (
              <div className="alert alert-success border-0 bg-success bg-opacity-10 text-success d-flex align-items-center gap-2 rounded-3 py-2 small mb-3">
                <Check size={16} />
                <span>Request submitted successfully! Redirecting...</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4 p-3 bg-dark bg-opacity-25 rounded-3 border border-secondary border-opacity-10">
                <div className="row g-2 small">
                  <div className="col-4 text-white-50">Equipment:</div>
                  <div className="col-8 text-white fw-semibold">{selectedAsset.brand} {selectedAsset.assetName}</div>
                  
                  <div className="col-4 text-white-50">Model:</div>
                  <div className="col-8 text-white">{selectedAsset.model || 'N/A'}</div>

                  <div className="col-4 text-white-50">Category:</div>
                  <div className="col-8 text-white">{selectedAsset.categoryName}</div>

                  <div className="col-4 text-white-50">Asset Code:</div>
                  <div className="col-8 text-white font-monospace">{selectedAsset.assetCode}</div>
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label text-white-50 small">Justification / Reason</label>
                <textarea
                  className="form-control glass-input w-100"
                  rows="4"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Tell your manager why you need this hardware..."
                  required
                />
              </div>

              <div className="d-flex gap-3">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="btn btn-outline-secondary w-50 py-2 border-0 bg-white bg-opacity-5 text-white"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-premium w-50 py-2 d-flex align-items-center justify-content-center gap-2"
                  disabled={loading}
                >
                  <Send size={14} /> {loading ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default RequestAsset;
