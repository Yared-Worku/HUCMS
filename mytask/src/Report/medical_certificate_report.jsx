import React, {useEffect, useState, useMemo } from "react";
import "../Services.css"; // Importing your existing styles
import axios from "axios";
const MedicalCertificateReport = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCert, setSelectedCert] = useState(null);
  const [currentPage, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const itemsPerPage = 5;

const [certificates, setCertificates] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

useEffect(() => {
  fetchCertificates();
}, []);

const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get("/MedicalCertificateReport");
      setCertificates(response.data || []);
    } catch (err) {
      if (err.response?.status === 404) {
        setCertificates([]);
      } else {
        setError("Failed to fetch medical certificate report.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Sorting Logic (Exactly like Mytask)
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedCerts = useMemo(() => {
    if (!sortConfig.key) return certificates;
    return [...certificates].sort((a, b) => {
      const aVal = (a[sortConfig.key] ?? "").toString().toLowerCase();
      const bVal = (b[sortConfig.key] ?? "").toString().toLowerCase();
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [certificates, sortConfig]);

  // Filtering Logic (Exactly like Mytask)
  const filteredCerts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return sortedCerts.filter((c) => 
      (c.application_No ?? "").toLowerCase().includes(term) ||
      (c.applicant_First_Name_EN ?? "").toLowerCase().includes(term)
    );
  }, [searchTerm, sortedCerts]);

  // Pagination Logic (Exactly like Mytask)
  const totalPages = Math.ceil(filteredCerts.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCerts.slice(start, start + itemsPerPage);
  }, [filteredCerts, currentPage]);

  return (
    <div className="mytask-page">
      <div className="mytask-wrapper">
        <h6 className="page-title">📄 Medical Certificate Report</h6>

        <div className="searchContainer">
          <input
            type="text"
            placeholder="Search by Application Number or Name..."
            value={searchTerm}
            onChange={(e) => {setSearchTerm(e.target.value); setPage(1);}}
            className="searchInput"
          />
        </div>
      </div>

      <div className="service-table-wrapper" style={{ width: "100%", maxWidth: "1300px", margin: "0 auto" }}>
        <table className="table" style={{ width: "100%" }}>
          <thead className="table-header-green">
            <tr>
              {[
                { key: "application_No", label: "App Number" },
                { key: "applicant_First_Name_EN", label: "Patient Name" },
                { key: "depname", label: "Department" },
                { key: "gender", label: "Gender" },
                { key: "date_Of_Issuance", label: "Issued Date" },
              ].map((col) => (
                <th
                  key={col.key}
                  onClick={() => requestSort(col.key)}
                  style={{ cursor: "pointer", color: "#000", fontWeight: 600 }}
                >
                  {col.label}
                  {sortConfig.key === col.key && (sortConfig.direction === "asc" ? " ▲" : " ▼")}
                </th>
              ))}
              <th style={{ color: "#000", fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
         <tbody>
  {loading ? (
    <tr>
      <td colSpan={6} style={{ textAlign: "center" }}>
        Loading...
      </td>
    </tr>
  ) : error ? (
    <tr>
      <td colSpan={6} style={{ textAlign: "center", color: "red" }}>
        {error}
      </td>
    </tr>
  ) : paginatedItems.length === 0 ? (
    <tr>
      <td colSpan={6} style={{ textAlign: "center" }}>
        No records found
      </td>
    </tr>
  ) : (
    paginatedItems.map((cert, index) => (
      <tr key={index} className={index % 2 === 0 ? "rowEven" : "rowOdd"}>
        <td>{cert.application_No}</td>
        <td>{cert.applicant_First_Name_EN} {cert.applicant_Last_Name_EN}</td>
        <td>{cert.depname}</td>
        <td>{cert.gender}</td>
        <td>{cert.date_Of_Issuance}</td>
        <td>
          <button
            type="button"
            className="actionBtn editBtn"
            onClick={() => setSelectedCert(cert)}
          >
            View
          </button>
        </td>
      </tr>
    ))
  )}
</tbody>

        </table>
      </div>

      {/* PAGINATION (Exactly like Mytask) */}
      <div className="pagination">
        <button type="button" onClick={() => setPage(1)} disabled={currentPage === 1} className="pageBtn">&laquo;</button>
        <button type="button" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1} className="pageBtn">&lsaquo;</button>

        {[...Array(totalPages)].map((_, i) => (
          <button
            type="button"
            key={i}
            onClick={() => setPage(i + 1)}
            className={`pageBtn ${currentPage === i + 1 ? "active" : ""}`}
          >
            {i + 1}
          </button>
        ))}

        <button type="button" onClick={() => setPage(currentPage + 1)} disabled={currentPage === totalPages} className="pageBtn">&rsaquo;</button>
        <button type="button" onClick={() => setPage(totalPages)} disabled={currentPage === totalPages} className="pageBtn">&raquo;</button>
      </div>

     {/* MODAL FOR CERTIFICATE VIEW */}
{selectedCert && (
  <div className="custom-modal-overlay">
    <div className="custom-modal-content">
      <div className="modal-header-actions">
        <button onClick={() => window.print()} className="actionBtn editBtn">
          Print
        </button>
        <button
          onClick={() => setSelectedCert(null)}
          className="actionBtn"
          style={{ backgroundColor: "#dc3545", color: "#fff" }}
        >
          Close
        </button>
      </div>

      <div id="printable-area" className="certificate-paper">
        <h2 className="cert-title">MEDICAL CERTIFICATE</h2>

        <div className="cert-body">
          {/* Top Section */}
          <div className="cert-row">
            <div className="cert-col">
             
              <p>
                <strong>Patient Name:</strong>{" "}
                {selectedCert.applicant_First_Name_EN}{" "}
                {selectedCert.applicant_Last_Name_EN}
              </p>
              <p><strong>ID No:</strong> {selectedCert.iD_NO}</p>
              <p><strong>Department:</strong> {selectedCert.depname}</p>
              <p><strong>Gender:</strong> {selectedCert.gender}</p>
              <p><strong>Age:</strong> {selectedCert.age}</p>
            </div>

            <div className="cert-col text-right">
              <img
                src={selectedCert.cust_Photo}
                alt="Patient"
                style={{ width: "100px", border: "1px solid #ccc" }}
              />
            </div>
          </div>

          <hr />

{/* Diagnosis Section */}
<div className="cert-diagnosis" style={{ marginTop: "20px" }}>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      gap: "40px",
    }}
  >
    <div style={{ flex: 1 }}>
      <h5>Clinical Diagnosis</h5>
      <p>{selectedCert.detail_Diagnosis}</p>

      <h5>Treatment Given</h5>
      <p>{selectedCert.rx}</p>
    </div>          
    <div style={{ flex: 1 }}>
      <h5>Patient Condition</h5>
      <p>{selectedCert.patient_Condition}</p>

      <h5>Recommendation Of The Health Professional</h5>
      <p>{selectedCert.health_Profetional_Recomendation}</p>
    </div>
  </div>
  </div>
          <hr />

          {/* Footer Section */}
          <div style={{ marginTop: "30px" }}>
            <p>
              <strong>Attended Date:</strong>{" "}
              {selectedCert.attended_Date}
            </p>

            <p>
              <strong>Date of Issuance:</strong>{" "}
              {selectedCert.date_Of_Issuance}
            </p>

            <br />

            <p>
              <strong>Attending Doctor:</strong><br />
              Dr. {selectedCert.fname_Doctor}{" "}
              {selectedCert.lname_Doctor}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default MedicalCertificateReport;