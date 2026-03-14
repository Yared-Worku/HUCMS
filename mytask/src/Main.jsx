import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,Button,Paper,Typography,Stack,Menu,MenuItem,CircularProgress,Dialog,DialogTitle,DialogContent,DialogActions,
  IconButton,Grid, TextField,Accordion,AccordionSummary,AccordionDetails,Divider,Avatar,Chip,Fade,Alert, AlertTitle,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  InsertDriveFile as FileIcon, 
  CheckCircle as SuccessIcon
} from '@mui/icons-material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PaymentsIcon from '@mui/icons-material/Payments';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonIcon from '@mui/icons-material/Person';
import MedicationIcon from '@mui/icons-material/Medication';
import NoPhotographyIcon from '@mui/icons-material/NoPhotography';
import InboxIcon from '@mui/icons-material/Inbox';
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
import Payment_Refund_CH from "./Payment_Refund/Refund_Validation_CH";
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import Validation_Finance from "./Payment_Refund/Validation_Finance";

const Main = () => {
  const { application_number,service_code,task_code,organization_code,todocode,application_detail_id,meta_data_forms_form_code,} = useParams();

  // const Username = "kira12";
const Username = window.__DNN_USER__?.username ?? "Guest";

  const navigate = useNavigate();
  const code = meta_data_forms_form_code.toUpperCase();
  const [applicationNumber, setApplicationNumber] = useState(null);
  const [ProcessDetailCode, setprocessdetailcode] = useState(null);
  const [diagnosis_Code, setdiagnosis_Code] = useState(null);
  const [pr_Code, setpr_Code] = useState(null);
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
    const [expandedIndex, setExpandedIndex] = React.useState(null);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [backendMessage, setBackendMessage] = useState("");
    const [popupState, setPopupState] = useState({
    open: false,
    type: "MESSAGE", 
    title: "",
    data: null, 
  });

  useEffect(() => {
    getLicense(application_number);
    fetchuserid();
    getDiagnosis();
if (todocode) {
      fetchMessage(todocode);
    }
  }, [todocode]);

  const openCommonPopup = (type, title, data) => {
    setPopupState({
      open: true,
      type: type, 
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
        ProcessDetailCode: application_detail_id,
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
const handleSaveCHRefundData = async (data) => {
  try {
    setIsSaving(true);
    setMessage("");

    const payload = {
      application_number: applicationNumber,
      services_service_code: service_code,
      tasks_task_code: task_code,
      amount_inDigit: data.amountInDigit,
      amount_inWord: data.amountInWord,
      UserId: userid,
      process_detail_code: application_detail_id || null,
    };

    const res = await axios.post("/CHRefundTaskData", payload);

    if (res.data) {
      if (res.data.processDetailCode) {
        setprocessdetailcode(res.data.processDetailCode);
      }
      
      if (res.data.pr_Code) {
        setpr_Code(res.data.pr_Code);
      }

      if (res.data.pr_Code) {
        setMessage("Payment refund updated successfully!");
      } else {
        setMessage("Payment refund saved successfully!");
      }

      setIsCompleted(true);
      getLicense(res.data.applicationNumber || applicationNumber);
      return true;
    }

    return false;
  } catch (error) {
    console.error("❌ Failed to save task data:", error);
    setMessage("Failed to save data.");
    return false;
  } finally {
    setIsSaving(false);
  }
};
    const handleReviewCh = async () => {
    try {
      const res = await axios.get(`/getReviewCH/${todocode}`,{
       params: { 
          pr_Codefromquery: pr_Code 
        }
    });
      if (res.data && res.data.length > 0) {
        openCommonPopup("REVIEWCH", "Task Review", res.data);
      } else {
         openCommonPopup("MESSAGE", "Error", "No data found to review for this task.");
      }
    } catch (error) {
      console.error("❌ Failed to fetch review data:", error);
       openCommonPopup("MESSAGE", "Error", "Failed to fetch data.");
    }
  };

  const handleReviewSSD = async () => {
  try {
    const [chResponse, ssdResponse] = await Promise.all([
      axios.get(`/getReviewCh/${todocode}`), 
      axios.get(`/getReviewSSD/${todocode}`, {
        params: { pr_Codefromquery: pr_Code }
      })
    ]);
    const reviewData = {
      prescriptions: chResponse.data || [], 
      amounts: ssdResponse.data || []    
    };
    if (reviewData.prescriptions.length > 0 || reviewData.amounts.length > 0) {
      openCommonPopup("REVIEWSSD", "Task Review", reviewData);
    } else {
      openCommonPopup("MESSAGE", "Error", "No data found to review for this task.");
    }

  } catch (error) {
    console.error("❌ Failed to fetch combined review data:", error);
    openCommonPopup("MESSAGE", "Error", "Failed to fetch data.");
  }
};

  const handleReviewMD = async () => {
  try {
    const [chResponse, ssdResponse, taskResponse] = await Promise.all([
      axios.get(`/getReviewCh/${todocode}`),
      axios.get(`/getReviewSSD/${todocode}`, {
        params: { pr_Codefromquery: pr_Code }
      }),
      axios.get(`/GetTaskDetails/${todocode}`)
    ]);

    const reviewData = {
      prescriptions: chResponse.data || [],
      amounts: ssdResponse.data || [],
      taskDetails: taskResponse.data || [] 
    };

    if (reviewData.prescriptions.length > 0 
      || reviewData.amounts.length > 0 
      || reviewData.taskDetails.length > 0) {
      openCommonPopup("REVIEWMD", "Task Review", reviewData);
    } else {
      openCommonPopup("MESSAGE", "Error", "No data found to review.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch combined review data:", error);
    openCommonPopup("MESSAGE", "Error", "Failed to fetch data.");
  }
};

const handleReview = async () => {
  try {
    const [chResponse, ssdResponse, taskResponse, MDtaskResponse] = await Promise.all([
      axios.get(`/getReviewCh/${todocode}`),
      axios.get(`/getReviewSSD/${todocode}`, {
        params: { pr_Codefromquery: pr_Code }
      }),
      axios.get(`/GetTaskDetails/${todocode}`),
      axios.get(`/GetTaskDetailsMD/${todocode}`)
    ]);

    const reviewData = {
      prescriptions: chResponse.data || [],
      amounts: ssdResponse.data || [],
      taskDetails: taskResponse.data || [],
      taskDetailsMD: MDtaskResponse.data || [] 
    };

    if (reviewData.prescriptions.length > 0 
      || reviewData.amounts.length > 0 
      || reviewData.taskDetails.length > 0
      || reviewData.taskDetailsMD.length > 0) {
      openCommonPopup("REVIEW", "Task Review", reviewData);
    } else {
      openCommonPopup("MESSAGE", "Error", "No data found to review.");
    }
  } catch (error) {
    console.error("❌ Failed to fetch combined review data:", error);
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
      referalReason: referalreason,
      todocode: todocode,
      application_number: application_number,
      processDetailCode: application_detail_id
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
    navigate("/mytask");
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
  setAnchorEl(null);
  // const REJECT_RULE_CODE = "6c9145ad-43e8-42a1-84ad-f17553735465"; 
  if (action.task_rules_code?.toLowerCase() === "6c9145ad-43e8-42a1-84ad-f17553735465".toLowerCase() 
    || action.task_rules_code?.toLowerCase() === "c309ecb9-02ca-4582-9455-0da40192ccb7".toLowerCase()
    || action.task_rules_code?.toLowerCase() === "9c9c3d57-2bf9-426b-9172-c958f64cf0f3".toLowerCase()) {
    openCommonPopup("REJECTION_REASON", "Provide Rejection Reason", action);
  } else {
    await executeTaskAction(action.task_rules_code);
  }
};
const executeTaskAction = async (ruleCode, reason = "") => {
  try {
    const res = await axios.post("/ToDoTask", {
      application_number: applicationNumber,
      todocode: todocode,
      organization_code: organization_code,
      userId: userid,
      ProcessDetailCode: application_detail_id,
      task_rules_code: ruleCode,
      rejection_reason: reason, 
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
      // debugger
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
const fetchMessage = async (todo) => {
    try {
      // debugger
      const res = await axios.get(`/GetMessage/${todo}`);
      const msg = typeof res.data === 'string' ? res.data : res.data.message;
      setBackendMessage(msg);
    } catch (err) {
      console.error("Failed to fetch message:", err);
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
const getClickHandler = () => {
  if (code === "F0FA6F1E-0BD4-41AC-A05D-BB44A8B79EA4") return handleReviewCh;
  if (code === "E9760B40-AA42-4D42-A5F9-B6AB296D6C2B") return handleReviewSSD;
  if (code === "A3166A71-E269-4B8C-88E3-7A703ECED02D") return handleReviewMD;
  return handleReview;
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
 {backendMessage && (
    <Box sx={{ flex: 1 }}>
      <Fade in={true}>
        <Alert 
          severity="info" 
          sx={{ 
            borderRadius: 2, 
            borderLeft: '5px solid #0288d1',
            minHeight: '68px', 
            display: 'flex',
            alignItems: 'center'
          }}
          onClose={() => setBackendMessage("")}
        >
          <Box>
      <AlertTitle sx={{ m: 0, lineHeight: 1, fontWeight: 'bold', color: '#d32f2f' }}> Reviewer Comments:</AlertTitle>
     <Typography variant="body2" sx={{ mt: 0.5 }}>{backendMessage}</Typography>
          </Box>
        </Alert>
      </Fade>
    </Box>
  )}
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
          else if(code === "F0FA6F1E-0BD4-41AC-A05D-BB44A8B79EA4"){
              return <Payment_Refund_CH application_number={application_number} ProcessDetailCode ={application_detail_id}
               onSave={handleSaveCHRefundData} pr_Code ={pr_Code} onpr_Code={(pr_Code) => setpr_Code(pr_Code)}/>
          }else if(code === "ABB5C239-17B0-4743-A9DE-36F5FB485D19"){
             return <Validation_Finance application_number={application_number} todocode={todocode} ProcessDetailCode ={application_detail_id}
              taskcode = {task_code} onSaveComplete = {() => setIsCompleted(true)}/>
          }else{
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
          onClick={openLabTestPopup}  
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
            } else if(code === "5FF766C5-E596-4BF0-AF8F-BD015C03C103" 
              || code === "5DABA599-80ED-42EA-B559-40443C02486A" 
              || code === "97045723-453F-471D-8190-B59A636855C8"){
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
    {/* Conditional Review Button */}
<Button
  variant="contained"
  startIcon={<AssignmentTurnedInIcon />}
  onClick={getClickHandler()}
  sx={{ backgroundColor: "#fbc02d", color: "black" }}
>
  Review
</Button>
{/* Required Action Button */}
    <Button
      variant="contained"
      startIcon={<CheckCircleIcon sx={{ fontSize: '1.2rem' }} />}
      onClick={handleRequiredActionClick}
      disabled={!isCompleted}
      disableElevation 
      sx={{
        borderRadius: '12px', // More modern rounded corners
        px: 4,
        py: 1.2,
        textTransform: "none", 
        fontWeight: 700,
        fontSize: '0.9rem',
        background: "linear-gradient(135deg, #0b5c8e 0%, #157cb8 100%)", // Rich depth gradient
        boxShadow: "0 4px 12px rgba(11, 92, 142, 0.25)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-2px)", 
          boxShadow: "0 6px 16px rgba(11, 92, 142, 0.35)",
          background: "linear-gradient(135deg, #094a73 0%, #0b5c8e 100%)",
        },
        "&:active": {
          transform: "translateY(0)",
        },
        "&:disabled": {
          backgroundColor: "#f1f5f9",
          color: "#94a3b8",
          boxShadow: "none",
        }
      }}
    >
      {loadingActions ? (
        <CircularProgress size={20} color="inherit" />
      ) : (
        selectedAction?.decision_rule_en || "Required Action"
      )}
    </Button>

    {/* Menu Component */}
    <Menu 
      anchorEl={anchorEl} 
      open={Boolean(anchorEl)} 
      onClose={handleClose}
      transformOrigin={{ horizontal: "center", vertical: "top" }}
      anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
      PaperProps={{
        sx: {
          mt: 1.5, 
          minWidth: 260, 
          borderRadius: "18px", 
          backgroundColor: "rgba(255, 255, 255, 0.85)", 
          backdropFilter: "blur(12px)", 
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: "0px 20px 40px rgba(0, 0, 0, 0.1)", 
          border: "1px solid rgba(255, 255, 255, 0.6)",
          p: 1, 
          overflow: "hidden",
        }
      }}
    >
      {actions.map((action, index) => {
        const isSelected = selectedAction?.decision_rule_en === action.decision_rule_en;
        
        return (
          <MenuItem 
            key={index} 
            onClick={() => handleActionSelect(action)}
            selected={isSelected}
            sx={{
              borderRadius: "10px", 
              mb: 0.5,
              py: 1.5,
              px: 2,
              fontSize: "0.92rem",
              fontWeight: isSelected ? 700 : 500,
              color: isSelected ? "#0b5c8e" : "#475569",
              transition: "all 0.2s ease",
              "&:last-child": { mb: 0 },
              "&:hover": {
                backgroundColor: "rgba(11, 92, 142, 0.05)",
                color: "#0b5c8e",
                transform: "translateX(4px)",
              },
              "&.Mui-selected": {
                backgroundColor: "rgba(11, 92, 142, 0.08)", 
                color: "#0b5c8e",
                "&:hover": {
                  backgroundColor: "rgba(11, 92, 142, 0.12)",
                }
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
               {action.decision_rule_en || "—"}
               {isSelected && <CheckCircleIcon sx={{ fontSize: '1.1rem', ml: 1, opacity: 0.8 }} />}
            </Box>
          </MenuItem>
        );
      })}
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
    {/* Case 1: REVIEW (FINANCE HEAD) */}
   {popupState.type === "REVIEW" && (
  <Box sx={{ mt: 2, px: 1 }}>
    {popupState.data ? (
      <>
            {/* --- SECTION -1: APPLICATION DETAILS MANAGING DEAN (INTEGRATED JSON FORMS) --- */}
        <Accordion sx={{ mb: 2, borderRadius: 2, '&:before': { display: 'none' }, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: "#fafafa", borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#7b1fa2", display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssignmentIcon fontSize="small" /> Task completed by the managinging dean officer
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 2, bgcolor: "#f3e5f533" }}>
            {Array.isArray(popupState.data.taskDetails) && popupState.data.taskDetails.length > 0 ? (
              popupState.data.taskDetails.map((item, i) => (
                <Paper
                  key={i}
                  sx={{
                    mb: 2,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: "#ffffff",
                    border: "1px solid #e1bee7",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                  }}
                >
                  {renderJson(item.formJson || item.value)}
                </Paper>
              ))
            ) : (
              <Typography sx={{ py: 2, textAlign: 'center', color: 'text.secondary' }}>No form details found.</Typography>
            )}
          </AccordionDetails>
        </Accordion>
      {/* --- SECTION 0: APPLICATION DETAILS (INTEGRATED JSON FORMS) --- */}
        <Accordion sx={{ mb: 2, borderRadius: 2, '&:before': { display: 'none' }, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: "#fafafa", borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#7b1fa2", display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssignmentIcon fontSize="small" /> Task completed by the students dean officer
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 2, bgcolor: "#f3e5f533" }}>
            {Array.isArray(popupState.data.taskDetailsMD) && popupState.data.taskDetailsMD.length > 0 ? (
              popupState.data.taskDetailsMD.map((item, i) => (
                <Paper
                  key={i}
                  sx={{
                    mb: 2,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: "#ffffff",
                    border: "1px solid #e1bee7",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                  }}
                >
                  {renderJson(item.formJson || item.value)}
                </Paper>
              ))
            ) : (
              <Typography sx={{ py: 2, textAlign: 'center', color: 'text.secondary' }}>No form details found.</Typography>
            )}
          </AccordionDetails>
        </Accordion>
        {/* --- SECTION 1: FINANCIAL DETAILS  --- */}
        <Accordion sx={{mb: 2, borderRadius: 2, '&:before': { display: 'none' }, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: "#fafafa", borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#388e3c", display: 'flex', alignItems: 'center', gap: 1 }}>
              <PaymentsIcon fontSize="small" /> Task completed by the clinic head officer
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 3 }}>
            {Array.isArray(popupState.data.amounts) && popupState.data.amounts.length > 0 ? (
              popupState.data.amounts.map((amt, idx) => (
                <Paper key={idx} elevation={0} sx={{ p: 3, mb: 2, border: "1px solid #f0f0f0", borderRadius: 3, bgcolor: "#f1f8e9" }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="textSecondary" display="block" sx={{ fontWeight: 800 }}>AMOUNT (IN DIGIT)</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: "#2e7d32" }}>
                        {amt.amount_indigit} {"ETB"}
                      </Typography>
                    </Grid>
                    <Grid marginLeft='20px' item xs={12} sm={8}>
                      <Typography variant="caption" color="textSecondary" display="block" sx={{ fontWeight: 800 }}>AMOUNT (IN WORD)</Typography>
                      <Typography variant="h6" sx={{ textTransform: "capitalize", color: "#5d4037", fontStyle: 'italic' }}>
                        {amt.amount_inword}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              ))
            ) : (
              <Typography sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>No financial data found.</Typography>
            )}
          </AccordionDetails>
        </Accordion>
        {/* --- SECTION 2: PRESCRIPTION DETAILS --- */}
        <Accordion  sx={{ mb: 2, borderRadius: 2, '&:before': { display: 'none' }, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: "#fafafa", borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1976d2", display: 'flex', alignItems: 'center', gap: 1 }}>
              <MedicationIcon fontSize="small" /> The completed tasks to start the application
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 3 }}>
            {Array.isArray(popupState.data.prescriptions) && popupState.data.prescriptions.length > 0 ? (
              popupState.data.prescriptions.map((item, i) => {
                const isExpanded = expandedIndex === i;
                return (
                  <Paper
                    key={i}
                    elevation={0}
                    sx={{
                      mb: 4,
                      borderRadius: 4,
                      overflow: "hidden",
                      border: "1px solid #f0f0f0",
                      boxShadow: isExpanded ? "0 20px 50px rgba(0,0,0,0.15)" : "0 10px 30px rgba(0,0,0,0.04)",
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    <Grid container>
                      {!isExpanded && (
                        <Grid item xs={12} md={7} sx={{ p: 4 }}>
                          <Stack spacing={3}>
                            <Box>
                              <Typography variant="overline" sx={{ color: "#fbc02d", fontWeight: 800, letterSpacing: 1.2 }}>
                                Detail Review
                              </Typography>
                              <Grid container sx={{ mt: 1 }}>
                                <Grid item xs={6}>
                                  <Typography variant="caption" color="textSecondary" display="block">Prescribed Medicine </Typography>
                                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{item.rx}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography marginLeft='30px' variant="caption" color="textSecondary" display="block">QUANTITY</Typography>
                                  <Typography marginLeft='30px' variant="h6" sx={{ fontWeight: 700 }}>{item.quantity}</Typography>
                                </Grid>
                              </Grid>
                            </Box>
                            <Divider />
                            <Box>
                              <Typography variant="overline" color="textSecondary" sx={{ fontWeight: 700 }}>
                                Prescription Detail
                              </Typography>
                              <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Avatar sx={{ bgcolor: "#e3f2fd", color: "#1976d2", width: 32, height: 32 }}>
                                    <PersonIcon fontSize="small" />
                                  </Avatar>
                                  <Box>
                                    <Typography variant="caption" color="textSecondary" display="block">Priscriber</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{"Dr."} {item.doctorFname} {item.doctorLname}</Typography>
                                  </Box>
                                </Stack>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Avatar sx={{ bgcolor: "#f1f8e9", color: "#388e3c", width: 32, height: 32 }}>
                                    <MedicationIcon fontSize="small" />
                                  </Avatar>
                                  <Box>
                                    <Typography variant="caption" color="textSecondary" display="block">Druggist</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.drugistFname} {item.drugistLname}</Typography>
                                  </Box>
                                </Stack>
                              </Stack>
                            </Box>
                            <Box sx={{ p: 2, borderRadius: 2, bgcolor: "#fffde7", border: "1px solid #fff59d" }}>
                              <Typography variant="caption" sx={{ fontWeight: 800, color: "#fbc02d", display: 'block' }}>REMARK</Typography>
                              <Typography variant="body2" sx={{ color: "#5d4037" }}>{item.remark || "N/A"}</Typography>
                            </Box>
                          </Stack>
                        </Grid>
                      )}
                      <Grid item xs={12} md={isExpanded ? 12 : 5} sx={{ p: isExpanded ? 0 : 2, bgcolor: "#fafafa", transition: "all 0.4s ease-in-out", display: 'flex', flexDirection: 'column', alignItems: 'center', borderLeft: isExpanded ? "none" : "1px solid #f0f0f0", position: 'relative' }}>
                        {!isExpanded && (
                          <Box sx={{ width: '100%', mb: 1, px: 1, borderBottom: '1px solid #e0e0e0', pb: 0.5 }}>
                            <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary', letterSpacing: 1.2, display: 'flex', alignItems: 'center', gap: 1 }}>
                              <FileIcon sx={{ fontSize: 16 }} /> Uploaded Receipt
                            </Typography>
                          </Box>
                        )}
                        {item.file ? (
                          <Box sx={{ width: '100%', textAlign: 'center', position: 'relative' }}>
                            <Box component="img" src={item.file} onClick={() => setExpandedIndex(isExpanded ? null : i)} sx={{ width: '100%', maxHeight: isExpanded ? '80vh' : '300px', minHeight: isExpanded ? '500px' : 'auto', objectFit: isExpanded ? 'contain' : 'cover', borderRadius: isExpanded ? 0 : 2, cursor: isExpanded ? 'zoom-out' : 'zoom-in', transition: "all 0.4s ease", boxShadow: isExpanded ? 'none' : '0px 2px 8px rgba(0,0,0,0.1)', backgroundColor: isExpanded ? "#000" : "transparent" }} />
                            <IconButton onClick={() => setExpandedIndex(isExpanded ? null : i)} sx={{ position: 'absolute', top: 10, right: 10, color: isExpanded ? '#fff' : '#1976d2', bgcolor: isExpanded ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)', '&:hover': { transform: "scale(1.1)", bgcolor: isExpanded ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.9)' } }}>
                              {isExpanded ? <CloseIcon sx={{ fontSize: 32 }} /> : <FullscreenIcon sx={{ fontSize: 25 }} />}
                            </IconButton>
                          </Box>
                        ) : (
                          <Stack alignItems="center" spacing={1} sx={{ opacity: 0.3, py: 10 }}>
                            <NoPhotographyIcon sx={{ fontSize: 48 }} />
                            <Typography variant="caption">Image Missing</Typography>
                          </Stack>
                        )}
                      </Grid>
                    </Grid>
                  </Paper>
                );
              })
            ) : (
              <Typography sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>No prescription records found.</Typography>
            )}
          </AccordionDetails>
        </Accordion>

      </>
    ) : (
      <Typography sx={{ py: 10, textAlign: 'center' }}>No review data.</Typography>
    )}
  </Box>
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
{/* Case 8: REVIEW (Clinic Head) */}
{popupState.type === "REVIEWCH" && (
  <Box sx={{ mt: 2, px: 1 }}>
    {Array.isArray(popupState.data) && popupState.data.length > 0 ? (
      popupState.data.map((item, i) => {
        const isExpanded = expandedIndex === i;
        
        return (
          <Paper
            key={i}
            elevation={0}
            sx={{
              mb: 4,
              borderRadius: 4,
              overflow: "hidden",
              border: "1px solid #f0f0f0",
              boxShadow: isExpanded ? "0 20px 50px rgba(0,0,0,0.15)" : "0 10px 30px rgba(0,0,0,0.04)",
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <Grid container>
              {!isExpanded && (
                <Grid item xs={12} md={7} sx={{ p: 4 }}>
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="overline" sx={{ color: "#fbc02d", fontWeight: 800, letterSpacing: 1.2 }}>
                        Detail Review
                      </Typography>
                      <Grid container sx={{ mt: 1 }}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="textSecondary" display="block">Prescribed Medicine </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>{item.rx}</Typography>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Typography marginLeft='30px' variant="caption" color="textSecondary" display="block">QUANTITY</Typography>
                          <Typography marginLeft='30px' variant="h6" sx={{ fontWeight: 700 }}>{item.quantity}</Typography>
                        </Grid>
                      </Grid>
                    </Box>

                    <Divider />

                    <Box>
                      <Typography variant="overline" color="textSecondary" sx={{ fontWeight: 700 }}>
                        Prescription Detail
                      </Typography>
                      <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar sx={{ bgcolor: "#e3f2fd", color: "#1976d2", width: 32, height: 32 }}>
                            <PersonIcon fontSize="small" />
                          </Avatar>
                          <Box>
                            <Typography variant="caption" color="textSecondary" display="block">Priscriber</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{"Dr."} {item.doctorFname} {item.doctorLname}</Typography>
                          </Box>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar sx={{ bgcolor: "#f1f8e9", color: "#388e3c", width: 32, height: 32 }}>
                            <MedicationIcon fontSize="small" />
                          </Avatar>
                          <Box>
                            <Typography variant="caption" color="textSecondary" display="block">Druggist</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.drugistFname} {item.drugistLname}</Typography>
                          </Box>
                        </Stack>
                      </Stack>
                    </Box>

                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: "#fffde7", border: "1px solid #fff59d" }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: "#fbc02d", display: 'block' }}>REMARK</Typography>
                      <Typography variant="body2" sx={{ color: "#5d4037" }}>{item.remark || "N/A"}</Typography>
                    </Box>
                  </Stack>
                </Grid>
              )}

             <Grid 
         item 
      xs={12} 
      md={isExpanded ? 12 : 5} 
      sx={{ 
    p: isExpanded ? 0 : 2, 
    bgcolor: "#fafafa", 
    transition: "all 0.4s ease-in-out",
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderLeft: isExpanded ? "none" : "1px solid #f0f0f0",
    position: 'relative'
      }}
         >
     {!isExpanded && (
    <Box sx={{ width: '100%', mb: 1, px: 1, borderBottom: '1px solid #e0e0e0', pb: 0.5 }}>
      <Typography 
        variant="overline" 
        sx={{ 
          fontWeight: 'bold', 
          color: 'text.secondary', 
          letterSpacing: 1.2,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <FileIcon sx={{ fontSize: 16 }} /> 
        Uploaded Receipt
      </Typography>
    </Box>
  )}

  {item.file ? (
    <Box sx={{ width: '100%', textAlign: 'center', position: 'relative' }}>
      <Box
        component="img"
        src={item.file}
        onClick={() => setExpandedIndex(isExpanded ? null : i)}
        sx={{
          width: '100%',
          maxHeight: isExpanded ? '80vh' : '300px',
          minHeight: isExpanded ? '500px' : 'auto',
          objectFit: isExpanded ? 'contain' : 'cover',
          borderRadius: isExpanded ? 0 : 2,
          cursor: isExpanded ? 'zoom-out' : 'zoom-in',
          transition: "all 0.4s ease",
          boxShadow: isExpanded ? 'none' : '0px 2px 8px rgba(0,0,0,0.1)',
          backgroundColor: isExpanded ? "#000" : "transparent"
        }}
      />
      <IconButton
        onClick={() => setExpandedIndex(isExpanded ? null : i)}
        sx={{ 
          position: 'absolute', 
          top: 10, 
          right: 10, 
          color: isExpanded ? '#fff' : '#1976d2', 
          bgcolor: isExpanded ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(4px)',
          '&:hover': { 
            transform: "scale(1.1)",
            bgcolor: isExpanded ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.9)' 
          }
        }}
      >
        {isExpanded ? <CloseIcon sx={{ fontSize: 32 }} /> : <FullscreenIcon sx={{ fontSize: 25 }} />}
      </IconButton>
    </Box>
  ) : (
    <Stack alignItems="center" spacing={1} sx={{ opacity: 0.3, py: 10 }}>
      <NoPhotographyIcon sx={{ fontSize: 48 }} />
      <Typography variant="caption">Image Missing</Typography>
    </Stack>
  )}
         </Grid>
            </Grid>
          </Paper>
        );
      })
    ) : (
      <Typography sx={{ py: 10, textAlign: 'center' }}>No review data.</Typography>
    )}
  </Box>
)}
{/* Case 9: REJECTION REASON */}
{popupState.type === "REJECTION_REASON" && (
  <Box sx={{ p: 1 }}>
    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
      Please explain why this task is being rejected. This information will be saved.
    </Typography>
    <TextField
      autoFocus
      fullWidth
      multiline
      rows={2}
      variant="outlined"
      label="Reason"
      value={rejectionReason}
      onChange={(e) => setRejectionReason(e.target.value)}
      sx={{ mb: 2 }}
    />
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
      <Button 
        variant="outlined" 
        onClick={() => setPopupState({ ...popupState, open: false })}
      >
        Cancel
      </Button>
      <Button 
        variant="contained" 
        color="error"
        startIcon={<CheckCircleIcon />}
        disabled={!rejectionReason.trim()}
        onClick={() => {
          executeTaskAction(popupState.data.task_rules_code, rejectionReason);
        }}
      >
        Reject
      </Button>
    </Box>
    </Box>
   )}
   {/* Case 10: REVIEW (STUDENT SERVICE DEAN) */}
{popupState.type === "REVIEWSSD" && (
  <Box sx={{ mt: 2, px: 1 }}>
    {popupState.data ? (
      <>
        {/* --- SECTION 1: FINANCIAL DETAILS  --- */}
        <Accordion sx={{ borderRadius: 2, '&:before': { display: 'none' }, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: "#fafafa", borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#388e3c", display: 'flex', alignItems: 'center', gap: 1 }}>
              <PaymentsIcon fontSize="small" /> Task completed by the clinic head officer
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 3 }}>
            {Array.isArray(popupState.data.amounts) && popupState.data.amounts.length > 0 ? (
              popupState.data.amounts.map((amt, idx) => (
                <Paper key={idx} elevation={0} sx={{ p: 3, mb: 2, border: "1px solid #f0f0f0", borderRadius: 3, bgcolor: "#f1f8e9" }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="textSecondary" display="block" sx={{ fontWeight: 800 }}>AMOUNT (IN DIGIT)</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: "#2e7d32" }}>
                        {amt.amount_indigit} {"ETB"}
                      </Typography>
                    </Grid>
                    <Grid marginLeft='20px' item xs={12} sm={8}>
                      <Typography variant="caption" color="textSecondary" display="block" sx={{ fontWeight: 800 }}>AMOUNT (IN WORD)</Typography>
                      <Typography variant="h6" sx={{ textTransform: "capitalize", color: "#5d4037", fontStyle: 'italic' }}>
                        {amt.amount_inword}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              ))
            ) : (
              <Typography sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>No financial data found.</Typography>
            )}
          </AccordionDetails>
        </Accordion>
        {/* --- SECTION 2: PRESCRIPTION DETAILS --- */}
        <Accordion  sx={{ mb: 2, borderRadius: 2, '&:before': { display: 'none' }, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: "#fafafa", borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1976d2", display: 'flex', alignItems: 'center', gap: 1 }}>
              <MedicationIcon fontSize="small" /> The completed tasks to start the application
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 3 }}>
            {Array.isArray(popupState.data.prescriptions) && popupState.data.prescriptions.length > 0 ? (
              popupState.data.prescriptions.map((item, i) => {
                const isExpanded = expandedIndex === i;
                return (
                  <Paper
                    key={i}
                    elevation={0}
                    sx={{
                      mb: 4,
                      borderRadius: 4,
                      overflow: "hidden",
                      border: "1px solid #f0f0f0",
                      boxShadow: isExpanded ? "0 20px 50px rgba(0,0,0,0.15)" : "0 10px 30px rgba(0,0,0,0.04)",
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    <Grid container>
                      {!isExpanded && (
                        <Grid item xs={12} md={7} sx={{ p: 4 }}>
                          <Stack spacing={3}>
                            <Box>
                              <Typography variant="overline" sx={{ color: "#fbc02d", fontWeight: 800, letterSpacing: 1.2 }}>
                                Detail Review
                              </Typography>
                              <Grid container sx={{ mt: 1 }}>
                                <Grid item xs={6}>
                                  <Typography variant="caption" color="textSecondary" display="block">Prescribed Medicine </Typography>
                                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{item.rx}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography marginLeft='30px' variant="caption" color="textSecondary" display="block">QUANTITY</Typography>
                                  <Typography marginLeft='30px' variant="h6" sx={{ fontWeight: 700 }}>{item.quantity}</Typography>
                                </Grid>
                              </Grid>
                            </Box>
                            <Divider />
                            <Box>
                              <Typography variant="overline" color="textSecondary" sx={{ fontWeight: 700 }}>
                                Prescription Detail
                              </Typography>
                              <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Avatar sx={{ bgcolor: "#e3f2fd", color: "#1976d2", width: 32, height: 32 }}>
                                    <PersonIcon fontSize="small" />
                                  </Avatar>
                                  <Box>
                                    <Typography variant="caption" color="textSecondary" display="block">Priscriber</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{"Dr."} {item.doctorFname} {item.doctorLname}</Typography>
                                  </Box>
                                </Stack>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Avatar sx={{ bgcolor: "#f1f8e9", color: "#388e3c", width: 32, height: 32 }}>
                                    <MedicationIcon fontSize="small" />
                                  </Avatar>
                                  <Box>
                                    <Typography variant="caption" color="textSecondary" display="block">Druggist</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.drugistFname} {item.drugistLname}</Typography>
                                  </Box>
                                </Stack>
                              </Stack>
                            </Box>
                            <Box sx={{ p: 2, borderRadius: 2, bgcolor: "#fffde7", border: "1px solid #fff59d" }}>
                              <Typography variant="caption" sx={{ fontWeight: 800, color: "#fbc02d", display: 'block' }}>REMARK</Typography>
                              <Typography variant="body2" sx={{ color: "#5d4037" }}>{item.remark || "N/A"}</Typography>
                            </Box>
                          </Stack>
                        </Grid>
                      )}
                      <Grid item xs={12} md={isExpanded ? 12 : 5} sx={{ p: isExpanded ? 0 : 2, bgcolor: "#fafafa", transition: "all 0.4s ease-in-out", display: 'flex', flexDirection: 'column', alignItems: 'center', borderLeft: isExpanded ? "none" : "1px solid #f0f0f0", position: 'relative' }}>
                        {!isExpanded && (
                          <Box sx={{ width: '100%', mb: 1, px: 1, borderBottom: '1px solid #e0e0e0', pb: 0.5 }}>
                            <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary', letterSpacing: 1.2, display: 'flex', alignItems: 'center', gap: 1 }}>
                              <FileIcon sx={{ fontSize: 16 }} /> Uploaded Receipt
                            </Typography>
                          </Box>
                        )}
                        {item.file ? (
                          <Box sx={{ width: '100%', textAlign: 'center', position: 'relative' }}>
                            <Box component="img" src={item.file} onClick={() => setExpandedIndex(isExpanded ? null : i)} sx={{ width: '100%', maxHeight: isExpanded ? '80vh' : '300px', minHeight: isExpanded ? '500px' : 'auto', objectFit: isExpanded ? 'contain' : 'cover', borderRadius: isExpanded ? 0 : 2, cursor: isExpanded ? 'zoom-out' : 'zoom-in', transition: "all 0.4s ease", boxShadow: isExpanded ? 'none' : '0px 2px 8px rgba(0,0,0,0.1)', backgroundColor: isExpanded ? "#000" : "transparent" }} />
                            <IconButton onClick={() => setExpandedIndex(isExpanded ? null : i)} sx={{ position: 'absolute', top: 10, right: 10, color: isExpanded ? '#fff' : '#1976d2', bgcolor: isExpanded ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)', '&:hover': { transform: "scale(1.1)", bgcolor: isExpanded ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.9)' } }}>
                              {isExpanded ? <CloseIcon sx={{ fontSize: 32 }} /> : <FullscreenIcon sx={{ fontSize: 25 }} />}
                            </IconButton>
                          </Box>
                        ) : (
                          <Stack alignItems="center" spacing={1} sx={{ opacity: 0.3, py: 10 }}>
                            <NoPhotographyIcon sx={{ fontSize: 48 }} />
                            <Typography variant="caption">Image Missing</Typography>
                          </Stack>
                        )}
                      </Grid>
                    </Grid>
                  </Paper>
                );
              })
            ) : (
              <Typography sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>No prescription records found.</Typography>
            )}
          </AccordionDetails>
        </Accordion>

      </>
    ) : (
      <Typography sx={{ py: 10, textAlign: 'center' }}>No review data.</Typography>
    )}
  </Box>
)}
{/* Case 11: REVIEW (MANAGING DEAN) */}
{popupState.type === "REVIEWMD" && (
  <Box sx={{ mt: 2, px: 1 }}>
    {popupState.data ? (
      <>
      {/* --- SECTION 0: APPLICATION DETAILS (INTEGRATED JSON FORMS) --- */}
        <Accordion sx={{ mb: 2, borderRadius: 2, '&:before': { display: 'none' }, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: "#fafafa", borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#7b1fa2", display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssignmentIcon fontSize="small" /> Task completed by the students dean officer
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 2, bgcolor: "#f3e5f533" }}>
            {Array.isArray(popupState.data.taskDetails) && popupState.data.taskDetails.length > 0 ? (
              popupState.data.taskDetails.map((item, i) => (
                <Paper
                  key={i}
                  sx={{
                    mb: 2,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: "#ffffff",
                    border: "1px solid #e1bee7",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                  }}
                >
                  {renderJson(item.formJson || item.value)}
                </Paper>
              ))
            ) : (
              <Typography sx={{ py: 2, textAlign: 'center', color: 'text.secondary' }}>No form details found.</Typography>
            )}
          </AccordionDetails>
        </Accordion>
        {/* --- SECTION 1: FINANCIAL DETAILS  --- */}
        <Accordion sx={{mb: 2, borderRadius: 2, '&:before': { display: 'none' }, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: "#fafafa", borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#388e3c", display: 'flex', alignItems: 'center', gap: 1 }}>
              <PaymentsIcon fontSize="small" /> Task completed by the clinic head officer
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 3 }}>
            {Array.isArray(popupState.data.amounts) && popupState.data.amounts.length > 0 ? (
              popupState.data.amounts.map((amt, idx) => (
                <Paper key={idx} elevation={0} sx={{ p: 3, mb: 2, border: "1px solid #f0f0f0", borderRadius: 3, bgcolor: "#f1f8e9" }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="textSecondary" display="block" sx={{ fontWeight: 800 }}>AMOUNT (IN DIGIT)</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: "#2e7d32" }}>
                        {amt.amount_indigit} {"ETB"}
                      </Typography>
                    </Grid>
                    <Grid marginLeft='20px' item xs={12} sm={8}>
                      <Typography variant="caption" color="textSecondary" display="block" sx={{ fontWeight: 800 }}>AMOUNT (IN WORD)</Typography>
                      <Typography variant="h6" sx={{ textTransform: "capitalize", color: "#5d4037", fontStyle: 'italic' }}>
                        {amt.amount_inword}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              ))
            ) : (
              <Typography sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>No financial data found.</Typography>
            )}
          </AccordionDetails>
        </Accordion>
        {/* --- SECTION 2: PRESCRIPTION DETAILS --- */}
        <Accordion  sx={{ mb: 2, borderRadius: 2, '&:before': { display: 'none' }, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: "#fafafa", borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1976d2", display: 'flex', alignItems: 'center', gap: 1 }}>
              <MedicationIcon fontSize="small" /> The completed tasks to start the application
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 3 }}>
            {Array.isArray(popupState.data.prescriptions) && popupState.data.prescriptions.length > 0 ? (
              popupState.data.prescriptions.map((item, i) => {
                const isExpanded = expandedIndex === i;
                return (
                  <Paper
                    key={i}
                    elevation={0}
                    sx={{
                      mb: 4,
                      borderRadius: 4,
                      overflow: "hidden",
                      border: "1px solid #f0f0f0",
                      boxShadow: isExpanded ? "0 20px 50px rgba(0,0,0,0.15)" : "0 10px 30px rgba(0,0,0,0.04)",
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    <Grid container>
                      {!isExpanded && (
                        <Grid item xs={12} md={7} sx={{ p: 4 }}>
                          <Stack spacing={3}>
                            <Box>
                              <Typography variant="overline" sx={{ color: "#fbc02d", fontWeight: 800, letterSpacing: 1.2 }}>
                                Detail Review
                              </Typography>
                              <Grid container sx={{ mt: 1 }}>
                                <Grid item xs={6}>
                                  <Typography variant="caption" color="textSecondary" display="block">Prescribed Medicine </Typography>
                                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{item.rx}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography marginLeft='30px' variant="caption" color="textSecondary" display="block">QUANTITY</Typography>
                                  <Typography marginLeft='30px' variant="h6" sx={{ fontWeight: 700 }}>{item.quantity}</Typography>
                                </Grid>
                              </Grid>
                            </Box>
                            <Divider />
                            <Box>
                              <Typography variant="overline" color="textSecondary" sx={{ fontWeight: 700 }}>
                                Prescription Detail
                              </Typography>
                              <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Avatar sx={{ bgcolor: "#e3f2fd", color: "#1976d2", width: 32, height: 32 }}>
                                    <PersonIcon fontSize="small" />
                                  </Avatar>
                                  <Box>
                                    <Typography variant="caption" color="textSecondary" display="block">Priscriber</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{"Dr."} {item.doctorFname} {item.doctorLname}</Typography>
                                  </Box>
                                </Stack>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Avatar sx={{ bgcolor: "#f1f8e9", color: "#388e3c", width: 32, height: 32 }}>
                                    <MedicationIcon fontSize="small" />
                                  </Avatar>
                                  <Box>
                                    <Typography variant="caption" color="textSecondary" display="block">Druggist</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.drugistFname} {item.drugistLname}</Typography>
                                  </Box>
                                </Stack>
                              </Stack>
                            </Box>
                            <Box sx={{ p: 2, borderRadius: 2, bgcolor: "#fffde7", border: "1px solid #fff59d" }}>
                              <Typography variant="caption" sx={{ fontWeight: 800, color: "#fbc02d", display: 'block' }}>REMARK</Typography>
                              <Typography variant="body2" sx={{ color: "#5d4037" }}>{item.remark || "N/A"}</Typography>
                            </Box>
                          </Stack>
                        </Grid>
                      )}
                      <Grid item xs={12} md={isExpanded ? 12 : 5} sx={{ p: isExpanded ? 0 : 2, bgcolor: "#fafafa", transition: "all 0.4s ease-in-out", display: 'flex', flexDirection: 'column', alignItems: 'center', borderLeft: isExpanded ? "none" : "1px solid #f0f0f0", position: 'relative' }}>
                        {!isExpanded && (
                          <Box sx={{ width: '100%', mb: 1, px: 1, borderBottom: '1px solid #e0e0e0', pb: 0.5 }}>
                            <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary', letterSpacing: 1.2, display: 'flex', alignItems: 'center', gap: 1 }}>
                              <FileIcon sx={{ fontSize: 16 }} /> Uploaded Receipt
                            </Typography>
                          </Box>
                        )}
                        {item.file ? (
                          <Box sx={{ width: '100%', textAlign: 'center', position: 'relative' }}>
                            <Box component="img" src={item.file} onClick={() => setExpandedIndex(isExpanded ? null : i)} sx={{ width: '100%', maxHeight: isExpanded ? '80vh' : '300px', minHeight: isExpanded ? '500px' : 'auto', objectFit: isExpanded ? 'contain' : 'cover', borderRadius: isExpanded ? 0 : 2, cursor: isExpanded ? 'zoom-out' : 'zoom-in', transition: "all 0.4s ease", boxShadow: isExpanded ? 'none' : '0px 2px 8px rgba(0,0,0,0.1)', backgroundColor: isExpanded ? "#000" : "transparent" }} />
                            <IconButton onClick={() => setExpandedIndex(isExpanded ? null : i)} sx={{ position: 'absolute', top: 10, right: 10, color: isExpanded ? '#fff' : '#1976d2', bgcolor: isExpanded ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)', '&:hover': { transform: "scale(1.1)", bgcolor: isExpanded ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.9)' } }}>
                              {isExpanded ? <CloseIcon sx={{ fontSize: 32 }} /> : <FullscreenIcon sx={{ fontSize: 25 }} />}
                            </IconButton>
                          </Box>
                        ) : (
                          <Stack alignItems="center" spacing={1} sx={{ opacity: 0.3, py: 10 }}>
                            <NoPhotographyIcon sx={{ fontSize: 48 }} />
                            <Typography variant="caption">Image Missing</Typography>
                          </Stack>
                        )}
                      </Grid>
                    </Grid>
                  </Paper>
                );
              })
            ) : (
              <Typography sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>No prescription records found.</Typography>
            )}
          </AccordionDetails>
        </Accordion>

      </>
    ) : (
      <Typography sx={{ py: 10, textAlign: 'center' }}>No review data.</Typography>
    )}
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