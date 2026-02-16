import React, { useState, useEffect } from "react";
import "../Services.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Divider
} from "@mui/material";

const Medical_Certificate = ({ processDetailCode, userId }) => {

  const [RX, setRX] = useState("");
  const [prescriber, setPrescriber] = useState("");
  const [message, setMessage] = useState("");
//   const [userid, setUserid] = useState(null);
  const navigate = useNavigate();
   const [patient_condition, setPatientCondition] = useState("");
    const [health_profetional_recomendation, setHealthProfetionalRecomendation] = useState("");
    const [diagnosis_code, setDiagnosiscode] = useState(null);
    const [errors, setErrors] = useState({quantity: false, remark: false,});

   const Username = "amani";
    // const Username = window.__DNN_USER__?.username ?? "Guest";

  useEffect(() => {
    
      getRequestedDrug();

  }, []);

   const getRequestedDrug = async () => {
    try {
        // debugger
      const res = await axios.get(`/Getcertificate/${userId}`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        const d = res.data[0];

        setPrescriber(
          [
            d.firstName,
            d.lastName,
          ]
            .filter(Boolean)
            .join(" ")
        );
      setRX(d.rX);
      setDetailcode(d.detail_code);
      }
    } catch (err) {
      console.error("Failed to fetch RX:", err);
    }
  };

 const handleSave = async () => {
  const newErrors = {
    quantity: !quantity.trim(),
    remark: !remark.trim(),
  };
  setErrors(newErrors);
  if (newErrors.quantity || newErrors.remark) {
    return;
  }
  try {
    setMessage("");

    const payload = {
      remark: remark,
      UserId: userId,
      processDetailCode: processDetailCode
    };
    await axios.post("/Dispense", payload);
    setMessage("🎉 The task completed successfully!");
    navigate("/mytask");
  } catch (error) {
    console.error("❌ Failed to save task data:", error);
    setMessage("Failed to save data.");
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
        {/* Patient Info */}

        <Divider sx={{ my: 1 }} />
         <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">
              prescriber:
            </Typography>
            <Typography fontWeight={600}>{prescriber || "—"}</Typography>
          {/* </Grid>
          <Grid item xs={12} sm={4}> */}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
             Patient Condition:
            </Typography>
            <Typography fontWeight={600}>{patient_condition || "—"}</Typography>
          </Grid>
        {/* Divider */}
        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant="h6" sx={{ color: "#0b5c8e", fontWeight: 700 }}>
            Despense Medicine
          </Typography>
          <Box sx={{ height: 1, backgroundColor: "#e0e0e0", mt: 1 }} />
        </Box>
         <Typography variant="header" sx={{ color: "#0b5c8e", fontWeight: 600 }}>
            Patient Condition:
          </Typography>
        <TextField
  fullWidth
  placeholder="Enter quantity."
  value={patient_condition}
  onChange={(e) => {
    const value = e.target.value;
    setPatientCondition(value);

    setErrors((prev) => ({
      ...prev,
      patient_condition: !value.trim(),
    }));
  }}
  onBlur={() => {
    setErrors((prev) => ({
      ...prev,
      patient_condition: !patient_condition.trim(),
    }));
  }}
  error={errors.patient_condition}
  helperText={errors.patient_condition ? "Quantity is required" : ""}
/>

          <Typography variant="header" sx={{ color: "#0b5c8e", fontWeight: 600 }}>
            Remark
          </Typography>
       <TextField
  fullWidth
  multiline
  minRows={1}
  placeholder="Please Provide Remark here."
  value={remark}
  onChange={(e) => {
    const value = e.target.value;
    setRemark(value);

    setErrors((prev) => ({
      ...prev,
      remark: !value.trim(),
    }));
  }}
  onBlur={() => {
    setErrors((prev) => ({
      ...prev,
      remark: !remark.trim(),
    }));
  }}
  error={errors.remark}
  helperText={errors.remark ? "Remark is required" : ""}
/>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 2, display: "block" }}
        >
         It is required to provide a remark to identify whether the medicine dispensed or prescribed to outside the campus pharmacy.
        </Typography>

        <div style={{ marginTop: "20px" }}>
          <button
            type="button"
            className="actionBtn saveBtn"
            onClick={handleSave}
          >
            💾 Save
          </button>
        </div>
       
      </Paper>
    </Box>
  );
};

export default Medical_Certificate;
