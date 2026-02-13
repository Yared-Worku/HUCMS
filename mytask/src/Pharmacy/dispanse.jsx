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

const Dispanse = ({ application_number, todocode }) => {
  // 🔹 Patient info from API
  const [patientName, setPatientName] = useState("");
  const [department, setDepartment] = useState("");
  const [studentId, setStudentId] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState(""); 
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [RX, setRX] = useState("");
  const [prescriber, setPrescriber] = useState("");
  const [message, setMessage] = useState("");
  const [userid, setUserid] = useState(null);
  const navigate = useNavigate();
   const [remark, setRemark] = useState("");
    const [quantity, setQuantity] = useState("");
    const [detailCode, setDetailcode] = useState("");
    const [errors, setErrors] = useState({quantity: false, remark: false,});

   const Username = "dani123";
    // const Username = window.__DNN_USER__?.username ?? "Guest";

  useEffect(() => {
    if (application_number) {
      getLicense(application_number);
      fetchuserid();
      getRequestedDrug();
    }
  }, [application_number]);
const fetchuserid = async () => {
    try {
      const res = await axios.get(`/GetUserID/${Username}`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        setUserid(res.data[0].userid);
      }
    } catch (err) {
      console.error("Failed to fetch userid:", err);
    }
  };

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
   const getRequestedDrug = async () => {
    try {
        // debugger
      const res = await axios.get(`/GetRX/${todocode}`);
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
    setSaving(true);
    setMessage("");

    const payload = {
      todocode: todocode,
      remark: remark,
      UserId: userid,
      quantity: parseInt(quantity, 10),
      UserId: userid,
      application_number: application_number,
      detail_code: detailCode
    };
    await axios.post("/Dispense", payload);
    setMessage("🎉 The task completed successfully!");
    navigate("/mytask");
  } catch (error) {
    console.error("❌ Failed to save task data:", error);
    setMessage("Failed to save data.");
  } finally {
    setSaving(false);
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
        <Divider sx={{ my: 1 }} />
         <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">
              prescriber:
            </Typography>
            <Typography fontWeight={600}>{prescriber || "—"}</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
             RX:
            </Typography>
            <Typography fontWeight={600}>{RX || "—"}</Typography>
          </Grid>
           <Divider sx={{ my: 1 }} />
        {/* Divider */}
        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant="h6" sx={{ color: "#0b5c8e", fontWeight: 700 }}>
            Despense Medicine
          </Typography>
          <Box sx={{ height: 1, backgroundColor: "#e0e0e0", mt: 1 }} />
        </Box>
         <Typography variant="header" sx={{ color: "#0b5c8e", fontWeight: 600 }}>
            Quantity
          </Typography>
        <TextField
  type="number"
  fullWidth
  placeholder="Enter quantity."
  value={quantity}
  onChange={(e) => {
    const value = e.target.value;
    setQuantity(value);

    setErrors((prev) => ({
      ...prev,
      quantity: !value.trim(),
    }));
  }}
  onBlur={() => {
    setErrors((prev) => ({
      ...prev,
      quantity: !quantity.trim(),
    }));
  }}
  error={errors.quantity}
  helperText={errors.quantity ? "Quantity is required" : ""}
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
            disabled={isSaved || saving}
          >
            {isSaved ? "✅ Saved" : "💾 Save"}
          </button>
        </div>
       
      </Paper>
    </Box>
  );
};

export default Dispanse;
