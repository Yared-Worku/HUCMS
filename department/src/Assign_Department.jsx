import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import '../src/Service/Services.css';

const Assign_Department = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [depCode, setDepCode] = useState('');

  /* ---------- Loading & Error ---------- */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ---------- Search & Pagination ---------- */
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setPage] = useState(1);
  const itemsPerPage = 5;

  /* ---------- Fetch Data ---------- */
  const fetchUsers = async () => {
    try {
      const res = await axios.get('/Users');
      setUsers(res.data);
      setError(null);
    } catch (err) {
      setUsers([]);
      setError('Enternal server error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get('/Department');
      setDepartments(res.data);
    } catch (err) {
      setDepartments([]);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchUsers();
    fetchDepartments();
  }, []);

  /* ---------- Assign Department ---------- */
  const assignDepartment = async () => {
    try {
      await axios.put(`/Users/${selectedUser.userID}/AssignDepartment`, {
        depCode
      });
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      alert('Failed to assign department.');
    }
  };

  /* ---------- Search ---------- */
  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return users.filter(u =>
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(term) ||
      (u.email ?? '').toLowerCase().includes(term) ||
      (departments.find(d => d.depCode === u.depCode)?.depName ?? '')
        .toLowerCase()
        .includes(term)
    );
  }, [searchTerm, users, departments]);

  /* ---------- Pagination ---------- */
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  return (
    <div className="container">
      <h6>Users Department Assignment</h6>

      {/* ---------- Modal ---------- */}
      {selectedUser && (
        <div className="modal-overlay">
          <div className="modal-scrollable-content">
            <button
              type="button"
              className="modalCloseBtn"
              onClick={() => setSelectedUser(null)}
            >
              ✕
            </button>

            <div className="service-registration-container">
              <h6>
                Assign Department to {selectedUser.firstName}{' '}
                {selectedUser.lastName}
              </h6>

              <select
                className="formSpacing largeSelect"
                value={depCode}
                onChange={e => setDepCode(e.target.value)}
              >
                <option value="">Select Department</option>
                {departments.map(dep => (
                  <option key={dep.depCode} value={dep.depCode}>
                    {dep.depName}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="actionBtn saveBtn"
                onClick={assignDepartment}
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Search ---------- */}
      <div className="searchContainer">
        <input
          type="text"
          placeholder="Search by name, email or department..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="searchInput"
        />
      </div>

      {/* ---------- Table ---------- */}
      <table className="table">
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center' }}>
                Loading...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', color: 'red' }}>
                {error}
              </td>
            </tr>
          ) : paginatedUsers.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center' }}>
                No data found.
              </td>
            </tr>
          ) : (
            paginatedUsers.map((u, i) => (
              <tr key={i}>
                <td>{u.firstName}</td>
                <td>{u.lastName}</td>
                <td>{u.email}</td>
                <td>
                  {departments.find(d => d.depCode === u.depCode)?.depName || '-'}
                </td>
                <td>
                  <button
                    type="button"
                    className="actionBtn saveBtn"
                    onClick={() => {
                      setSelectedUser(u);
                      setDepCode(u.depCode || '');
                    }}
                  >
                    Assign Department
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ---------- Pagination ---------- */}
      <div className="pagination">
        <button
          type="button"
          onClick={() => setPage(1)}
          disabled={currentPage === 1}
          className="pageBtn"
        >
          &laquo;
        </button>

        <button
          type="button"
          onClick={() => setPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="pageBtn"
        >
          &lsaquo;
        </button>

        {[...Array(totalPages)].map((_, i) => (
          <button
            type="button"
            key={i}
            onClick={() => setPage(i + 1)}
            className={`pageBtn ${currentPage === i + 1 ? 'active' : ''}`}
          >
            {i + 1}
          </button>
        ))}

        <button
          type="button"
          onClick={() => setPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pageBtn"
        >
          &rsaquo;
        </button>

        <button
          type="button"
          onClick={() => setPage(totalPages)}
          disabled={currentPage === totalPages}
          className="pageBtn"
        >
          &raquo;
        </button>
      </div>
    </div>
  );
};

export default Assign_Department;
