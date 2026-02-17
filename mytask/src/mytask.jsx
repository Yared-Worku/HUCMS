import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "./Services.css";
import { useNavigate } from "react-router-dom";

const Mytask = () => {
  const [Tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();
  const [userid, setUserid] = useState(null);
  const Username = window.__DNN_USER__?.username ?? "Guest";
  // const Username = "dani123";

  useEffect(() => {
    fetchuserid();
  }, []);

  const fetchuserid = async () => {
    try {
      const res = await axios.get(`/GetUserID/${Username}`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        const id = res.data[0].userid;
        setUserid(id);
        await fetchtasks(id);
      }
    } catch (err) {
      console.error("Failed to fetch userid:", err);
    }
  };

  const fetchtasks = async (id) => {
    try {
      setLoading(true);
      const res = await axios.get(`/Task?userId=${id}`);
      setTasks(res.data);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedTasks = useMemo(() => {
    if (!sortConfig.key) return Tasks;
    return [...Tasks].sort((a, b) => {
      const aVal = (a[sortConfig.key] ?? "").toString().toLowerCase();
      const bVal = (b[sortConfig.key] ?? "").toString().toLowerCase();
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [Tasks, sortConfig]);

  const filteredTasks = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return sortedTasks.filter((b) => 
    (b.application_number ?? "").toLowerCase().includes(term))
  }, [searchTerm, sortedTasks]) 

  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTasks.slice(start, start + itemsPerPage);
  }, [filteredTasks, currentPage]);

  const handlePick = async (task) => {
    try {
      await axios.put("/UpdateUserId", {
        userId: userid,
        toDoCode: task.to_do_code,
      });

      navigate(
        `/myTask/${task.application_number}/${task.services_service_code}/${task.tasks_task_code}/${task.organization_code}/${task.to_do_code}/${task.application_detail_id}/${task.meta_data_forms_form_code}`
      );
    } catch (error) {
      console.error("Failed to update user ID:", error);
    }
  };

  return (
    <div className="mytask-page">
      <div className="mytask-wrapper">
        <h6 className="page-title">📄 My Task</h6>

        <div className="searchContainer">
          <input
            type="text"
            placeholder="Search by Application Number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="searchInput"
          />
        </div>
</div>
      {loading ? (
        <p>⏳ Loading tasks...</p>
      ) : (
        <div
          className="service-table-wrapper"
          style={{
            width: "100%",
            maxWidth: "1300px",   
            margin: "0 auto"
          }}
        >
          <table className="table" style={{ width: "100%" }}>
             <thead className="table-header-green">
    <tr>
      {[
        { key: "application_number", label: "Application Number" },
        { key: "description_en", label: "Task Name (EN)" },
        { key: "description_local", label: "Task Name (Local)" },
        { key: "status", label: "Status" },
        { key: "start_date", label: "Start Date" },
      ].map((col) => (
        <th
          key={col.key}
          onClick={() => requestSort(col.key)}
          style={{ cursor: "pointer", color: "#000", fontWeight: 600 }}
        >
          {col.label}
          {sortConfig.key === col.key &&
            (sortConfig.direction === "asc" ? " ▲" : " ▼")}
        </th>
      ))}
      <th style={{ color: "#000", fontWeight: 600 }}>Actions</th>
    </tr>
  </thead>
            <tbody>
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center" }}>
                    No tasks found
                  </td>
                </tr>
              ) : (
                paginatedItems.map((task, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "rowEven" : "rowOdd"}
                  >
                    <td>{task.application_number}</td>
                    <td>{task.description_en}</td>
                    <td>{task.description_local}</td>
                    <td>{task.status}</td>
                    <td>
                      {task.start_date
                        ? new Date(task.start_date).toLocaleString()
                        : ""}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="actionBtn editBtn"
                        onClick={() => handlePick(task)}
                      >
                        Pick
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="pagination">
        <button onClick={() => setPage(1)} disabled={currentPage === 1} className="pageBtn">&laquo;</button>
        <button onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1} className="pageBtn">&lsaquo;</button>

        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`pageBtn ${currentPage === i + 1 ? "active" : ""}`}
          >
            {i + 1}
          </button>
        ))}

        <button onClick={() => setPage(currentPage + 1)} disabled={currentPage === totalPages} className="pageBtn">&rsaquo;</button>
        <button onClick={() => setPage(totalPages)} disabled={currentPage === totalPages} className="pageBtn">&raquo;</button>
      </div>
    </div>
  );
};

export default Mytask;
