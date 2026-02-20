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

const Medical_Certificate = ({userId, application_number,todocode }) => {

  // 🔹 Patient info from API
  const [patientName, setPatientName] = useState("");
  const [department, setDepartment] = useState("");
  const [studentId, setStudentId] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState(""); 
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
   const [patient_condition, setPatientCondition] = useState("");
    const [health_profetional_recomendation, setHealthProfetionalRecomendation] = useState("");
    const [diagnosis, setDiagnosis] = useState("");
    const [treatment, setTreatment] = useState("");
      const [atendedondate, setAttendedDte] = useState("");
         const [detail_code, setDetailcode] = useState("");
    const [errors, setErrors] = useState({patient_condition: false, health_profetional_recomendation: false,});

  //  const Username = "amani";
    const Username = window.__DNN_USER__?.username ?? "Guest";
  useEffect(() => {
    if (application_number) {
      getLicense(application_number);
      getGetcertificateDetail();
    }
  }, [application_number]);

const getGetcertificateDetail = async () => {
  try {
    const res = await axios.get(
      `/GetcertificateDetail`,
      {
        params: {
          applicationNumber: application_number
        }
      }
    );

    if (Array.isArray(res.data) && res.data.length > 0) {
      const d = res.data[0];
      setDiagnosis(d.diagnosis);
      setTreatment(d.treatment);
      setAttendedDte(d.attendedondate);
       setDetailcode(d.detail_code);
    } else {
      console.log("No certificate data found.");
    }

  } catch (err) {
    if (err.response && err.response.status === 404) {
      console.log("No certificate records found.");
    } else {
      console.error("Failed to fetch certificate detail:", err);
    }
  }
};

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
 const handleSave = async () => {
  const newErrors = {
    patient_condition: !patient_condition.trim(),
    health_profetional_recomendation: !health_profetional_recomendation.trim(),
  };
  setErrors(newErrors);
  if (newErrors.patient_condition || newErrors.health_profetional_recomendation) {
    return;
  }
  try {
    setMessage("");

    const payload = {
      health_profetional_recomendation: health_profetional_recomendation,
      UserId: userId,
      processDetailCode: detail_code,
      patient_condition: patient_condition,
      todocode: todocode,
      application_number: application_number
    };
    await axios.post("/IssueCertificate", payload);
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
                 <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant="h6" sx={{ color: "#0b5c8e", fontWeight: 700 }}>
            Medical Certificate
          </Typography>
          <Box sx={{ height: 1, backgroundColor: "#e0e0e0", mt: 1 }} />
        </Box>
               {/* Patient Info */}
               <Grid container spacing={8}>
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
               <Divider sx={{ my: 2 }} />
                <Grid container spacing={8}>
             <Grid item xs={12} sm={4}>
                   <Typography variant="body2" color="text.secondary">
                     Diagnosis Or Injury:
                   </Typography>
                   <Typography fontWeight={600}>{diagnosis || "—"}</Typography>
                   <Typography variant="body2" color="text.secondary">
                     Treatment Given:
                   </Typography>
                   <Typography fontWeight={600}>{treatment || "—"}</Typography>
                 </Grid>
                    <Grid item xs={12} sm={4}>
                   <Typography variant="body2" color="text.secondary">
                     Attended In Our Clinic On:
                   </Typography>
                   <Typography fontWeight={600}>{atendedondate || "—"}</Typography>
                 </Grid>
                 </Grid>
        {/* Divider */}
           <Divider sx={{ my: 2 }} />
         <Typography variant="header" sx={{ color: "#0b5c8e", fontWeight: 600 }}>
            Patient Condition:
          </Typography>
        <TextField
  fullWidth
  placeholder="Provide the patient condition here."
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
  helperText={errors.patient_condition ? "petient condition is required" : ""}
/>

          <Typography variant="header" sx={{ color: "#0b5c8e", fontWeight: 600 }}>
          Recomendation of the health profesional:
          </Typography>
       <TextField
  fullWidth
  multiline
  minRows={1}
  placeholder="Please Provide your recomendation here."
  value={health_profetional_recomendation}
  onChange={(e) => {
    const value = e.target.value;
    setHealthProfetionalRecomendation(value);

    setErrors((prev) => ({
      ...prev,
      health_profetional_recomendation: !value.trim(),
    }));
  }}
  onBlur={() => {
    setErrors((prev) => ({
      ...prev,
      health_profetional_recomendation: !health_profetional_recomendation.trim(),
    }));
  }}
  error={errors.health_profetional_recomendation}
  helperText={errors.health_profetional_recomendation ? "recomendation is required" : ""}
/>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 2, display: "block" }}
        >
         It is required to provide your recomendation.
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
