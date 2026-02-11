import React, { useEffect, useState } from "react";
import axios from "axios";
import * as Survey from "survey-react-ui";
import { Model } from "survey-core";
import "survey-core/survey-core.min.css";
import {
  Box,
  Paper
} from "@mui/material";

function Surveycomp({ formCode, onsave1, detailId }) {
  const [formJson, setFormJson] = useState(null);
  const [survey, setSurvey] = useState(null);
  const [data, setData] = useState(null); // null initially
  const [loading, setLoading] = useState(true);

  // Fetch data from DB if detailId is provided
  useEffect(() => {
    if (!detailId) {
      // No detailId → set empty data to trigger new form load
      setData({});
      return;
    }

    const fetchData = async () => {
      try {
        const res = await axios.get(`/GetJsonData/${detailId}`);
        let dbValue = null;

        if (Array.isArray(res.data) && res.data.length > 0) {
          dbValue = res.data[0].data || res.data[0].value;
          if (dbValue && typeof dbValue === "string") {
            dbValue = JSON.parse(dbValue);
          }
        }

        setData(dbValue || {}); // fallback to empty object
      } catch (err) {
        console.error("Failed to fetch data: ", err);
        setData({});
      }
    };

    fetchData();
  }, [detailId]);

  // Merge answers into JSON for saving
  const mergeAnswersIntoJson = (formStructure, answers) => {
    if (!formStructure?.pages) return formStructure;
    const updatedJson = JSON.parse(JSON.stringify(formStructure));

    updatedJson.pages.forEach((page) => {
      page.elements?.forEach((element) => {
        const qName = element.name;
        if (qName && Object.prototype.hasOwnProperty.call(answers, qName)) {
          element.value = answers[qName];
        }
      });
    });

    return updatedJson;
  };

  // Save form handler
  const handlesaveform = () => {
    if (!survey || !formJson) return;
    const surveyData = survey.data;
    const mergedJson = mergeAnswersIntoJson(formJson, surveyData);
    onsave1(mergedJson);
  };

  // Load survey once formCode or data is available
  useEffect(() => {
    if (!formCode || data === null) return;

    const loadSurvey = (jsonData) => {
      const surveyModel = new Model(jsonData);
      surveyModel.showNavigationButtons = false;
      surveyModel.showCompletedPage = false;

      // Pre-fill answers if "value" exists
      const answers = {};
      jsonData.pages?.forEach((page) => {
        page.elements?.forEach((el) => {
          if (el.name && el.hasOwnProperty("value")) {
            answers[el.name] = el.value;
          }
        });
      });

      surveyModel.data = answers;
      setSurvey(surveyModel);
      setFormJson(jsonData);
      setLoading(false);
    };

    if (Object.keys(data).length === 0) {
      // No saved data → fetch new form JSON
      axios
        .get(`http://yared.local/json/${encodeURIComponent(formCode)}.json`)
        .then((res) => {
          console.log("🆕 Loaded new form:", res.data);
          loadSurvey(res.data);
        })
        .catch((err) => {
          console.error("Error loading form JSON:", err);
          setFormJson(null);
          setLoading(false);
        });
    } else {
      // Use saved data
      console.log("📄 Loaded saved form data:", data);
      loadSurvey(data);
    }
  }, [formCode, data]);

  if (loading) return <div>Loading form...</div>;

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
    <div style={{ padding: "20px" }}>
      <Survey.Survey model={survey} />

      <div style={{ marginTop: "20px" }}>
        <button type="button" className="btn btn-success" onClick={handlesaveform}>
          💾 Save
        </button>
      </div>
    </div>
           </Paper>
        </Box>
  );
}

export default Surveycomp;
