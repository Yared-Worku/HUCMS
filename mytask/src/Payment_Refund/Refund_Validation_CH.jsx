import React, { useState, useEffect } from "react";
import "../Services.css";
import axios from "axios";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Container
} from "@mui/material";

const Payment_Refund_CH = ({ application_number, ProcessDetailCode, onSave, pr_Code, onpr_Code }) => {
  // 🔹 Patient info from API
  const [patientName, setPatientName] = useState("");
  const [department, setDepartment] = useState("");
  const [studentId, setStudentId] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState(""); 
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [amountInWord, setAmountInWord] = useState(""); 
  const [amountInDigit, setAmountInDigit] = useState("");
  const [pr_code, setprCode] = useState("");  
     
  useEffect(() => {
    if (application_number) {
      getLicense(application_number);
    }
    getRefund(ProcessDetailCode);
  }, [application_number]);
useEffect(() => {
  if (pr_code && onpr_Code) {
    onpr_Code(pr_code);
  }
}, [pr_code]);

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
const getRefund = async (ProcessDetailCode) => {
  try {
    const res = await axios.get(`/GetPaymentRefund/${ProcessDetailCode}`);
    //  debugger
    if (Array.isArray(res.data) && res.data.length > 0) {
          setprCode(res.data[0].pr_Code);
          setAmountInDigit(res.data[0].amount_inDigit);
          setAmountInWord(res.data[0].amount_inWord);
     } else {
        console.error("Unexpected API response:", res.data);
      }
  } catch (err) {
    console.error("Failed to fetch refund data:", err);
  }
};

  // Save / Update handler
  const handleSave = async () => {
  if (!onSave) return;

  setSaving(true);

  const dataToSend = {
    amountInWord: amountInWord,
    amountInDigit: Number(amountInDigit) 
  };

  const success = await onSave(dataToSend);
  
  setSaving(false);

  if (success) {
    if (pr_Code) {
      setIsUpdate(true);  
    }
    setIsSaved(true);      
  }
};

  // Button text logic
  let buttonText = "💾 Save";
  if (isSaved) {
    buttonText = isUpdate ? "✅ Updated" : "✅ Saved";
  } else if (pr_Code) {
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
        
  <Container maxWidth="lg" sx={{ mt: 4 }}>
  <Paper sx={{ p: 4, borderRadius: 3 }}>
    <Box sx={{ mt: 4 }}>
 
    <Grid item xs={12} md={6}>
      <Box sx={{ mb: 1 }}>
        <Typography  sx={{ color: "#0b5c8e", fontWeight: 700 }}>
          Amount in word
        </Typography>
        <Box sx={{ height: 1, backgroundColor: "#e0e0e0", mt: 1 }} />
      </Box>
      <TextField
        fullWidth
        multiline
        minRows={1}
        placeholder="Write the amount in word here."
        value={amountInWord}
        onChange={(e) => setAmountInWord(e.target.value)}
        required
      />
    </Grid>
    <Grid item xs={12} md={6}>
      <Box sx={{ mt: 2 }}>
        <Typography  sx={{ color: "#0b5c8e", fontWeight: 700 }}>
          Amount in digit
        </Typography>
        <Box sx={{ height: 1, backgroundColor: "#e0e0e0", mt: 1}} />
      </Box>

      <TextField
        fullWidth
        type="number"
        placeholder="Enter the amount in digit (birr)."
        value={amountInDigit}
        onChange={(e) => setAmountInDigit(e.target.value)}
        required
        inputProps={{ 
        step: "any" 
      }}
      />
    </Grid>
    </Box>
     </Paper>
   </Container>
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

export default Payment_Refund_CH;
