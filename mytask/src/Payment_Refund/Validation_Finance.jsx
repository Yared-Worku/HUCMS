import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box, Paper, Typography, Grid, Divider, CircularProgress, Alert, ListItemButton, ListItemIcon, ListItemText
} from "@mui/material";
import {
  AccountBalance, Smartphone, AccountBalanceWallet, CheckCircle, Payment
} from "@mui/icons-material";

const Validation_Finance = ({ application_number, todocode, ProcessDetailCode, taskcode, onSaveComplete }) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (application_number) {
      fetchPaymentMethods();
    }
  }, [application_number]);

  const fetchPaymentMethods = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`/getActivePaymentMethod/${application_number}`);
      setPaymentMethods(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setMessage("Failed to load active payment methods.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedMethod) return;

    try {
      setSaving(true);
      setMessage("");

      const payload = {
        application_number: application_number,
        method_code: selectedMethod.method_code,
        todocode: todocode,
        ProcessDetailCode: ProcessDetailCode,
        tasks_task_code: taskcode
      };
      await axios.post("/submitPaymentProcess", payload);
      setMessage("🎉 Payment process saved successfully!");
      if (onSaveComplete) {
        onSaveComplete();
      }

    } catch (error) {
      setMessage("Failed to save selection.");
    } finally {
      setSaving(false);
    }
  };

  const getBankIcon = (name, isSelected) => {
    const lower = name.toLowerCase();
    const color = isSelected ? "#0b5c8e" : "#757575";
    const style = { color };

    if (lower.includes("tele") || lower.includes("mobile") || lower.includes("birr") || lower.includes("mpesa")) {
      return <Smartphone sx={style} />;
    }
    
    if (lower.includes("wallet") || lower.includes("app") || lower.includes("hellocash") || lower.includes("e-money")) {
      return <AccountBalanceWallet sx={style} />;
    }

    if (lower.includes("bank") || lower.includes("commercial") || lower.includes("international")) {
      return <AccountBalance sx={style} />;
    }

    return <Payment sx={style} />;
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
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
        {message && (
          <div className={`alert ${message.includes("successfully") ? "alert-info" : "alert-danger"}`}>
            {message}
          </div>
        )}

        <Divider sx={{ my: 3 }} />
        <Typography variant="header" sx={{ color: "#0b5c8e", fontWeight: 600, mb: 2, display: "block" }}>
          Select Payment Method
        </Typography>

        <Grid container spacing={2}>
          {paymentMethods.map((method) => {
            const isSelected = selectedMethod?.method_code === method.method_code;
            return (
              <Grid item xs={12} key={method.method_code}>
                <Paper
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    borderColor: isSelected ? "#0b5c8e" : "#e0e0e0",
                    borderWidth: isSelected ? 2 : 1,
                    bgcolor: isSelected ? "#f0f7ff" : "inherit",
                    transition: "all 0.2s ease"
                  }}
                >
                  <ListItemButton 
                    onClick={() => setSelectedMethod(method)}
                    sx={{ p: 2, borderRadius: 2 }}
                  >
                    <ListItemIcon>
                      {getBankIcon(method.name, isSelected)}
                    </ListItemIcon>
                    <ListItemText 
                      primary={<Typography fontWeight={isSelected ? 700 : 500}>{method.name}</Typography>}
                      secondary={`Account Number: ${method.accNo}`}
                    />
                    {isSelected && <CheckCircle sx={{ color: "#0b5c8e" }} />}
                  </ListItemButton>
                </Paper>
              </Grid>
            );
          })}
        </Grid>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 3, display: "block" }}
        >
          Please select the payment method where the payment was processed.
        </Typography>

        <div style={{ marginTop: "30px" }}>
          <button
            type="button"
            className="actionBtn saveBtn"
            onClick={handleSave}
            disabled={!selectedMethod || saving}
            style={{ 
              opacity: (!selectedMethod || saving) ? 0.6 : 1,
              cursor: (!selectedMethod || saving) ? "not-allowed" : "pointer" 
            }}
          >
            {saving ? "Processing..." : "💾 Save"}
          </button>
        </div>
      </Paper>
    </Box>
  );
};

export default Validation_Finance;