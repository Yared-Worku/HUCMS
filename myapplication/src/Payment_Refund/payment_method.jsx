import React, { useState, useEffect } from "react";
import "../Services.css";
import axios from "axios";
import {
  Box,
  Paper,
  Typography,
  Divider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Alert,
  TextField,
  CircularProgress
} from "@mui/material";

const Payment_method = ({ processDetailCode, onsave, userid }) => {
  const [message, setMessage] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethods, setSelectedMethods] = useState({});
  const [loading, setLoading] = useState(true);
  const [originalSavedData, setOriginalSavedData] = useState({});
  const [allDbRecords, setAllDbRecords] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        getPaymentMethod(),
        userid ? getInsertedPaymentMethod(userid) : Promise.resolve()
      ]);
      setLoading(false);
    };
    fetchData();
  }, [userid]);

  const getPaymentMethod = async () => {
    try {
      const res = await axios.get("/getPaymentMethod");
      if (Array.isArray(res.data)) {
        setPaymentMethods(res.data);
      }
    } catch (err) {
      setMessage("Error loading available payment methods.");
    }
  };

  const getInsertedPaymentMethod = async (uid) => {
    try {
      const res = await axios.get(`/getInsertedPaymentMethod/${uid}`);

      if (Array.isArray(res.data)) {
        const activeData = {};
        const historyData = {};

        res.data.forEach((item) => {
          const accNo = item.account_number?.toString() || "";
          historyData[item.method_code] = accNo;
          if (item.status === true || item.status === 1) {
            activeData[item.method_code] = accNo;
          }
        });

        setAllDbRecords(historyData);
        setOriginalSavedData(activeData);
        setSelectedMethods(activeData);
      }
    } catch (err) {
      console.error("Error loading saved methods:", err);
    }
  };

  const handleCheckboxChange = (code) => {
    setSelectedMethods((prev) => {
      const newSelected = { ...prev };
      
      if (newSelected[code] !== undefined) {
        delete newSelected[code];
      } else {
        newSelected[code] = allDbRecords[code] || "";
      }
      return newSelected;
    });
  };

  const handleAccountChange = (code, value) => {
    setSelectedMethods((prev) => ({
      ...prev,
      [code]: value
    }));
  };

  const handleSave = () => {
    const selectedCodes = Object.keys(selectedMethods);

    if (selectedCodes.length === 0) {
      setMessage("Please select at least one payment method.");
      return;
    }

    const isMissingAccount = selectedCodes.some(code => !selectedMethods[code]?.trim());
    if (isMissingAccount) {
      setMessage("Please enter an account number for all selected methods.");
      return;
    }

    if (onsave) {
      const formattedData = selectedCodes.map((code) => ({
        method_code: code,
        account_number: selectedMethods[code],
      }));
      onsave(formattedData);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <CircularProgress />
      </Box>
    );
  }

  const isUpdateMode = Object.keys(originalSavedData).length > 0;

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
        {message && (
          <Alert severity="info" sx={{ mb: 2 }} onClose={() => setMessage("")}>
            {message}
          </Alert>
        )}

        <Divider sx={{ my: 1 }} />
        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant="h6" sx={{ color: "#0b5c8e", fontWeight: 700 }}>
            Available Payment Methods
          </Typography>
          <Box sx={{ height: 2, backgroundColor: "#0b5c8e", opacity: 0.2, mt: 1 }} />
        </Box>

        <Typography sx={{ color: "#555", fontWeight: 500, mb: 3 }}>
          Select your preferred payment methods. Existing account details will be restored automatically upon selection.
        </Typography>

        <FormGroup sx={{ pl: 1 }}>
          {paymentMethods.map((method) => {
            const isChecked = selectedMethods[method.method_code] !== undefined;

            return (
              <Box key={method.method_code} sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isChecked}
                      onChange={() => handleCheckboxChange(method.method_code)}
                      sx={{
                        color: "#0b5c8e",
                        "&.Mui-checked": { color: "#0b5c8e" },
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontWeight: 600, color: "#333" }}>
                      {method.name}
                    </Typography>
                  }
                />

                {isChecked && (
                  <Box sx={{ pl: 4, mt: 1, maxWidth: 450 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label={`${method.name} Account Number`}
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                      value={selectedMethods[method.method_code] || ""}
                      onChange={(e) => handleAccountChange(method.method_code, e.target.value)}
                      placeholder="Enter account number..."
                      // helperText={
                      //   allDbRecords[method.method_code] && !originalSavedData[method.method_code]
                      //     ? "Previously added account, you can update"
                      //     : ""
                      // }
                    />
                  </Box>
                )}
              </Box>
            );
          })}
        </FormGroup>

        <Box sx={{ mt: 4 }}>
          <button
            type="button"
            className="actionBtn saveBtn"
            onClick={handleSave}
            style={{
              padding: "10px 25px",
              fontSize: "1rem",
              cursor: "pointer"
            }}
          >
            💾 {isUpdateMode ? "Update" : "Save"}
          </button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Payment_method;