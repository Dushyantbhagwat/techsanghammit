import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Card,
  CardContent,
  useTheme,
  TextField,
  Button,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Air as AirIcon,
  Timeline as TimelineIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Message as MessageIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Mock data for demonstration
const mockAQIData = [
  { time: '00:00', value: 50 },
  { time: '04:00', value: 45 },
  { time: '08:00', value: 60 },
  { time: '12:00', value: 75 },
  { time: '16:00', value: 65 },
  { time: '20:00', value: 55 },
];

const mockCityMetrics = {
  currentAQI: 55,
  temperature: 24,
  humidity: 65,
  trafficDensity: 'Moderate',
};

const mockMessages = [
  { id: 1, text: "Air quality alert: AQI levels rising in downtown area", time: "10:30 AM" },
  { id: 2, text: "Traffic congestion reported on Main Street", time: "11:15 AM" },
  { id: 3, text: "Weather update: Light rain expected in the evening", time: "12:00 PM" },
];

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

interface Message {
  id: number;
  text: string;
  time: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" mb={2}>
        {icon}
        <Typography variant="h6" ml={1}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h4">{value}</Typography>
    </CardContent>
  </Card>
);

const MessageSection: React.FC = () => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>(mockMessages);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: messages.length + 1,
        text: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Messages & Alerts
      </Typography>
      <Box sx={{ height: '300px', overflowY: 'auto', mb: 2 }}>
        {messages.map((message) => (
          <Box key={message.id} sx={{ mb: 2 }}>
            <Typography variant="body1">{message.text}</Typography>
            <Typography variant="caption" color="text.secondary">
              {message.time}
            </Typography>
            <Divider sx={{ mt: 1 }} />
          </Box>
        ))}
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <Button
          variant="contained"
          endIcon={<SendIcon />}
          onClick={handleSendMessage}
        >
          Send
        </Button>
      </Box>
    </Paper>
  );
};

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerWidth = 240;

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon /> },
    { text: 'Air Quality', icon: <AirIcon /> },
    { text: 'Analytics', icon: <TimelineIcon /> },
    { text: 'Messages', icon: <MessageIcon /> },
    { text: 'Alerts', icon: <NotificationsIcon /> },
    { text: 'Settings', icon: <SettingsIcon /> },
  ];

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return '#00e676';
    if (aqi <= 100) return '#ffd54f';
    if (aqi <= 150) return '#ff9800';
    if (aqi <= 200) return '#f44336';
    return '#b71c1c';
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleDrawer}
            sx={{ marginRight: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Smart City Monitoring Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="persistent"
        anchor="left"
        open={drawerOpen}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} component="div">
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginLeft: drawerOpen ? `${drawerWidth}px` : 0,
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar />
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {/* Metric Cards */}
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Current AQI"
                value={mockCityMetrics.currentAQI}
                icon={<AirIcon sx={{ color: getAQIColor(mockCityMetrics.currentAQI) }} />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Temperature"
                value={`${mockCityMetrics.temperature}°C`}
                icon={<TimelineIcon color="primary" />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Humidity"
                value={`${mockCityMetrics.humidity}%`}
                icon={<TimelineIcon color="primary" />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Traffic Density"
                value={mockCityMetrics.trafficDensity}
                icon={<TimelineIcon color="primary" />}
              />
            </Grid>

            {/* Messages Section */}
            <Grid item xs={12} md={6}>
              <MessageSection />
            </Grid>

            {/* AQI Chart */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  AQI Trend
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockAQIData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Status Updates */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  System Status
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Box display="flex" alignItems="center">
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor: '#00e676',
                          marginRight: 1,
                        }}
                      />
                      <Typography>AQI Sensors: Online</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box display="flex" alignItems="center">
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor: '#00e676',
                          marginRight: 1,
                        }}
                      />
                      <Typography>Data Processing: Active</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box display="flex" alignItems="center">
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor: '#00e676',
                          marginRight: 1,
                        }}
                      />
                      <Typography>Alert System: Operational</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard;