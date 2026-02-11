import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import './Services.css'
import { useNavigate } from "react-router-dom";

const MyApplication = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();
  const [userid, setUserid] = useState(null);
  const Username = window.__DNN_USER__?.username ?? "Guest";
  //  const Username = 'dani123'
  useEffect(() => {
    fetchuserid();
  }, []);

  const fetchuserid = async () => {
    try {
      const res = await axios.get(`/GetUserID/${Username}`);
      console.log("GetUserID response:", res.data);

      if (Array.isArray(res.data) && res.data.length > 0) {
        const id = res.data[0].userid; //  make sure this matches API field
        setUserid(id);
        await fetchApplications(id); // fetch apps immediately after userid
      } else {
        console.error("Unexpected API response:", res.data);
      }
    } catch (err) {
      console.error("Failed to fetch userid:", err);
    }
  };

  // Fetch applications
  const fetchApplications = async (id) => {
    try {
      setLoading(true);
      const res = await axios.get(`/Application?userId=${id}`);
      setApplications(res.data);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  // Sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const sortedApplications = useMemo(() => {
    if (!sortConfig.key) return applications;
    return [...applications].sort((a, b) => {
      const aVal = (a[sortConfig.key] ?? '').toString().toLowerCase();
      const bVal = (b[sortConfig.key] ?? '').toString().toLowerCase();
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [applications, sortConfig]);

  // Filter by search term (using description_en instead of name)
  const filteredApplications = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return sortedApplications.filter(
      a => (a.description_en ?? '').toLowerCase().includes(term)
    );
  }, [searchTerm, sortedApplications]);

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredApplications.slice(start, start + itemsPerPage);
  }, [filteredApplications, currentPage]);

  return (
    <div className="container">
      <h5>📄 My Application</h5>

      <div className="searchContainer">
        <input
          type="text"
          placeholder="Search by Application Name..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="searchInput"
        />
      </div>

      {loading ? (
        <p>⏳ Loading applications...</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              {[
                { key: 'application_number', label: 'Application Number' },
                { key: 'service_description_en', label: 'Application Name (EN)' },
                { key: 'description_local', label: 'Application Name (Local)' },
                { key: 'status', label: 'Status' },
                { key: 'start_date', label: 'Start Date' }
              ].map(col => (
                <th
                  key={col.key}
                  onClick={() => requestSort(col.key)}
                  style={{ cursor: 'pointer' }}
                >
                  {col.label}{' '}
                  {sortConfig.key === col.key && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center' }}>
                  No applications found
                </td>
              </tr>
            ) : (
              paginatedItems.map((app, index) => (
                <tr key={index} className={index % 2 === 0 ? 'rowEven' : 'rowOdd'}>
                    <td>{app.application_number}</td>
                  <td>{app.service_description_en}</td>
                  <td>{app.description_local}</td>
                  <td>{app.status}</td>
                  <td>{app.start_date ? new Date(app.start_date).toLocaleString() : ''}</td>
                  <td>
                    <button
                      type="button"
                      className="actionBtn editBtn"
                      onClick={() =>
                        navigate(`/myApplication/${app.application_number}/${app.services_service_code}/${app.tasks_task_code}/${app.organization_code}/${app.application_detail_id}/${app.meta_data_forms_form_code}`)
                      }
                    >
                      Pick
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      <div className="pagination">
        <button type="button" onClick={() => setPage(1)} disabled={currentPage === 1} className="pageBtn">&laquo;</button>
        <button type="button" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1} className="pageBtn">&lsaquo;</button>
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
        <button type="button" onClick={() => setPage(currentPage + 1)} disabled={currentPage === totalPages} className="pageBtn">&rsaquo;</button>
        <button type="button" onClick={() => setPage(totalPages)} disabled={currentPage === totalPages} className="pageBtn">&raquo;</button>
      </div>
    </div>
  );
};

export default MyApplication;
