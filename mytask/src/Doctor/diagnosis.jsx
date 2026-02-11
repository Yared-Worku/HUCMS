import React, { useState, useEffect } from "react";
import "../Services.css";
import axios from "axios";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button
} from "@mui/material";

const Diagnosis = ({ application_number, onSave, Diagnosis, diagnosisCode }) => {
  // 🔹 Patient info from API
  const [patientName, setPatientName] = useState("");
  const [department, setDepartment] = useState("");
  const [studentId, setStudentId] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState(""); 
  const [diagnosis, setDiagnosis] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);

  useEffect(() => {
    if (application_number) {
      getLicense(application_number);
    }
  }, [application_number]);
  useEffect(() => {
  if (Diagnosis) {
    setDiagnosis(Diagnosis);
  }
}, [Diagnosis]);

  // Fetch license / patient info
  const getLicense = async (appNo = application_number) => {
    try {
      const res = await axios.get(`/GetLicense/${appNo}`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        const d = res.data[0];

        setPatientName(
          [
            d.applicant_First_Name_EN,
            d.applicant_Last_Name_EN,
            d.applicant_Middle_Name_En,
          ]
            .filter(Boolean)
            .join(" ")
        );

        setDepartment(d.depname || "");
        setStudentId(d.iD_NO || "");
        setAge(d.age || "");
        setGender(d.gender || "");
      }
    } catch (err) {
      console.error("Failed to fetch license info:", err);
    }
  };

  // Save / Update handler
  const handleSave = async () => {
    if (!onSave) return;

    setSaving(true);
    const success = await onSave(diagnosis);
    setSaving(false);

    if (success) {
      if (diagnosisCode) {
        setIsUpdate(true);  
      }
      setIsSaved(true);      
    }
  };

  // Button text logic
  let buttonText = "💾 Save";
  if (isSaved) {
    buttonText = isUpdate ? "✅ Updated" : "✅ Saved";
  } else if (diagnosisCode) {
    buttonText = "Update";
  }

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
        {/* Patient Info */}
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">
              Patient Name:
            </Typography>
            <Typography fontWeight={600}>{patientName || "—"}</Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Gender:
            </Typography>
            <Typography fontWeight={600}>{gender || "—"}</Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">
              Department:
            </Typography>
            <Typography fontWeight={600}>{department || "—"}</Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Age:
            </Typography>
            <Typography fontWeight={600}>{age || "—"}</Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">
              Student ID:
            </Typography>
            <Typography fontWeight={600}>{studentId || "—"}</Typography>
          </Grid>
        </Grid>

        {/* Divider */}
        <Box sx={{ mt: 4, mb: 2 }}>
          <Typography variant="h6" sx={{ color: "#0b5c8e", fontWeight: 700 }}>
            Detail Diagnosis
          </Typography>
          <Box sx={{ height: 1, backgroundColor: "#e0e0e0", mt: 1 }} />
        </Box>

        {/* Diagnosis Input */}
        <TextField
          fullWidth
          multiline
          minRows={4}
          placeholder="Enter the patient's chief complaint, critical symptoms, examination findings, condition, plan and detailed clinical rationale here."
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          required
        />
        
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 2, display: "block" }}
        >
          Provide a comprehensive overview of the patient's condition.
        </Typography>

        <div style={{ marginTop: "20px" }}>
          <button
            type="button"
            className="actionBtn saveBtn"
            onClick={handleSave}
            disabled={isSaved || saving}
          >
            {saving ? "⏳ Saving..." : buttonText}
          </button>
        </div>
       
      </Paper>
    </Box>
  );
};

export default Diagnosis;
