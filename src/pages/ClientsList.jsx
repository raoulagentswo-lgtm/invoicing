/**
 * Clients List Page Component
 * 
 * Displays a list of all clients with search, filter, sort, and pagination
 * Story: EPIC-2-005 - List Clients
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ClientsList.css';

export default function ClientsList() {
  const navigate = useNavigate();

  // State
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalClients, setTotalClients] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination calculations
  const totalPages = Math.ceil(totalClients / itemsPerPage);
  const offset = currentPage * itemsPerPage;

  // Fetch clients with filters and pagination
  const fetchClients = async (page = 0, search = '', sort = 'name', order = 'asc') => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const pageOffset = page * itemsPerPage;
      const params = new URLSearchParams({
        limit: itemsPerPage,
        offset: pageOffset,
        search: search.trim(),
        sortBy: sort,
        sortOrder: order,
        status: 'active'
      });

      const response = await fetch(`/api/clients?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }

      const json = await response.json();

      if (json.success) {
        setClients(json.data);
        setTotalClients(json.pagination.total);
      } else {
        setError(json.message || 'Failed to fetch clients');
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError(err.message || 'Failed to fetch clients');
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch clients on component mount and when filters change
  useEffect(() => {
    fetchClients(0, searchTerm, sortBy, sortOrder);
    setCurrentPage(0);
  }, [searchTerm, sortBy, sortOrder]);

  // Fetch when page changes
  useEffect(() => {
    fetchClients(currentPage, searchTerm, sortBy, sortOrder);
  }, [currentPage]);

  // Handle search input change
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  // Handle delete with confirmation
  const handleDeleteClick = (clientId) => {
    setDeleteConfirm(clientId);
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  const handleConfirmDelete = async (clientId) => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete client');
      }

      const json = await response.json();

      if (json.success) {
        // Refresh the list
        fetchClients(currentPage, searchTerm, sortBy, sortOrder);
        setDeleteConfirm(null);
      } else {
        setError(json.message || 'Failed to delete client');
      }
    } catch (err) {
      console.error('Error deleting client:', err);
      setError(err.message || 'Failed to delete client');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle pagination
  const goToPage = (page) => {
    const pageNum = Math.max(0, Math.min(page, totalPages - 1));
    setCurrentPage(pageNum);
  };

  const goToNext = () => {
    if (currentPage < totalPages - 1) {
      goToPage(currentPage + 1);
    }
  };

  const goToPrevious = () => {
    if (currentPage > 0) {
      goToPage(currentPage - 1);
    }
  };

  return (
    <div className="clients-list-container">
      {/* Header */}
      <div className="clients-header">
        <div className="header-content">
          <h1>Clients</h1>
          <p>Manage all your clients in one place</p>
        </div>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => navigate('/create-client')}
        >
          + New Client
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
          <button
            className="alert-close"
            onClick={() => setError(null)}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}

      {/* Filters and Search */}
      <div className="clients-filters">
        {/* Search Bar */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            className="search-input"
            value={searchTerm}
            onChange={handleSearch}
          />
          <span className="search-icon">🔍</span>
        </div>

        {/* Sort Controls */}
        <div className="sort-controls">
          <select
            className="sort-select"
            value={sortBy}
            onChange={handleSortChange}
          >
            <option value="name">Sort by Name</option>
            <option value="created_at">Sort by Creation Date</option>
            <option value="updated_at">Sort by Last Updated</option>
          </select>

          <button
            className={`sort-order-btn ${sortOrder}`}
            onClick={toggleSortOrder}
            title={`Click to change to ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
          >
            {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading clients...</p>
        </div>
      ) : clients.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h2>No clients found</h2>
          {searchTerm ? (
            <p>
              No clients match your search "{searchTerm}".{' '}
              <button
                className="btn-link"
                onClick={() => setSearchTerm('')}
              >
                Clear search
              </button>
            </p>
          ) : (
            <p>
              You don't have any clients yet.{' '}
              <button
                className="btn-link"
                onClick={() => navigate('/create-client')}
              >
                Create your first client
              </button>
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="clients-table-wrapper desktop-only">
            <table className="clients-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="client-row">
                    <td className="client-name">{client.name}</td>
                    <td className="client-email">{client.email}</td>
                    <td className="client-phone">{client.phone || '-'}</td>
                    <td className="client-created">
                      {new Date(client.createdAt).toLocaleDateString()}
                    </td>
                    <td className="client-actions">
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => navigate(`/client/${client.id}`)}
                        title="View details"
                      >
                        View
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteClick(client.id)}
                        disabled={deleteConfirm === client.id}
                        title="Delete client"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="clients-cards-wrapper mobile-only">
            {clients.map((client) => (
              <div key={client.id} className="client-card">
                <div className="card-content">
                  <div className="card-header-section">
                    <h3>{client.name}</h3>
                    <span className="card-date">
                      {new Date(client.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="card-body">
                    <div className="card-field">
                      <span className="field-label">Email:</span>
                      <span className="field-value">{client.email}</span>
                    </div>
                    {client.phone && (
                      <div className="card-field">
                        <span className="field-label">Phone:</span>
                        <span className="field-value">{client.phone}</span>
                      </div>
                    )}
                  </div>
                  <div className="card-actions">
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => navigate(`/client/${client.id}`)}
                    >
                      View
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteClick(client.id)}
                      disabled={deleteConfirm === client.id}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="pagination-container">
            <div className="pagination-info">
              Showing {offset + 1} to {Math.min(offset + itemsPerPage, totalClients)} of {totalClients} clients
            </div>
            <div className="pagination-controls">
              <button
                className="btn btn-pagination"
                onClick={goToPrevious}
                disabled={currentPage === 0}
              >
                ← Previous
              </button>

              <div className="page-numbers">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  let pageNum = i;
                  if (totalPages > 5) {
                    if (currentPage > 2) {
                      pageNum = currentPage - 2 + i;
                    }
                    if (pageNum >= totalPages) {
                      pageNum = totalPages - 5 + i;
                    }
                  }
                  if (pageNum >= totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      className={`btn btn-page ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => goToPage(pageNum)}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
              </div>

              <button
                className="btn btn-pagination"
                onClick={goToNext}
                disabled={currentPage >= totalPages - 1}
              >
                Next →
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Client</h2>
            <p>Are you sure you want to delete this client? This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={handleCancelDelete}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleConfirmDelete(deleteConfirm)}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
