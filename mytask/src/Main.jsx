import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Button,
  Paper,
  Typography,
  Stack,
  Menu,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid, 
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import CloseIcon from "@mui/icons-material/Close";
import * as SurveyReact from "survey-react-ui";
import { Model } from "survey-core";
import "survey-core/survey-core.min.css";
import Survey from "./Survey/survey";
import Diagnosis from "./Doctor/diagnosis"; 
import LabTest from "./Laboratory/lab_test";
import Dispanse from "./Pharmacy/dispanse";
import Medical_Certificate from "./Doctor/medical_certificate";

const Main = () => {
  const {
    application_number,
    service_code,
    task_code,
    organization_code,
    todocode,
    application_detail_id,
    meta_data_forms_form_code,
  } = useParams();

  const Username = "dani123";
// const Username = window.__DNN_USER__?.username ?? "Guest";

  const navigate = useNavigate();
  const code = meta_data_forms_form_code.toUpperCase();
  
  const [applicationNumber, setApplicationNumber] = useState(null);
  const [ProcessDetailCode, setprocessdetailcode] = useState(null);
  const [diagnosis_Code, setdiagnosis_Code] = useState(null);
  const [serviceName, setServiceName] = useState(null);
  const [userid, setUserid] = useState(null);
  const [cust_ID, setcust_ID] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [labTestInput, setLabTestInput] = useState("");
   const [appointmentReason, setAppointmentReason] = useState("");
   const [appointmentDate, setAppointmentDate] = useState("");
   const [vitalsign, setVitalsign] = useState("");
   const [physicalexamination, setPhysicalexamination] = useState("");
   const [referalreason, setReferalreason] = useState("");
  const [PopupInput, setPopupInput] = useState("");
const [expanded, setExpanded] = useState(false);
  const [diagnosis, setDiagnosis] = useState("");
  // Unified Popup State ---
  const [popupState, setPopupState] = useState({
    open: false,
    type: "MESSAGE", // 'REVIEW' or 'MESSAGE'
    title: "",
    data: null, // Can be array (for reviews) or string (for messages)
  });

  const [actions, setActions] = useState([]);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedActionCode, setSelectedActionCode] = useState(null);
  const [loadingActions, setLoadingActions] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [message, setMessage] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [labTests, setLabTest] = useState([]);
    const [lab_Code, setLabcode] = useState(null);
    const [detail_code, setdetail_code] = useState(null);
    const [appointmentdate, setappointment_date] = useState(null);
    const [appointmentreason, setappointment_reason] = useState("");
    const [appointmentCode, setappointment_Code] = useState(null);
    const [refCode, setRefCode] = useState(null);
    const [vital_sign, setVitalSign] = useState("");
    const [physical_examination, setPhysicalExamination] = useState("");
    const [reason_for_referal, setReferalReason] = useState("");
    const [RX, setRX] = useState("");
  useEffect(() => {
    getLicense(application_number);
    fetchuserid();
    getDiagnosis();
  }, []);

  // --- Helper to Open Common Popup ---
  const openCommonPopup = (type, title, data) => {
    setPopupState({
      open: true,
      type: type, // 'REVIEW' for JSON forms, 'MESSAGE' for success/error text
      title: title,
      data: data,
    });
  };

  const handleClosePopup = () => {
    setPopupState((prev) => ({ ...prev, open: false }));
  };

  const getLicense = async (appNo = application_number) => {
    try {
      const res = await axios.get(`/GetLicense/${appNo}`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        setApplicationNumber(res.data[0].applicationNumber);
        setServiceName(res.data[0].serviceDescription_EN);
        setcust_ID(res.data[0].cust_ID);
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

const getDiagnosis = async () => {
  try {
    const res = await axios.get(`/GetDiagnosis/${application_detail_id}`);
    if (Array.isArray(res.data) && res.data.length > 0) {
      const d = res.data[0];
      setDiagnosis(d.detail_diagnosis || "");
      setdiagnosis_Code(d.diagnosis_Code);
      if (d.diagnosis_Code) {
        getLab(d.diagnosis_Code);
        getAppointment(d.diagnosis_Code);
        getRefer(d.diagnosis_Code);
      }
    }
  } catch (err) {
    console.error("Failed to fetch diagnosis data:", err);
  }
};
  const getLab = async (code) => {
  if (!code) return;
  try {
    const res = await axios.get(`/GetLab/${code}`);
    if (Array.isArray(res.data)) {
      const d = res.data[0];
      const tests = (res.data[0]?.lab_test || "")
        .split(",")
        .map(t => t.trim())
        .filter(Boolean);
      setLabTest(tests);
      setLabcode(d.lab_Code);
      setdetail_code(d.detail_code)
    }
  } catch (err) {
    console.error("Failed to fetch laboratory data:", err);
  }
};
const getAppointment = async (code) => {
  if (!code) return;
  try {
    const res = await axios.get(`/GetAppointment/${code}`);
    if (Array.isArray(res.data)) {
      const d = res.data[0];
      setappointment_Code(d.appointment_Code);
      setappointment_reason(d.appointment_reason)
      setappointment_date(d.appointment_date)
    }
  } catch (err) {
    console.error("Failed to fetch appointment data:", err);
  }
};
const getRefer = async (code) => {
  if (!code) return;
  try {
    const res = await axios.get(`/GetRefer/${code}`);
    if (Array.isArray(res.data)) {
      const d = res.data[0];
      setRefCode(d.ref_Code);
      setVitalSign(d.vitalSign);
      setPhysicalExamination(d.physicalExamination);
       setReferalReason(d.referalReason);
    }
  } catch (err) {
    console.error("Failed to fetch referal data:", err);
  }
};
  const handleSavejson = async (data) => {
    try {
      setIsSaving(true);
      setMessage("");
      const res = await axios.post("/TaskData", {
        application_number: applicationNumber,
        services_service_code: service_code,
        organization_code: organization_code,
        tasks_task_code: task_code,
        value: JSON.stringify(data),
        UserId: userid,
      });

      if (res.data) {
        setprocessdetailcode(res.data.processDetailCode);
      }
      if (typeof data?.onsave1 === "function") {
        data.onsave1({ completed: true });
      }
      setMessage("Data saved successfully!");
      setIsCompleted(true);
      getLicense(res.data.applicationNumber);
    } catch (error) {
      console.error("❌ Failed to save task data:", error);
      setMessage("Failed to save data.");
    } finally {
      setIsSaving(false);
    }
  };

const handleSavediagnosis = async (data) => {
  try {
    setIsSaving(true);
    setMessage("");

    const payload = {
      application_number: applicationNumber,
      services_service_code: service_code,
      organization_code: organization_code,
      tasks_task_code: task_code,
      diagnosis: data,
      UserId: userid,
      diagnosis_Code: diagnosis_Code || null,
      process_detail_code: application_detail_id || null
    };

    const res = await axios.post("/DiagnosisTaskData", payload);

    if (res.data) {
      // 🔹 set only if returned (important for edit → avoid overwrite)
      if (res.data.processDetailCode) {
        setprocessdetailcode(res.data.processDetailCode);
      }

      if (res.data.diagnosis_Code) {
        setdiagnosis_Code(res.data.diagnosis_Code);
      }
    }

    setMessage(diagnosis_Code ? "Diagnosis updated successfully!" : "Diagnosis saved successfully!");
    setIsCompleted(true);
    getLicense(res.data.applicationNumber);

    return true;
  } catch (error) {
    console.error("❌ Failed to save task data:", error);
    setMessage("Failed to save data.");
    return false;
  } finally {
    setIsSaving(false);
  }
};

  const handleReview = async () => {
    try {
      const res = await axios.get(`/GetTaskDetails`, {
        params: { taskCode: task_code, applicationNumber: applicationNumber },
      });
      if (res.data && res.data.length > 0) {
        openCommonPopup("REVIEW", "Task Review Data", res.data);
      } else {
        setMessage("No data found for this task.");
      }
    } catch (error) {
      console.error("❌ Failed to fetch review data:", error);
       openCommonPopup("MESSAGE", "Error", "Failed to fetch data.");
    }
  };

  const handleReviewPatientHistory = async () => {
    try {
     const res = await axios.get("/Getpatienthistory", {
      params: { customerID: cust_ID }
       });
     setReviewData(res.data);
      openCommonPopup("patientHistory", "Patient History");
    } catch (error) {
      console.error("❌ Failed to fetch patient history:", error);
     openCommonPopup("MESSAGE", "Error", "Failed to fetch patient history.");
    }
  };

const handleLabRequest = async (labTestValue) => {
  try {
    setIsSaving(true);
    setMessage("");

    const payload = {
      application_number: applicationNumber,
      organization_code: organization_code,
      UserId: userid,
      tasks_task_code: task_code,
      lab_Code: lab_Code || null,
      detail_code: detail_code || null, 
      lab_test: labTestValue,
      diagnosisCode: diagnosis_Code
    };

    const res = await axios.post("/Labrequest", payload);

    // Optional: update labTests state if API returns lab_test
    if (res.data?.lab_test) {
      const tests = res.data.lab_test
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      setLabTest(tests);
    }

    setMessage(lab_Code ? "Lab request updated successfully!" : "Lab request saved successfully!");
    openCommonPopup(
      "MESSAGE",
      "Task Status",
      lab_Code 
      ?"✅ Lab request Updated successfully. Note: The result appears in patient history, please wait until the lab technician completes the test!"
      :"✅ Lab request Saved successfully. Note: The result appears in patient history, please wait until the lab technician completes the test!"
    );

    return true;
  } catch (error) {
    console.error("❌ Failed to save lab request:", error);
    setMessage("Failed to save lab request.");
    openCommonPopup("MESSAGE", "Error", "❌ Failed to save lab request.");
    return false;
  } finally {
    setIsSaving(false);
  }
};

  const handleAppointment = async (appointmentReason, appointmentDate) => {
  try {
    setIsSaving(true);
    setMessage("");

    const payload = {
      UserId: userid,
      diagnosisCode: diagnosis_Code,
      appointment_Code: appointmentCode || null,   
      appointment_reason: appointmentReason,
      appointment_date: appointmentDate
    };

    const res = await axios.post("/SetAppointment", payload);

    // Optional: if backend returns updated appointment info
    if (res.data?.appointment_reason) {
      setappointment_reason(res.data.appointment_reason);
    }

    if (res.data?.appointment_date) {
      setappointment_date(res.data.appointment_date);
    }

    if (res.data?.appointment_Code) {
      setappointment_Code(res.data.appointment_Code);
    }

    setMessage(
      appointmentCode
        ? "Appointment updated successfully!"
        : "Appointment saved successfully!"
    );
   openCommonPopup(
  "MESSAGE",
  "Task Status",
  appointmentCode
    ? "✅ Appointment updated successfully."
    : "✅ Appointment saved successfully."
);
    return true;

  } catch (error) {
    console.error("❌ Failed to save appointment:", error);
    setMessage("Failed to save appointment.");
    openCommonPopup("MESSAGE", "Error", "❌ Failed to save appointment.");
    return false;

  } finally {
    setIsSaving(false);
  }
};
const handleRefer = async () => {
  try {
    const payload = {
      refCode: refCode || null,
      diagnosisCode: diagnosis_Code,
      UserId: userid,
      vitalSign: vitalsign,
      physicalExamination: physicalexamination,
      referalReason: referalreason
    };
    const res = await axios.post("/ReferalData", payload);
    if (res.data?.refCode) {
      setRefCode(res.data.refCode);
    }
    openCommonPopup(
      "MESSAGE",
      "Task Status",
      refCode
        ? "✅ Referal data updated successfully."
        : "✅ Referal data saved successfully."
    );
    return true;
  } catch (error) {
    console.error("❌ Failed to save referal data:", error);
    openCommonPopup("MESSAGE", "Error", "❌ Failed to save referal data.");
    return false;
  }
};

  const handlePriscribe = async () => { 
  try {
    const payload = {
      diagnosisCode: diagnosis_Code,
      UserId: userid,
      RX: RX,
      application_number: applicationNumber,
      todocode: todocode,
      organization_code: organization_code,
      userId: userid,
      ProcessDetailCode: ProcessDetailCode,
      tasks_task_code: task_code
    };
    const res = await axios.post("/Prescribe", payload);
      setMessage("🎉 The task completed successfully!");
      // openCommonPopup("MESSAGE", "Task Status", "🎉 The task completed successfully!");
          navigate("/mytask");
          return true;
    } catch (error) {
      console.error("❌ Failed to save prescription:", error);
      // setMessage("Failed to save prescription.");
      openCommonPopup("MESSAGE", "Error", "❌ Failed to save prescription.");
    }
  };
  const handleActionSelect = async (action) => {
    setSelectedAction(action);
    setSelectedActionCode(action.task_rules_code);
    setAnchorEl(null);

    try {
      const res = await axios.post("/ToDoTask", {
        application_number: applicationNumber,
        todocode: todocode,
        organization_code: organization_code,
        userId: userid,
        ProcessDetailCode: ProcessDetailCode,
        task_rules_code: action.task_rules_code,
      });
      setMessage("🎉 The task completed successfully!");
      navigate("/mytask");
    } catch (error) {
      console.error("❌ Failed to create ToDo:", error);
      setMessage("Could not create ToDo.");
    }
  };
const openLabTestPopup = () => {
  setLabTestInput(""); // clear previous input
  setPopupState({
    open: true,
    type: "LAB_INPUT",
    title: "Lab Test Request",
    data: null,
  });
};
const openAppointmentPopup = () => {
 setAppointmentReason(appointmentreason || "");
  setAppointmentDate(appointmentdate || "");
  setPopupState({
    open: true,
    type: "APPOINTMENT_INPUT",
    title: "Appointment",
    data: null
  });
};
const openReferalPopup = () => {
  setVitalsign(vital_sign || "");
  setPhysicalexamination(physical_examination || "");
  setReferalreason(reason_for_referal || "");
  setPopupState({
    open: true,
    type: "REFERAL_INPUT",
    title: "Referal",
    data: null
  });
};
const openPrescriptionPopup = () => {
  setRX("");
  setPopupState({
    open: true,
    type: "PRESCRIPTION_INPUT",
    title: "Prescription",
    data: null
  });
};
  const handleRequiredActionClick = async (event) => {
    setAnchorEl(event.currentTarget);
    setLoadingActions(true);
    try {
      const res = await axios.get(`/GetActionsByTaskCode`, {
        params: { taskCode: task_code },
      });
      if (Array.isArray(res.data) && res.data.length > 0) {
        setActions(res.data);
      } else {
        setActions([]);
        setMessage("No actions available for this task.");
      }
    } catch (error) {
      console.error("❌ Failed to fetch actions:", error);
    } finally {
      setLoadingActions(false);
    }
  };

  const handleClose = () => setAnchorEl(null);
  const handlePendClose = () => navigate("/mytask");
const handleAccordionChange = (panel) => (event, isExpanded) => {
 setExpanded(isExpanded ? panel : false);
};
  const renderJson = (jsonString) => {
    try {
      const surveyJson = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
      // Extract answers logic (simplified for brevity based on your code)
      const answers = {};
      surveyJson.pages?.forEach((page) => {
        page.elements?.forEach((el) => {
          if (el.name && el.hasOwnProperty("value")) {
            answers[el.name] = el.value;
          }
        });
      });

      const surveyModel = new Model(surveyJson);
      surveyModel.showNavigationButtons = false;
      surveyModel.showCompletedPage = false;
      surveyModel.mode = "display"; 
      surveyModel.data = answers;

      return <SurveyReact.Survey model={surveyModel} />;
    } catch (err) {
      console.error("Failed to render survey:", err);
      return <Typography variant="body2">Invalid Data Format</Typography>;
    }
  };

  return (
    <Box
      sx={{
        width: "97%",
        p: 2,
        display: "flex",
        flexDirection: "column",
        minHeight: "92vh",
        background: "linear-gradient(180deg, #f8f9fb 0%, #eef3f8 100%)",
      }}
    >
      {/* Header */}
      <Paper
        elevation={3}
        sx={{
          p: 0.8,
          mb: 1.5,
          borderRadius: 2,
          background: "linear-gradient(135deg, #1976d2 20%, #42a5f5 90%)",
          color: "white",
          boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            Application Number: <span style={{ fontWeight: 600 }}>{applicationNumber || "—"}</span>
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            Service Name: <span style={{ fontWeight: 600 }}>{serviceName || "—"}</span>
          </Typography>
        </Box>
      </Paper>

      {message && <div className="alert alert-info">{message}</div>}

      <Box sx={{ mt: 3, flex: 1 }}>
        {(() => {
          if (code === "F178E9EA-D0DF-41B7-A24A-836ECD79505C") {
            return <Diagnosis application_number={application_number} Diagnosis={diagnosis} diagnosisCode={diagnosis_Code}
            onSave={handleSavediagnosis} />;
          } else if(code === "5FF766C5-E596-4BF0-AF8F-BD015C03C103"){
            return <LabTest application_number={application_number} todocode={todocode} diagnosisCode={diagnosis_Code}/>
          }else if(code === "5DABA599-80ED-42EA-B559-40443C02486A"){
            return <Dispanse application_number={application_number} todocode={todocode} />
          } else if(code === "97045723-453F-471D-8190-B59A636855C8"){
            return <Medical_Certificate userId={userid} application_number={application_number} todocode={todocode}/>
          }
          else{
            return (
              <Survey
                formCode={meta_data_forms_form_code}
                onsave1={(formData) => handleSavejson(formData)}
                detailId={application_detail_id}
              />
            );
          }
        })()}
      </Box>

      {/* Footer Buttons */}
      <Paper
        elevation={5}
        sx={{
          mt: 3,
          py: 0.8,
          px: 1.5,
          borderRadius: 2,
          background: "white",
          boxShadow: "0 -2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <Stack direction="row" spacing={3} justifyContent="center" alignItems="center">
          {(() => {
            const codeUpper = code?.toUpperCase();

            if (codeUpper === "F178E9EA-D0DF-41B7-A24A-836ECD79505C") {
              return (
                <>
                  <Button
                    variant="contained"
                    startIcon={<AssignmentTurnedInIcon />}
                    onClick={handleReviewPatientHistory}
                    sx={{
                      backgroundColor: "#fbc02d",
                      color: "black",
                      textTransform: "none",
                      "&:hover": { backgroundColor: "#f9a825" },
                    }}
                  >
                    Review Patient History
                  </Button>
                  <Button
                  variant="contained"
               startIcon={<CheckCircleIcon />}
          onClick={openLabTestPopup}  // open input popup instead of direct call
           sx={{
    backgroundColor: "#fc6837",
    textTransform: "none",
    "&:hover": { backgroundColor: "#f92525" },
           }}
           disabled={!isCompleted}
            >
             Request Lab Test
                </Button>
                  <Button
       variant="contained"
        startIcon={<CheckCircleIcon />}
                  onClick={openAppointmentPopup}  
              sx={{
                      backgroundColor: "#f52525",
                      textTransform: "none",
                      "&:hover": { backgroundColor: "#d80a0a" },
                    }}
               disabled={!isCompleted}
                  >
                    Appointment
                  </Button>

                  <Button
                    variant="contained"
                    sx={{
                      textTransform: "none",
                      "&:hover": { backgroundColor: "#0a3ad8" },
                    }}
                    startIcon={<CheckCircleIcon />}
                      onClick={openReferalPopup}
                      disabled={!isCompleted}
                  >
                    Refer
                  </Button>
                <Button
                    variant="contained"
                    sx={{
                      backgroundColor: "#07b307",
                      // color: "black",
                      textTransform: "none",
                      "&:hover": { backgroundColor: "#218c01" },
                    }}
                    startIcon={<AssignmentTurnedInIcon />}
                    onClick={openPrescriptionPopup}
                    disabled={!isCompleted}
                  >
                    Prescribe
                  </Button>
                  
                  <Button
                    variant="contained"
                    startIcon={<PendingActionsIcon />}
                    onClick={handlePendClose}
                    sx={{
                      backgroundColor: "#ffb300",
                      color: "black",
                      textTransform: "none",
                      "&:hover": { backgroundColor: "#d8bd0a" },
                    }}
                  >
                    Pend & Close
                  </Button>
                </>
              );
            } else if(code === "5FF766C5-E596-4BF0-AF8F-BD015C03C103" || code === "5DABA599-80ED-42EA-B559-40443C02486A"){
             return (
                <>
                  <Button
                    variant="contained"
                    startIcon={<PendingActionsIcon />}
                    onClick={handlePendClose}
                    sx={{ backgroundColor: "#ffb300", color: "black" }}
                  >
                    Pend & Close
                  </Button>
                </>
              );
            
            }else{
              return (
                <>
                  <Button
                    variant="contained"
                    startIcon={<AssignmentTurnedInIcon />}
                    onClick={handleReview}
                    sx={{ backgroundColor: "#fbc02d", color: "black" }}
                  >
                    Review
                  </Button>

                  <Button
                    variant="contained"
                    startIcon={<CheckCircleIcon />}
                    onClick={handleRequiredActionClick}
                    disabled={!isCompleted}
                  >
                    {loadingActions ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      selectedAction?.decision_rule_en || "Required Action"
                    )}
                  </Button>

                  <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                    {actions.map((action, index) => (
                      <MenuItem key={index} onClick={() => handleActionSelect(action)}>
                        {action.decision_rule_en || "—"}
                      </MenuItem>
                    ))}
                  </Menu>

                  <Button
                    variant="contained"
                    startIcon={<PendingActionsIcon />}
                    onClick={handlePendClose}
                    sx={{ backgroundColor: "#ffb300", color: "black" }}
                  >
                    Pend & Close
                  </Button>
                </>
              );
            }
          })()}
        </Stack>
      </Paper>

      {/* --- SINGLE COMMON POPUP --- */}
      <Dialog 
  open={popupState.open} 
  onClose={handleClosePopup} 
  fullWidth
  maxWidth={false}
  PaperProps={{
    sx: {
      width:
        popupState.type === "patientHistory" || "REVIEW"
          ? "85vw"
          : "600px",
      maxWidth: "850px",
      maxHeight: "550px"
        },
          }}
         >

        <DialogTitle
          sx={{
            backgroundColor: popupState.type === "MESSAGE" && popupState.title === "Error" ? "#d32f2f" : "#1976d2", // Red for error, Blue for others
            color: "white",
            fontWeight: "bold",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {popupState.title}
          <IconButton onClick={handleClosePopup} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            backgroundColor: "#f5f5f5",
            maxHeight: "60vh",
            overflowY: "auto",
            p: 3,
          }}
        >
          {/* Conditional Rendering based on Type */}
          
          {/* Case 1: REVIEW (Renders JSON Forms) */}
          {popupState.type === "REVIEW" && (
             <>
               {Array.isArray(popupState.data) && popupState.data.length > 0 ? (
                 popupState.data.map((item, i) => (
                   <Paper
                     key={i}
                     sx={{
                       mb: 2,
                       p: 2,
                       borderRadius: 1,
                       backgroundColor: "#ffffff",
                       boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                     }}
                   >
                     {renderJson(item.formJson || item.value)}
                   </Paper>
                 ))
               ) : (
                 <Typography>No details available to display.</Typography>
               )}
             </>
          )}

          {/* Case 2: MESSAGE (Renders Text) */}
          {popupState.type === "MESSAGE" && (
            <Typography sx={{ fontSize: 16, textAlign: "center", mt: 2 }}>
              {popupState.data}
            </Typography>
          )}
     {popupState.type === "patientHistory" && (
     reviewData && reviewData.length > 0 ? (
    <Stack spacing={2}>
      {reviewData.map((item, index) => {
        const panelId = `panel-${index}`;

        return (
          <Accordion
            key={index}
            expanded={expanded === panelId}
            onChange={handleAccordionChange(panelId)}
            sx={{ borderRadius: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight="bold">
                Diagnosis {reviewData.length - index} –{" "}
                {item.created_date
                  ? new Date(item.created_date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : ""}
              </Typography>
            </AccordionSummary>

            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Diagnosis
                  </Typography>
                  <Typography>{item.detail_diagnosis || "—"}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Doctor
                  </Typography>
                  <Typography>
                    {item.doctor_FirstName} {item.doctor_LastName}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                   Diagnosis Date
                  </Typography>
                  <Typography>
                    {item.created_date}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Lab Technician
                  </Typography>
                  <Typography>
                    {item.labTechnician_FirstName
                      ? `${item.labTechnician_FirstName} ${item.labTechnician_LastName}`
                      : "Not assigned"}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Lab Test
                  </Typography>
                  <Typography>{item.lab_test || "—"}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Lab Result
                  </Typography>
                  <Typography>{item.lab_result || "—"}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Treatment Given
                  </Typography>
                  <Typography>{item.rx || "—"}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Appointment
                  </Typography>
                  <Typography>
                    {item.appointment_reason || "—"}
                    {item.appointment_date
                      ? ` (${item.appointment_date})`
                      : ""}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Reason For Referral
                  </Typography>
                  <Typography>
                    {item.reason_for_referal || "—"}
                  </Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Stack>
  ) : (
    <Typography>No patient history found.</Typography>
  )
)}
  {/* Case 4: INPUT (for Lab Test) */}
{popupState.type === "LAB_INPUT" && (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <TextField
      label="Enter Your Lab Request In comma Separated Format (Test1, Test2, ...)"
      variant="outlined"
      fullWidth
     value={labTestInput || labTests.join(", ")}
      onChange={(e) => setLabTestInput(e.target.value)}
    />
    <Button
     className="actionBtn saveBtn"
      variant="contained"
       color="primary"
       sx={{
    fontSize: "0.8rem",      
    padding: "4px 12px",     
    minWidth: "80px",       
    alignSelf: "flex-start", 
  }}
      onClick={() => {
        handleLabRequest(labTestInput.trim() ? labTestInput : labTests.join(", "));
        //  setPopupInput("");  
         handleClosePopup();
      }}
   disabled={
  !(labTestInput?.trim() || (labTests && labTests.length > 0))
}
    >
     💾 Save
    </Button>
    </Box>
      )}
       {/* Case 5: INPUT (Appointment) */}
  {popupState.type === "APPOINTMENT_INPUT" && (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
         <TextField
      label="Appointment Reason"
      fullWidth
      value={appointmentReason}

      onChange={(e) => setAppointmentReason(e.target.value)}
    />

    <TextField
      type="date"
      label="Appointment Date"
      InputLabelProps={{ shrink: true }}
      fullWidth
      value={appointmentDate}

      onChange={(e) => setAppointmentDate(e.target.value)}
    />
    <Button
    className="actionBtn saveBtn"
      variant="contained"
       color="primary"
       sx={{
    fontSize: "0.8rem",      
    padding: "4px 12px",     
    minWidth: "80px",       
    alignSelf: "flex-start", 
  }}
      onClick={() => {
        //  handleLabRequest(labTestInput.trim() ? labTestInput : labTests.join(", "));
        handleAppointment(appointmentReason, appointmentDate)
        handleClosePopup();
      }}
      disabled={!appointmentReason.trim() || !appointmentDate}
    >
      💾 Save
    </Button>
    </Box>
      )}
         {/* Case 6: INPUT (Referal) */}
  {popupState.type === "REFERAL_INPUT" && (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
         <TextField
      label="Vital Sign"
      fullWidth
      value={vitalsign}
      onChange={(e) => setVitalsign(e.target.value)}
    />
    <TextField
      label="Physical Examination"
      fullWidth
      value={physicalexamination}
      onChange={(e) => setPhysicalexamination(e.target.value)}
    />
        <TextField
      label="Reason For Referal"
      fullWidth
      value={referalreason}
      onChange={(e) => setReferalreason(e.target.value)}
    />
    <Button
    // className="actionBtn saveBtn"
      className="actionBtn saveBtn"
      variant="contained"
       color="primary"
       sx={{
    fontSize: "0.8rem",      
    padding: "4px 12px",     
    minWidth: "80px",       
    alignSelf: "flex-start", 
  }}
      onClick={() => {
        handleRefer(vitalsign, physicalexamination, referalreason);
        handleClosePopup();
      }}
      disabled={!vitalsign.trim() || !physicalexamination || !referalreason}
    >
    💾 Save
    </Button>
    </Box>
      )}
  {/* Case 7: INPUT (Prescription) */}
  {popupState.type === "PRESCRIPTION_INPUT" && (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <TextField
      label="RX"
      fullWidth
      value={RX}
      onChange={(e) => setRX(e.target.value)}
    />
    <Button
      className="actionBtn saveBtn"
      variant="contained"
       color="primary"
       sx={{
    fontSize: "0.8rem",      
    padding: "4px 12px",     
    minWidth: "80px",       
    alignSelf: "flex-start", 
  }}
      onClick={() => {
        handlePriscribe(RX);
        handleClosePopup();
      }}
      disabled={!RX}
    >
    Submit
    </Button>
    </Box>
      )}
        </DialogContent>
        <DialogActions sx={{ backgroundColor: "#f5f5f5" }}>
          <Button onClick={handleClosePopup} variant="contained" sx={{ fontWeight: "bold" }}>
            {popupState.type === "MESSAGE" ? "OK" : "Close"}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default Main;