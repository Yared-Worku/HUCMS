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
  PauseCircleOutlineOutlined,
  AccessTimeOutlined
} from '@mui/icons-material';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Label 
} from 'recharts';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: { completed: 0, open: 0, suspended: 0, picked: 0, rejected: 0 },
    details: []
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState({ title: '', data: [] });
   const [userid, setUserid] = useState(null);
   const [roleid, setRoleid] = useState(null);
  const { stats, details } = dashboardData;
   const [apptDialogOpen, setApptDialogOpen] = useState(false);
  const [apptData, setApptData] = useState([]);
  
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

    const Username = window.__DNN_USER__?.username ?? "Guest";
  // const Username = "amani";

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
       await fetchStudentdashboard(id, roleid);
      }
    } catch (err) {
      console.error("Failed to fetch userid:", err);
    }
  };

const fetchStudentdashboard = async (id, roleid) => {
     axios.get(`/StudentDashboardResponse/${id}`,{
      params: {roleID: roleid}
     })
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
    { label: "Check Application Progress", filterStatuses: ['P', 'O'] },
    { label: "Review Completed Applications", filterStatuses: ['C'] },
    { label: "Review Rejected Applications", filterStatuses: ['PS'] },
    { label: "Review Suspended Applications", filterStatuses: ['S'] } ,
    { label: "Check your appointment", isAppointment: true }
  ];

const handleQuickActionClick = async (action) => {
  if (action.isAppointment) {
    try {
      const res = await axios.get(`/getAppointmentReview/${userid}`);
      const mappedAppointments = res.data.map((item, index) => ({
        id: index,
        doctorName: `Dr. ${item.doctorFName || ''} ${item.doctorLName || ''}`.trim(),
        date: item.appointment_date,
        application_number: item.application_number,
      }));
      
      setApptData(mappedAppointments);
      setApptDialogOpen(true); 
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    }
  } else {
    const filteredData = details.filter(item => 
      action.filterStatuses.includes(item.status)
    );
    setDialogContent({ title: action.label, data: filteredData });
    setDialogOpen(true);
  }
};

  const closeDialog = () => setDialogOpen(false);
  const showRoleColumn = dialogContent.data.some(row => row.roleID !== '4ED1B191-AD58-4EAD-B269-02576B4DD8D0'.toLowerCase());
  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);
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
            <>
    <Grid item xs={12} sm={4} md={2.4}>
      <StatCard 
        title="SUSPENDED APPLICATIONS" 
        value={stats.suspended} 
        color="#ffc107" 
        icon={<PauseCircleOutlineOutlined />} 
      />
       </Grid>
        <Grid item xs={12} sm={4} md={2.4}>
            <StatCard title="APPLICATIONS IN PROGRESS"
             value={stats.picked}  color="#2196f3" 
             icon={<AccessTimeOutlined />} 
             />
          </Grid>
          </>
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
          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
          <Label 
            value={totalValue > 0 ? `${((stats.completed / totalValue) * 100).toFixed(1)}%` : '0%'} 
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
          formatter={(value) => [
            `${value} (${totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) : 0}%)`, 
            'Value'
          ]}
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
  PaperProps={{ 
    sx: { 
      borderRadius: 4, 
      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)' 
    } 
  }}
>
  <DialogTitle sx={{ 
    fontWeight: 800, 
    color: '#1e293b', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    pt: 3,
    pb: 2
  }}>
    {dialogContent.title}
    <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b', bgcolor: '#f1f5f9', px: 1.5, py: 0.5, borderRadius: 10 }}>
      {dialogContent.data.length} Total
    </Typography>
  </DialogTitle>

  <DialogContent dividers sx={{ p: 0 }}>
    {dialogContent.data.length > 0 ? (
      <TableContainer sx={{ maxHeight: 300 }}> 
        <Table size="medium" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Application No
              </TableCell>
              <TableCell sx={{ fontWeight: 700, backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Service Name
              </TableCell>
              {showRoleColumn && (
                <TableCell sx={{ fontWeight: 700, backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Progress 
                </TableCell>
              )}
              <TableCell sx={{ fontWeight: 700, backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Application Date
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dialogContent.data.map((row, idx) => (
              <TableRow key={idx} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell sx={{ fontWeight: 600, color: '#0f172a' }}>
                  {row.application_No}
                </TableCell>
                <TableCell sx={{ color: '#334155' }}>
                  {row.service_Name}
                </TableCell>
           {showRoleColumn && (
     <TableCell>
    <Typography 
      variant="body2" 
      sx={{ 
        color: '#334155', 
        fontSize: '0.875rem' 
      }}
    >
      Under process by{' '}
      <Box 
        component="span" 
        sx={{ 
          fontWeight: 700, 
          color: '#0f172a' 
        }}
      >
        {row.roleName}
      </Box>
            </Typography>
          </TableCell>
         )}
                <TableCell sx={{ color: '#64748b', fontWeight: 500 }}>
                  {formatDate(row.application_Date)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    ) : (
      <Box sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="body1" sx={{ color: '#94a3b8', fontWeight: 500 }}>
          No records found for this status.
        </Typography>
      </Box>
    )}
  </DialogContent>

  <DialogActions sx={{ p: 2.5, bgcolor: '#f8fafc' }}>
    <Button 
    type='button'
      onClick={closeDialog} 
      variant="outlined" 
      sx={{ 
        borderRadius: 2, 
        textTransform: 'none', 
        fontWeight: 700, 
        px: 3,
        color: '#475569',
        borderColor: '#e2e8f0',
        '&:hover': { borderColor: '#cbd5e1', bgcolor: '#fff' }
      }}
    >
      Close
    </Button>
  </DialogActions>
</Dialog>
      
<Dialog 
  open={apptDialogOpen} 
  onClose={() => setApptDialogOpen(false)} 
  maxWidth="sm" 
  fullWidth
  PaperProps={{ 
    sx: { 
      borderRadius: 4,
      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
    } 
  }}
>
  <DialogTitle sx={{ 
    fontWeight: 800, 
    color: '#1e293b', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    pt: 3 
  }}>
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <Avatar sx={{ bgcolor: '#e0e7ff', color: '#4338ca' }}>
        <AccessTimeOutlined />
      </Avatar>
      <Typography variant="h6" sx={{ fontWeight: 800 }}>My Appointments</Typography>
    </Stack>
    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
      {apptData.length} Scheduled
    </Typography>
  </DialogTitle>

  <DialogContent sx={{ px: 0 }}> 
    {apptData.length > 0 ? (
      <TableContainer>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Application NO</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Provider</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Appointment Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {apptData.map((row) => (
              <TableRow 
                key={row.id} 
                sx={{ '&:hover': { bgcolor: '#f1f5f9' }, transition: 'background 0.2s' }}
              >
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    {row.application_number}
                  </Typography>
    
                </TableCell>
                
                <TableCell>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: '#f1f5f9', color: '#1e293b', border: '1px solid #e2e8f0' }}>
                      {row.doctorName?.charAt(4)} 
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                        {row.doctorName}
                      </Typography>
                      
                    </Box>
                  </Stack>
                </TableCell>

                <TableCell align="right">
                  <Box sx={{ 
                    display: 'inline-block', 
                    px: 1.5, 
                    py: 0.5, 
                    borderRadius: 2, 
                    bgcolor: '#f0f9ff', 
                    border: '1px solid #e0f2fe' 
                  }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#0369a1' }}>
                      {formatDate(row.date)}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    ) : (
      <Stack alignItems="center" sx={{ py: 8, px: 3 }}>
        <Avatar sx={{ width: 64, height: 64, mb: 2, bgcolor: '#f8fafc' }}>
          <FolderOpenOutlined sx={{ fontSize: 32, color: '#cbd5e1' }} />
        </Avatar>
        <Typography sx={{ color: '#64748b', fontWeight: 500 }}>No upcoming appointments found.</Typography>
      </Stack>
    )}
  </DialogContent>

  <DialogActions sx={{ p: 2.5, bgcolor: '#f8fafc' }}>
    <Button 
    type='button'
       onClick={() => setApptDialogOpen(false)} 
      variant="outlined" 
      sx={{ 
        borderRadius: 2, 
        textTransform: 'none', 
        fontWeight: 700, 
        px: 3,
        color: '#475569',
        borderColor: '#e2e8f0',
        '&:hover': { borderColor: '#cbd5e1', bgcolor: '#fff' }
      }}
    >
      Close
    </Button>
  </DialogActions>
</Dialog>
    </Box>
  );
};

export default Dashboard;