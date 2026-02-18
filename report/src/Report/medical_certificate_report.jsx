import React, { useEffect, useState, useMemo } from "react";
import "../Services.css"; // Importing your existing styles
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const MedicalCertificateReport = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCert, setSelectedCert] = useState(null);
  const [currentPage, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const itemsPerPage = 5;
  const [showCertificate, setShowCertificate] = useState(true);
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

  // Close the certificate modal
  const handleClosePopup = () => {
    setSelectedCert(null);
  };

  // Sorting Logic
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

  // Filtering Logic
  const filteredCerts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return sortedCerts.filter(
      (c) =>
        (c.application_No ?? "").toLowerCase().includes(term) ||
        (c.applicant_First_Name_EN ?? "").toLowerCase().includes(term)
    );
  }, [searchTerm, sortedCerts]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredCerts.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCerts.slice(start, start + itemsPerPage);
  }, [filteredCerts, currentPage]);

  const handlePrint = () => {
  const printContents = document.getElementById("printable-area");
  const printWindow = window.open("", "_blank", "width=900,height=900");
  printWindow.document.write(`
    <html>
      <head>
        <title>Medical Certificate</title>
        <style>
          /* This rule removes the browser headers and footers */
          @page { 
            size: auto;   /* auto is the initial value */
            margin: 0;    /* this removes headers and footers */
          }

          body {
            font-family: "Times New Roman", Times, serif;
            margin: 0;
            padding: 50px; /* Add padding here so content doesn't touch the edge */
            color: #000;
          }

          /* Professional Medical Layout Styles */
          h2.cert-title {
            text-align: center;
            font-size: 24px;
            text-decoration: underline;
            margin-bottom: 30px;
          }

          .cert-row {
            display: flex !important;
            justify-content: space-between !important;
            margin-bottom: 20px;
          }

          .photo-container {
            width: 140px;
            height: 170px;
            border: 1px solid #000;
          }

          .photo-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .cert-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }

          h5 { font-weight: bold; margin-bottom: 5px; text-decoration: underline; }
          p { margin: 5px 0; }
          
          /* Ensures the print process waits for the photo */
          @media print {
            body { -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="certificate-paper">
          ${printContents.innerHTML}
        </div>
        <script>
          window.onload = function() {
            window.focus();
            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};
  const exportPDF = () => {
    const input = document.getElementById("printable-area");
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const pdf = new jsPDF("p", "px", [imgWidth, imgHeight]);
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Medical_Certificate_${selectedCert.application_No}.pdf`);
    });
  };

  return (
    <div className="mytask-page">
      <div className="mytask-wrapper">
        <h6 className="page-title">📄 Medical Certificate Report</h6>
        <div className="searchContainer">
          <input
            type="text"
            placeholder="Search by Application Number or Name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="searchInput"
          />
        </div>
      </div>
      <div
        className="service-table-wrapper"
        style={{ width: "100%", maxWidth: "1300px", margin: "0 auto" }}
      >
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
                  {sortConfig.key === col.key &&
                    (sortConfig.direction === "asc" ? " ▲" : " ▼")}
                </th>
              ))}
              <th style={{ color: "#000", fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center" }}>
                  ⏳ Loading...
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
                <tr
                  key={index}
                  className={index % 2 === 0 ? "rowEven" : "rowOdd"}
                >
                  <td>{cert.application_No}</td>
                  <td>
                    {cert.applicant_First_Name_EN} {cert.applicant_Last_Name_EN}
                  </td>
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

      {/* PAGINATION */}
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
            className={`pageBtn ${currentPage === i + 1 ? "active" : ""}`}
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

      {/* MODAL FOR CERTIFICATE VIEW */}
      {selectedCert && (
        <div className="custom-modal-overlay">
          <div
            className="custom-modal-content"
            style={{
              display: "flex",
              flexDirection: "column",
              maxHeight: "90vh", 
              overflow: "hidden", 
              // width: "auto", 
              maxWidth: "800px",
            }}
          >
            <div
              className="modal-header-actions"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 20px",
                backgroundColor: "#1976d2",
                borderTopLeftRadius: "8px",
                borderTopRightRadius: "8px",
                flexShrink: 0, 
                zIndex: 10,
              }}
            >
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                type="button"
                  onClick={handlePrint}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#4caf50",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: 600,
                    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#45a049")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#4caf50")
                  }
                >
                  Print
                </button>
                <button
                type="button"
                  onClick={exportPDF}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#ff9800",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: 600,
                    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#fb8c00")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#ff9800")
                  }
                >
                  Export PDF
                </button>
              </div>

              <IconButton
                onClick={handleClosePopup}
                sx={{
                  color: "white",
                  backgroundColor: "red",
                  "&:hover": { backgroundColor: "#c62828" },
                  borderRadius: "50%",
                  padding: "6px",
                }}
              >
                <CloseIcon />
              </IconButton>
            </div>
            {/* SCROLLABLE CONTENT WRAPPER */}
            <div
              style={{
                overflowY: "auto", 
                flex: 1, 
                padding: "20px",
                backgroundColor: "#f5f5f5",
              }}
            >
              <div id="printable-area" className="certificate-paper">
                <h6 className="cert-title">MEDICAL CERTIFICATE</h6>

                <div className="cert-body">
                  {/* Top Section */}
                  <div className="cert-row">
                    <div className="cert-col">
                      <p>
                        <strong>Patient Name:</strong>{" "}
                        {selectedCert.applicant_First_Name_EN}{" "}
                        {selectedCert.applicant_Last_Name_EN}
                      </p>
                      <p>
                        <strong>ID No:</strong> {selectedCert.iD_NO}
                      </p>
                      <p>
                        <strong>Department:</strong> {selectedCert.depname}
                      </p>
                      <p>
                        <strong>Gender:</strong> {selectedCert.gender}
                      </p>
                      <p>
                        <strong>Age:</strong> {selectedCert.age}
                      </p>
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
                  <div
                    className="cert-diagnosis"
                    style={{ marginTop: "20px" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "40px",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <strong>Clinical Diagnosis:{" "}</strong>
                        <p>{selectedCert.detail_Diagnosis}</p>

                        <strong>Treatment Given:{" "}</strong>
                        <p>{selectedCert.rx}</p>
                      </div>
                      <div style={{ flex: 1 }}>
                        <strong>Patient Condition:{" "}</strong>
                        <p>{selectedCert.patient_Condition}</p>

                        <strong>Recommendation of the health profesional:{" "}</strong>
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

                    <p>
                      <strong>Attending Doctor:</strong>{"  "}
                  
                      Dr. {selectedCert.fname_Doctor}{" "}
                      {selectedCert.lname_Doctor}
                    </p>
                  </div>
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