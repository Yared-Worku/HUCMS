import React, { useState, useEffect } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  LinearProgress,
  Fade
} from "@mui/material";

import {
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  InsertDriveFile as FileIcon,
  CheckCircle as SuccessIcon
} from '@mui/icons-material';

import Survey from "./Survey/survey";
import Customer from "./Customer/customer";
import Review from "./Review/review";
import Medical_Certificate from "./Medical_certificate/medical_certificate_application";

const Main = () => {
  const { application_number, service_code, task_code, organization_code, application_detail_id, meta_data_forms_form_code } = useParams();
  const Username = 'amani';

  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [applicationNumber, setApplicationNumber] = useState(null);
  const [serviceName, setServiceName] = useState(null);
  const [processDetailCode, setprocessDetailCode] = useState(null);
  const [userid, setUserid] = useState(null);
  const [todocode, settodocode] = useState(null);
  const [completedSteps, setCompletedSteps] = useState({});
  const steps = ["Application", "Customer Detail", "Review"];

  const [selectedFile, setSelectedFile] = useState(null);
  const [documentFile, setDocumentFile] = useState(""); 
  const [isDragging, setIsDragging] = useState(false);

  const completed = (isCompleted) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [activeStep]: isCompleted,
    }));
  };

  useEffect(() => {
    getLicense(application_number);
    fetchuserid();
  }, []);

  const handleDragOver = (e) => { 
    e.preventDefault(); 
    setIsDragging(true); 
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setDocumentFile(reader.result);
      setSelectedFile(file);
    };
    reader.readAsDataURL(file);
  };

  const submitted = async () => {
    try {
      const res = await axios.post("/ToDo", {
        tasks_task_code: task_code,
        application_number: applicationNumber,
        todocode: todocode,
        organization_code: organization_code,
        userId: userid
      });

      console.log("✅ ToDo created:", res.data);
      setMessage("🎉 Successfully Submitted!");
      navigate("/myapplication");
    } catch (error) {
      console.error("❌ Failed to create ToDo:", error);
      alert("Could not create ToDo.");
    }
  };

  const getLicense = async (appNo = application_number) => {
    try {
      const res = await axios.get(`/GetLicense/${appNo}`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        setApplicationNumber(res.data[0].applicationNumber);
        setServiceName(res.data[0].serviceDescription_EN);
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

  const handleSave = async (data) => {
    setMessage("");
    try {
      const payload = {
        application_number: applicationNumber,
        services_service_code: service_code,
        organization_code: organization_code,
        tasks_task_code: task_code,
        UserId: userid,
        document: documentFile 
      };

      const isGuid = typeof data === "string" && /^[0-9a-fA-F-]{36}$/.test(data);
      if (isGuid) {
        payload.diagnosis_code = data;
        // payload.document = documentFile;
      } else {
        payload.value = JSON.stringify(data);
      }

      const res = await axios.post("/Application", payload);
      if (res.data) {
        setApplicationNumber(res.data.applicationNumber);
        setprocessDetailCode(res.data.processDetailCode);
        settodocode(res.data.toDoCode);
      }

      setMessage("Thank you for completing the form!");
      completed(true);
      getLicense(res.data.applicationNumber);
    } catch (error) {
      console.error("❌ Failed to create application:", error);
      alert("Could not create application.");
    }
  };

  const code = meta_data_forms_form_code.toUpperCase();

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        if (code === "E0D68EE8-56E6-4262-A407-8999F92FCCDE" || code === "8B4ADCF4-EC5F-4C66-979F-654889CEB0D0") {
          return <Medical_Certificate processDetailCode={application_detail_id} onsave={handleSave} />;
        } else {
          return <Survey formCode={meta_data_forms_form_code} onsave1={handleSave} detailId={application_detail_id} />;
        }
      case 1:
        return <Customer onsave2={completed} />;
      case 2:
        return <Review formCode={meta_data_forms_form_code} processDetailCode={processDetailCode} userId={userid} />;
      default:
        return <Typography>⚠️ No component found</Typography>;
    }
  };

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      <Paper
        elevation={3}
        sx={{
          p: 1.5,
          mb: 2,
          borderRadius: 2,
          background: "linear-gradient(135deg, #1976d2 30%, #42a5f5 90%)",
          color: "white",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Application Number: {applicationNumber}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Service Name: {serviceName}
          </Typography>
        </Box>
      </Paper>
     {(
        code === "8B4ADCF4-EC5F-4C66-979F-654889CEB0D0"
         ) && (
      <Box sx={{ display: 'flex', justifyContent: 'left', width: '100%' }}>
        <Paper
          elevation={isDragging ? 4 : 1}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          sx={{
            p: 1,
            mb: 1,
            borderRadius: 2,
            border: '4px solid',
            borderColor: isDragging ? 'primary.main' : '#e0e0e0',
            backgroundColor: isDragging ? '#f0f7ff' : '#fafafa',
            transition: 'all 0.1s ease',
            position: 'relative',
            overflow: 'hidden',
            maxWidth: '450px',
            width: '100%'
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                p: 0.8,
                borderRadius: '50%',
                backgroundColor: selectedFile ? 'success.light' : 'primary.light',
                color: selectedFile ? 'success.main' : 'primary.main',
                display: 'flex'
              }}>
                {selectedFile ? <FileIcon fontSize="small" /> : <UploadIcon fontSize="small" />}
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {selectedFile ? "Document Attached" : "Upload Document"}
                </Typography>
                <Typography variant="caption" sx={{
                  display: 'block',
                  maxWidth: '150px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {selectedFile ? selectedFile.name : "Drag or browse"}
                </Typography>
              </Box>
            </Box>

            <Box>
              <Button
                type="button"
                variant="outlined"
                component="label"
                size="small"
                sx={{ borderRadius: 1.5, textTransform: 'none' }}
              >
                Browse
                <input
                  type="file"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) handleFileUpload(file);
                  }}
                />
              </Button>

              {selectedFile && (
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => {
                    setSelectedFile(null);
                    setDocumentFile("");
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>
   )}
      {message && <div className="alert alert-info" style={{ marginBottom: '10px' }}>{message}</div>}

      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 3 }}>{getStepContent(activeStep)}</Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
        <Button
          type="button"
          disabled={activeStep === 0}
          onClick={() => setActiveStep((prev) => prev - 1)}
        >
          Back
        </Button>

        {activeStep === steps.length - 1 ? (
          <Button className="saveBtn" variant="contained" color="primary" onClick={submitted}>
            Submit
          </Button>
        ) : (
          <Button
            type="button"
            variant="contained"
            color="primary"
            onClick={() => setActiveStep((prev) => prev + 1)}
            disabled={!completedSteps[activeStep]}
          >
            Next
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default Main;