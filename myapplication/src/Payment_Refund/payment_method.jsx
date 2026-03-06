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
  TextField
} from "@mui/material";

const Payment_method = ({ processDetailCode, onsave }) => {
  const [message, setMessage] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([]); 
  const [selectedMethods, setSelectedMethods] = useState({}); 

  useEffect(() => {
    getPaymentMethod();
  }, []);

  const getPaymentMethod = async () => {
    try {
      const res = await axios.get("/getPaymentMethod");
      if (Array.isArray(res.data)) {
        setPaymentMethods(res.data);
      }
    } catch (err) {
      setMessage("Error loading payment methods.");
    }
  };

  const handleCheckboxChange = (code) => {
    setSelectedMethods((prev) => {
      const newSelected = { ...prev };
      if (newSelected[code] !== undefined) {
        delete newSelected[code];
      } else {
        newSelected[code] = "";
      }
      return newSelected;
    });
  };

const handleAccountChange = (code, value) => {
    if (value === "" || /^\d+$/.test(value)) {
      setSelectedMethods((prev) => ({
        ...prev,
        [code]: value
      }));
    }
  };

  const handleSave = () => {
    const selectedCodes = Object.keys(selectedMethods);
    
    if (selectedCodes.length === 0) {
      setMessage("Please select at least one payment method.");
      return;
    }

    const isMissingAccount = selectedCodes.some(code => !selectedMethods[code].trim());
    if (isMissingAccount) {
      setMessage("Please enter an account number for all selected methods.");
      return;
    }
    if (onsave) {
      debugger
      const formattedData = selectedCodes.map((code) => ({
        method_code: code,
        account_number: selectedMethods[code],
      }));
      onsave(formattedData);
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
          <Box sx={{ height: 1, backgroundColor: "#e0e0e0", mt: 1 }} />
        </Box>

        <Typography sx={{ color: "#0b5c8e", fontWeight: 600, mb: 3 }}>
          Select the payment methods and enter your account numbers below.
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
                  <Box sx={{ pl: 4, mt: 1, maxWidth: 400 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label={`Enter ${method.name} Account Number`}
                      variant="outlined"
                      value={selectedMethods[method.method_code]}
                      onChange={(e) => handleAccountChange(method.method_code, e.target.value)}
                      placeholder="Account Number..."
                    />
                  </Box>
                )}
              </Box>
            );
          })}
        </FormGroup>

        <div style={{ marginTop: "20px" }}>
          <button
            type="button"
            className="actionBtn saveBtn"
            onClick={handleSave}
          >
            💾 {processDetailCode ? "Update" : "Save"}
          </button>
        </div>
      </Paper>
    </Box>
  );
};

export default Payment_method;