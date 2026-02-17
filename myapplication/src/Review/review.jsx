import React, { useEffect, useState } from "react"; 
import { Box, Typography, Paper, Collapse, IconButton } from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import axios from "axios";
import * as Survey from "survey-react-ui";
import { Model } from "survey-core";
import "survey-core/survey-core.min.css";

const initialCustomerState = {
  Customer_ID: "",
  Applicant_First_Name_AM: "",
  Applicant_First_Name_EN: "",
  Applicant_Middle_Name_AM: "",
  Applicant_Middle_Name_En: "",
  Applicant_Last_Name_AM: "",
  Applicant_Last_Name_EN: "",
  TIN: "",
  Gender: "",
  Email: "",
  Age: "",
  Mobile_No: "",
  ID_NO: "",
  depname: "",
  Photo: "",
  Signiture: ""
};

const Review = ({ formCode, processDetailCode, userId }) => {
  const [surveyJson, setSurveyJson] = useState(null); // full JSON for Survey
  const [survey, setSurvey] = useState(null);
  const [customerData, setCustomerData] = useState(initialCustomerState);
  const [surveyOpen, setSurveyOpen] = useState(false);
  const [customerOpen, setCustomerOpen] = useState(false);
    const [application_number, setApplicationNumber] = useState("");
    const [applicationOpen, setApplicationOpen] = useState(false);
  const formcode = formCode.toUpperCase();
  useEffect(() => {
    if (!userId) return;
    fetchCustomer();
        fetchSurvey();
        fetchCertificatedatareview()
  }, [userId]);
  // 🔹 Fetch survey JSON for this application
  

    const fetchSurvey = async () => {
      try {
        const res = await axios.get(`/GetSurveyDataReview/${processDetailCode}`);
        if (Array.isArray(res.data) && res.data.length > 0) {
          const json = res.data[0].value ? JSON.parse(res.data[0].value) : {};
          setSurveyJson(json);

          // Initialize Survey model in read-only mode
          const surveyModel = new Model(json);
          surveyModel.readOnly = true; // Entire survey is read-only
          surveyModel.showNavigationButtons = false;
          surveyModel.showCompletedPage = false;

          // Pre-fill answers and make sure each question is read-only
          const answers = {};
          json.pages?.forEach((page) => {
            page.elements?.forEach((el) => {
              if (el.name && el.hasOwnProperty("value")) {
                answers[el.name] = el.value;
              }
              // Make sure question cannot be edited
              if (el.type) {
                el.isReadOnly = true;
              }
            });
          });
          surveyModel.data = answers;

          setSurvey(surveyModel);
        }
      } catch (err) {
        console.error("Failed to fetch survey data:", err);
      }
    };

    const fetchCustomer = async () => {
      try {
        const res = await axios.get(`/Customer/${userId}`);
        if (Array.isArray(res.data) && res.data.length > 0) {
          // debugger
          const cust = res.data[0];
          setCustomerData({
            Applicant_First_Name_AM: cust.applicant_First_Name_AM,
            Applicant_First_Name_EN: cust.applicant_First_Name_EN,
            Applicant_Middle_Name_AM: cust.applicant_Middle_Name_AM,
            Applicant_Middle_Name_En: cust.applicant_Middle_Name_En,
            Applicant_Last_Name_AM: cust.applicant_Last_Name_AM,
            Applicant_Last_Name_EN: cust.applicant_Last_Name_EN,
            TIN: cust.tin,
            Gender: cust.gender,
            Email: cust.email,
            Age: cust.age,
            Mobile_No: cust.mobile_No,
            Photo: cust.photo,
            depname: cust.depname,
            ID_NO: cust.iD_NO,
            Signiture: cust.signiture
          });
        } else {
          // debugger
          setCustomerData(initialCustomerState);
        }
      } catch (err) {
        console.error("Failed to fetch customer data:", err);
      }
    };
    const fetchCertificatedatareview = async () => {
      try {
                const res = await axios.get(`/Getcertificate/${userId}`);
                if (Array.isArray(res.data) && res.data.length > 0) {
                  //auto-select when processDetailCode exists
                  if (processDetailCode) {
                    const matchedItem = res.data.find(
                      (item) => item.detail_code === processDetailCode
                    );
          
                    if (matchedItem) {
                      setApplicationNumber(matchedItem.application_number);
                    }
                  }
                }
              } catch (err) {
                console.error("Failed to fetch certificate data:", err);
              }
            };
          
const customerFieldOrder = [
  "Applicant_First_Name_AM",
  "Applicant_First_Name_EN",
  "Applicant_Middle_Name_AM",
  "Applicant_Middle_Name_En",
  "Applicant_Last_Name_AM",
  "Applicant_Last_Name_EN",
  "TIN",
  "Gender",
  "Email",
  "Age",
  "Mobile_No",
  "ID_NO",     
  "depname",
  "Photo",
  "Signiture"
];
const renderFormSection = () => {
  if (formcode === "E0D68EE8-56E6-4262-A407-8999F92FCCDE") {
    return (
      <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">📄 Application Information</Typography>
          <IconButton
            size="small"
            onClick={() => setApplicationOpen(!applicationOpen)}
          >
            {applicationOpen ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        <Collapse in={applicationOpen}>
          <div className="row mt-2">
            <div className="col-md-4 mb-3">
              <label className="form-label">Selected Application Number</label>
              <input
                type="text"
                className="form-control"
                value={application_number ?? ""}
                readOnly
              />
            </div>
          </div>
        </Collapse>
      </Paper>
    );
  }
  else {
    return (
      <>
        <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">📋 Survey Responses</Typography>
            <IconButton size="small" onClick={() => setSurveyOpen(!surveyOpen)}>
              {surveyOpen ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>

          <Collapse in={surveyOpen}>
            {survey ? (
              <Box mt={2}>
                <Survey.Survey model={survey} />
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                No survey data available.
              </Typography>
            )}
          </Collapse>
        </Paper>
      </>
    );
  }
};

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
          🔎 Review Your Application
        </Typography>

        <Typography variant="body2" sx={{ mb: 2, color: "gray" }}>
          Please check your details before submitting.
        </Typography>
       {renderFormSection()}
      {/* Customer Section (Read-only) */}
      <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">👤 Customer Information</Typography>
          <IconButton size="small" onClick={() => setCustomerOpen(!customerOpen)}>
            {customerOpen ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
        <Collapse in={customerOpen}>
          {customerData ? (
            <div className="row mt-2">
             {customerFieldOrder.map((key) => {
            const value = customerData[key];

                if (key === "Photo" || key === "Signiture") {
                  return (
                    <div className="col-md-6 mb-3" key={key}>
                      <label className="form-label">{key}</label>
                      {value ? (
                        <img
                          src={value}
                          alt={key}
                          style={{ maxHeight: "100px", display: "block", marginTop: "5px" }}
                        />
                      ) : (
                        <input type="text" className="form-control" value="—" readOnly />
                      )}
                    </div>
                  );
                }
                if (typeof value === "boolean") {
                  return (
                    <div className="col-md-3 mb-3 form-check" key={key}>
                      <input type="checkbox" className="form-check-input" checked={value} readOnly />
                      <label className="form-check-label">{key}</label>
                    </div>
                  );
                }
                return (
                  <div className="col-md-4 mb-3" key={key}>
                    <label className="form-label">{key}</label>
                    <input
                      type="text"
                      className="form-control"
                      value={value?.toString() ?? ""}
                      readOnly
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              No customer info available.
            </Typography>
          )}
        </Collapse>
      </Paper>
    </Box>
  );
};

export default Review;
