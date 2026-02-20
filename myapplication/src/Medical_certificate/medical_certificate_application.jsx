import React, { useState, useEffect } from "react";
import "../Services.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Divider
} from "@mui/material";

const Medical_Certificate_Application = ({ processDetailCode, onsave }) => {

  const [applications, setApplications] = useState([]);
  const [application_number, setApplicationNumber] = useState("");
  const [diagnosis_code, setDiagnosiscode] = useState(null);
  const [detail_code, setDetailcode] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [userid, setUserid] = useState(null);

  const Username = 'amani';
  // const Username = window.__DNN_USER__?.username ?? "Guest";
  useEffect(() => {
    fetchuserid();
  }, []);

  const fetchuserid = async () => {
    try {
      const res = await axios.get(`/GetUserID/${Username}`);
      console.log("GetUserID response:", res.data);

      if (Array.isArray(res.data) && res.data.length > 0) {
        const id = res.data[0].userid;
        setUserid(id);
        getCertificate(id);
      } else {
        console.error("Unexpected API response:", res.data);
      }
    } catch (err) {
      console.error("Failed to fetch userid:", err);
    }
  };

  const getCertificate = async (userid) => {
    try {
      const res = await axios.get(`/Getcertificate/${userid}`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        setApplications(res.data);
        //auto-select when processDetailCode exists
        if (processDetailCode) {
          const matchedItem = res.data.find(
            (item) => item.detail_code === processDetailCode
          );

          if (matchedItem) {
            setApplicationNumber(matchedItem.application_number);
            setDiagnosiscode(matchedItem.diagnosis_code);
            setDetailcode(matchedItem.detail_code);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch certificate data:", err);
    }
  };

  const handleSelectChange = (e) => {
    const selectedAppNumber = e.target.value;
    setApplicationNumber(selectedAppNumber);

    const selectedItem = applications.find(
      (item) => item.application_number === selectedAppNumber
    );

    if (selectedItem) {
      setDiagnosiscode(selectedItem.diagnosis_code);
      setDetailcode(selectedItem.detail_code);
    }
  };

  const handleSave = () => {
    if (!diagnosis_code) {
      setMessage("Please select an application.");
      return;
    }

    if (onsave) {
      onsave(diagnosis_code);
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 900,
          p: 4,
          borderRadius: 3
        }}
      >

        {message && <div className="alert alert-info">{message}</div>}

        <Divider sx={{ my: 1 }} />

        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant="h6" sx={{ color: "#0b5c8e", fontWeight: 700 }}>
           Select Application
          </Typography>
          <Box sx={{ height: 1, backgroundColor: "#e0e0e0", mt: 1 }} />
        </Box>

        <Typography sx={{ color: "#0b5c8e", fontWeight: 600 }}>
          Choose an application from the list below to proceed.
        </Typography>

        <TextField
          select
          fullWidth
          value={application_number}
          onChange={handleSelectChange}
          SelectProps={{ native: true }}
          
        >
          <option value="">-- Select --</option>
          {applications.map((app) => (
            <option key={app.application_number} value={app.application_number}>
              {app.application_number}
            </option>
          ))}
        </TextField>

        <div style={{ marginTop: "20px" }}>
     <button
       type="button"
          className="actionBtn saveBtn"
       onClick={handleSave}
         >
       💾 {processDetailCode ? "Update" : "Save"}
      </button>
        </div>

      </Paper>
    </Box>
  );
};
export default Medical_Certificate_Application;
