import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Grid, Paper, Typography, Button, Avatar, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { 
  AssignmentTurnedInOutlined, 
  FolderOpenOutlined,            
  AssignmentIndOutlined,       
  CancelOutlined,
  PauseCircleOutlineOutlined 
} from '@mui/icons-material';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Label 
} from 'recharts';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: { completed: 0, open: 0, suspended: 0, picked: 0, rejected: 0 },
    details: []
  });
  // --- Reusable Stat Card Component ---
const StatCard = ({ title, value, color, icon }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2, 
      borderRadius: 3,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderLeft: `6px solid ${color}`,
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
      height: '100%', 
      boxSizing: 'border-box',
      transition: 'all 0.3s ease-in-out',
      cursor: 'pointer',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
      }
    }}
  >
    <Box>
      <Typography 
        variant="overline" 
        sx={{ 
          color: '#64748b', 
          fontWeight: 700, 
          lineHeight: 1.1, 
          display: 'block', 
          mb: 0.5,
          fontSize: '0.65rem' 
        }}
      >
        {title}
      </Typography>
      <Typography variant="h5" sx={{ color: '#0f172a', fontWeight: 800 }}>
        {value}
      </Typography>
    </Box>
    <Avatar sx={{ bgcolor: `${color}15`, color: color, width: 44, height: 44 }}>
      {React.cloneElement(icon, { sx: { fontSize: 20 } })}
    </Avatar>
  </Paper>
);

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState({ title: '', data: [] });
    const [userid, setUserid] = useState(null);
    const [roleid, setRoleid] = useState(null);
      const { stats, details } = dashboardData;

    // const Username = window.__DNN_USER__?.username ?? "Guest";
  const Username = "amani";

  useEffect(() => {
    fetchuserid();
  }, []);

  const fetchuserid = async () => {
    try {
      const res = await axios.get(`/GetUserID/${Username}`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        const id = res.data[0].userid;
        const roleid = res.data[0].roleid;
        setRoleid(roleid);
        setUserid(id);
        await fetchStudentdashboard(id);
      }
    } catch (err) {
      console.error("Failed to fetch userid:", err);
    }
  };

const fetchStudentdashboard = async (id) => {
  debugger
     axios.get(`/StudentDashboardResponse/${id}`)
      .then(res => {
        if (res.data) {
          setDashboardData(res.data);
        }
      })
      .catch(err => console.error("Error fetching dashboard data:", err));
      }
  const rawChartData = [
    { name: 'Completed', value: stats.completed, color: '#4caf50' }, 
    { name: 'Open', value: stats.open, color: '#2196f3' },   
    { name: 'Suspended', value: stats.suspended, color: '#ffc107' }, 
    { name: 'Picked', value: stats.picked, color: '#ff9800' }, 
    { name: 'Rejected', value: stats.rejected, color: '#f44336' }
  ];
  const chartData = rawChartData.filter(item => {
    if (roleid === '4ED1B191-AD58-4EAD-B269-02576B4DD8D0'.toLowerCase() ) {
    return item.name !== 'Open' && item.name !== 'Picked';
       }else{
       return item.name !== 'Suspended';
       }
       })

const quickActionsConfig = [
    { label: "Check Application Progress", filterStatuses: ['P'] },
    { label: "Review Completed Applications", filterStatuses: ['C'] },
    { label: "Review Rejected Applications", filterStatuses: ['PS'] },
    { label: "Review Suspended Applications", filterStatuses: ['S'] } 
  ];

  const handleQuickActionClick = (action) => {
    const filteredData = details.filter(item => 
      action.filterStatuses.includes(item.status)
    );
    
    setDialogContent({ title: action.label, data: filteredData });
    setDialogOpen(true);
  };

  const closeDialog = () => setDialogOpen(false);
  const showRoleColumn = dialogContent.data.some(row => row.roleID !== '4ED1B191-AD58-4EAD-B269-02576B4DD8D0'.toLowerCase());

  return (
    <Box sx={{ 
      width: '100vw', 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc', 
      m: 0, 
      p: 0,
      boxSizing: 'border-box',
      overflowX: 'hidden' 
    }}>
      
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', mb: 4 }}>
          DASHBOARD
        </Typography>
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4} md={2.4}>
            <StatCard 
              title="COMPLETED APPLICATIONS" 
              value={stats.completed} 
              color="#4caf50" 
              icon={<AssignmentTurnedInOutlined />} 
            />
          </Grid>
          {roleid === '4ED1B191-AD58-4EAD-B269-02576B4DD8D0'.toLowerCase() && (
    <Grid item xs={12} sm={4} md={2.4}>
      <StatCard 
        title="SUSPENDED APPLICATIONS" 
        value={stats.suspended} 
        color="#ffc107" 
        icon={<PauseCircleOutlineOutlined />} 
      />
       </Grid>
          )}
         {roleid !== '4ED1B191-AD58-4EAD-B269-02576B4DD8D0'.toLowerCase() && (
            <>
              <Grid item xs={12} sm={4} md={2.4}>
                <StatCard title="OPEN APPLICATIONS" value={stats.open} color="#2196f3" icon={<FolderOpenOutlined />} />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <StatCard title="PICKED APPLICATIONS" value={stats.picked} color="#ff9800" icon={<AssignmentIndOutlined />} />
              </Grid>
            </>
          )}
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard 
              title="REJECTED APPLICATIONS" 
              value={stats.rejected} 
              color="#f44336" 
              icon={<CancelOutlined />} 
            />
          </Grid>
        </Grid>
        <Grid container spacing={3} alignItems="stretch">
          <Grid item xs={12} md={9}>
            <Paper 
              elevation={0} 
                sx={{ 
                p: 3, 
                borderRadius: 3, 
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                width: '750px', 
                height: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
                }
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 2 }}>
                Task Status Distribution
              </Typography>
              
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%" 
                      cy="50%"
                      innerRadius="65%"
                      outerRadius="85%"
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                      <Label 
                        value={stats.completed} 
                        position="centerBottom" 
                        fontSize="32px" 
                        fontWeight="bold" 
                        fill="#1e293b" 
                        dy={-10} 
                      />
                      <Label 
                        value="Completed" 
                        position="centerTop" 
                        fontSize="16px" 
                        fill="#64748b" 
                        dy={20} 
                      />
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '8px', 
                        border: 'none', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                      }} 
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle" 
                      wrapperStyle={{ paddingTop: '20px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
     {roleid === '4ED1B191-AD58-4EAD-B269-02576B4DD8D0'.toLowerCase() && (
        <>
          {/* Quick Actions */}
          <Grid item xs={12} md={3}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                maxWidth: '100%',
                borderRadius: 3, 
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                height: '100%',
                boxSizing: 'border-box',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
                }
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 3 }}>
                Quick Actions
              </Typography>
              <Stack direction="column" spacing={2}>
                {quickActionsConfig.map((action, index) => (
                  <Button  
                  type='button'
                    key={index}
                    onClick={() => handleQuickActionClick(action)}
                    variant="outlined" 
                    fullWidth
                    sx={{ 
                      py: 1.5, 
                      borderRadius: 2, 
                      textTransform: 'none', 
                      fontWeight: 600, 
                      color: '#2563eb',
                      borderColor: 'rgba(37, 99, 235, 0.2)',
                      '&:hover': {
                        backgroundColor: 'rgba(37, 99, 235, 0.04)',
                        borderColor: '#2563eb'
                      }
                    }}
                  >
                    {action.label}
                  </Button>
                ))}
              </Stack>
            </Paper>
          </Grid>
              </> )}
        </Grid>
      </Box>

      <Dialog 
        open={dialogOpen} 
        onClose={closeDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#1e293b' }}>
          {dialogContent.title}
        </DialogTitle>
        <DialogContent dividers>
  {dialogContent.data.length > 0 ? (
    <TableContainer sx={{ maxHeight: 300 }}> 
      <Table size="small" stickyHeader aria-label="sticky table">
        <TableHead>
          <TableRow>
            {/* 3. Ensure cells have a background so rows don't bleed through while scrolling */}
            <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#fff' }}>Application No</TableCell>
            <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#fff' }}>Service Name</TableCell>
            {showRoleColumn && (
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#fff' }}>Currently processing by</TableCell>
            )}
            <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#fff' }}>Application Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dialogContent.data.map((row, idx) => (
            <TableRow key={idx} hover>
              <TableCell>{row.application_No}</TableCell>
              <TableCell>{row.service_Name}</TableCell>
              {showRoleColumn && (
                <TableCell>{row.roleName}</TableCell>
              )}
              <TableCell>{formatDate(row.application_Date)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  ) : (
    <Typography sx={{ color: '#64748b', py: 3, textAlign: 'center' }}>
      No applications found for this status.
    </Typography>
  )}
</DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeDialog} variant="contained" disableElevation sx={{ borderRadius: 2 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default Dashboard;