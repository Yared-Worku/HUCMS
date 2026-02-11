import React from "react";
import { Box, Typography, Paper, Divider } from "@mui/material";

const StaticPage = () => {
  return (
    <Box
      sx={{
        maxWidth: "800px",
        margin: "40px auto",
        padding: "24px",
      }}
    >
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
          Welcome to Our Platform
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="body1" paragraph>
          This is a static page example. You can use this component to display
          fixed content such as About Us, Terms of Service, or Contact
          Information.
        </Typography>

        <Typography variant="body1" paragraph>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus.
          Suspendisse lectus tortor, dignissim sit amet, adipiscing nec,
          ultricies sed, dolor. Cras elementum ultrices diam.
        </Typography>

        <Typography variant="body1" paragraph>
          You can also customize this component to fetch and display content
          from a CMS or JSON file if needed.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Typography variant="caption" display="block" align="center">
          © {new Date().getFullYear()} YD IT Solution PLC. All rights reserved.
        </Typography>
      </Paper>
    </Box>
  );
};

export default StaticPage;
