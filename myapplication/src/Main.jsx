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
  Paper
} from "@mui/material";

// Import your step components
import Survey from "./Survey/survey";
import Customer from "./Customer/customer";
import Review from "./Review/review";
import Medical_Certificate from "./Medical_certificate/medical_certificate_application";

const Main = () => {
  const {application_number, service_code, task_code, organization_code, application_detail_id, meta_data_forms_form_code } = useParams();
  const Username = window.__DNN_USER__?.username ?? "Guest";
  // const Username = 'amani'

  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [applicationNumber, setApplicationNumber] = useState(null);
  const [serviceName, setServiceName] = useState(null);
  const [processDetailCode, setprocessDetailCode] = useState(null);
  const [userid, setUserid] = useState(null);
   const [todocode, settodocode] = useState(null);
  // Track completion state per step
  const [completedSteps, setCompletedSteps] = useState({});
  // Step titles
  const steps = ["Application", "Customer Detail", "Review"];
  // Mark a step completed
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

const submitted = async () => {
  try {
    const res = await axios.post("/ToDo", {
      tasks_task_code: task_code,
      application_number: applicationNumber,
      todocode: todocode,
      organization_code: organization_code,
      userId: userid,
    });

    console.log("✅ ToDo created:", res.data);
  setMessage("🎉 Successfully Submitted!");
  navigate("/myapplication")
  } catch (error) {
    console.error("❌ Failed to create ToDo:", error);
    alert("Could not create ToDo.");
  }
};
const getLicense = async (appNo = application_number) => {
  try {
    const res = await axios.get(`/GetLicense/${appNo}`);
    console.log("GetLicense response:", res.data);

    if (Array.isArray(res.data) && res.data.length > 0) {
      setApplicationNumber(res.data[0].applicationNumber);
      setServiceName(res.data[0].serviceDescription_EN);
    } else {
      console.error("Unexpected API response:", res.data);
    }
  } catch (err) {
    console.error("Failed to fetch license info:", err);
  }
};

const fetchuserid = async () => {
  try {
    // debugger
    const res = await axios.get(
      `/GetUserID/${Username}`
    );

    console.log("GetUserID response:", res.data);

    if (Array.isArray(res.data) && res.data.length > 0) {
      // correct property is lowercase 'userid'
      setUserid(res.data[0].userid);
    } else {
      console.error("Unexpected API response:", res.data);
    }
  } catch (err) {
    console.error("Failed to fetch userid:", err);
  }
};
  // Handle Save
  const handleSave = async (data) => {
  setMessage("");

  try {

    const payload = {
      application_number: applicationNumber,
      services_service_code: service_code,
      organization_code: organization_code,
      tasks_task_code: task_code,
      UserId: userid,
    };

    // 🔹 Check if data is Guid (string Guid format)
    const isGuid =
      typeof data === "string" &&
      /^[0-9a-fA-F-]{36}$/.test(data);

    if (isGuid) {
      payload.diagnosis_code = data;
    } else {
      payload.value = JSON.stringify(data);
    }

    const res = await axios.post("/Application", payload);

    console.log("✅ Application created:", res.data);

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
  // Step content renderer
  const getStepContent = (step) => {
    switch (step) {
      case 0: {
         if(code === "E0D68EE8-56E6-4262-A407-8999F92FCCDE"){ 
           return <Medical_Certificate processDetailCode={application_detail_id} onsave={handleSave} />
         }
          else{
       return <Survey formCode={meta_data_forms_form_code} onsave1={handleSave} detailId={application_detail_id} />
          }    
        }
      case 1:
        return <Customer  onsave2={completed} />;
      case 2:
        // debugger
        return <Review formCode={meta_data_forms_form_code} processDetailCode={processDetailCode} userId={userid}  />;
      default:
        return <Typography>⚠️ No component found</Typography>;
    }
  };

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      <Paper
        elevation={3}
        sx={{
          p: 1.0,
          mb: 2,
          borderRadius: 2,
          background: "linear-gradient(135deg, #1976d2 30%, #42a5f5 90%)",
          color: "white",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Application Number: {applicationNumber } 
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Service Name: {serviceName } 
            </Typography>
          </Box>
        </Box>
      </Paper>
     {message && <div className="alert alert-info">{message}</div>}
      {/* Stepper */}
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {/* Step Content */}
      <Box sx={{ mt: 3 }}>{getStepContent(activeStep)}</Box>
      {/* Navigation */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
        <Button  
        type="button"
          disabled={activeStep === 0}
          onClick={() => setActiveStep((prev) => prev - 1)}
        >
          Back
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button className="saveBtn" variant="contained" color="primary" 
           onClick={submitted}>
            Submit
          </Button>
        ) : (
          <Button type="button"
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
