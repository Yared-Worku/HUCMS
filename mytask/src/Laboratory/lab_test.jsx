import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Services.css";
import axios from "axios";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
   Divider
} from "@mui/material";
import Mytask from "../mytask";
const LabTest = ({ application_number, todocode, diagnosisCode }) => {
  // 🔹 Patient info from API
    const navigate = useNavigate();
  const [patientName, setPatientName] = useState("");
  const [department, setDepartment] = useState("");
  const [studentId, setStudentId] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState(""); 
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userid, setUserid] = useState(null);
  const [message, setMessage] = useState("");
   const [RequestedPersonel, setPRequestedPersonelName] = useState("");
  //  const [labtest, setLabtest] = useState("");
  const [labResult, setLabresult] = useState("");
   const [labTests, setLabTests] = useState([]);
  const [labResultsByTest, setLabResultsByTest] = useState({});

  //  const Username = "dani123";
   const Username = window.__DNN_USER__?.username ?? "Guest";

 useEffect(() => {
    if (application_number) {
        fetchuserid();
      getLicense(application_number);
      getRequestedTest(todocode)
    }
  }, [application_number]);
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
 
   const getRequestedTest = async () => {
    try {
      const res = await axios.get(`/GetLabTest/${todocode}`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        const d = res.data[0];

        setPRequestedPersonelName(
          [
            d.firstName,
            d.lastName,
          ]
            .filter(Boolean)
            .join(" ")
        );

            const tests = (d.lab_test || "")
        .split(",")
        .map(t => t.trim())
        .filter(Boolean);
      setLabTests(tests);
      // initialize result object
      const initialResults = {};
      tests.forEach(t => {
        initialResults[t] = "";
      });

      setLabResultsByTest(initialResults);
      }
    } catch (err) {
      console.error("Failed to fetch lab test data:", err);
    }
  };

const handleSave = async () => {
  try {
    await axios.post("/LabResult", {
    lab_result: Object.entries(labResultsByTest)
  .map(([test, result]) => `${test}: ${result}`)
  .join(",\n"),
      UserId: userid,
      application_number: application_number,
      todocode: todocode
    });

    setMessage("Lab Result saved successfully.");
    setIsSaved(true); 
    navigate("/mytask");
  } catch (error) {
    console.error("❌ Failed to save lab result:", error);
    setMessage("Failed to save lab result.");
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
          <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant="h6" sx={{ color: "#0b5c8e", fontWeight: 700 }}>
           Laboratory Test 
          </Typography>
          <Box sx={{ height: 1, backgroundColor: "#e0e0e0", mt: 1 }} />
        </Box>
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
         <Divider sx={{ my: 1 }} />
               <Box sx={{ mt: 4, mb: 2 }}>
             <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">
              Requesting Personel:
            </Typography>
            <Typography fontWeight={600}>{RequestedPersonel || "—"}</Typography>
          </Grid>
          </Box>
          <Divider sx={{ my: 1 }} />

  {labTests.map((test, index) => (
  <Box key={index} sx={{ mt: 3 }}>
    <Typography
      variant="subtitle1"
      sx={{ fontWeight: 600, color: "#0b5c8e", mb: 1 }}
    >
      {test}
    </Typography>

    <TextField
      fullWidth
      multiline
      minRows={1}
      placeholder={`Enter result for ${test}`}
      value={labResultsByTest[test] || ""}
      onChange={(e) =>
        setLabResultsByTest(prev => ({
          ...prev,
          [test]: e.target.value
        }))
      }
      required
    />
  </Box>
   ))}
     <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 2, display: "block" }}
            >
              NB: Perform each test listed above and enter the result for each test one by one and finally, click the save button.
            </Typography>  
      <div style={{ marginTop: "20px" }}>
        <button
          type="button"
         className="actionBtn saveBtn"
          onClick={handleSave}
          disabled={isSaved}
        >
          {isSaved ? "✅ Saved " : "💾 Save"}
        </button>
      </div>
       
      </Paper>
    </Box>
  );
};

export default LabTest;
