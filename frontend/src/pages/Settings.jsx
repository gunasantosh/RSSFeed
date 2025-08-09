import { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import {
  Box, Drawer, AppBar, List, Typography, IconButton, Button,
  Toolbar, MenuItem, Select, FormControl, InputLabel, Container,
  Divider, ListItem, ListItemButton, ListItemIcon, ListItemText
} from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  Send as SendIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Article as ArticleIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import api from "../api";
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const TOPIC_OPTIONS = [
  "AI", "Technology", "Health", "Finance", "Science",
  "Sports", "Education", "Environment", "Politics", "Entertainment"
];

const colorPalette = {
  primary: "#FF4D4D",
  text: "#fff",
  gradient: {
    start: "rgba(0,0,0,0.3)",
    end: "rgba(0,0,0,0.8)",
  },
};

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  })
);

const StyledAppBar = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: `${drawerWidth}px`,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
    backgroundColor: colorPalette.primary,
  })
);

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'space-between',
  backgroundColor: colorPalette.primary,
  color: colorPalette.text,
}));

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default function Settings() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
    }
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('api/user/logout', {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const handleSendWeeklyNewsletter = async () => {
    setLoading(true);
    setStatusMessage("Sending weekly newsletter...");
    try {
      const response = await api.get("api/send-latest-newsletter/");
      const sentCount = response.data.sent_count || 0;
      setStatusMessage(`Weekly newsletter sent to ${sentCount} subscribers.`);
    } catch (error) {
      console.error("Error sending weekly newsletter:", error);
      setStatusMessage("Failed to send weekly newsletter.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendTopicNewsletter = async () => {
    if (!selectedTopic) {
      return alert("Please select a topic first.");
    }

    setLoading(true);
    setStatusMessage(`Sending newsletter for topic: ${selectedTopic}...`);
    try {
      const response = await api.post("api/send-topic-feed/", { topic: selectedTopic });
      const sentCount = response.data.sent_count || 0;
      setStatusMessage(`Newsletter sent to ${sentCount} subscribers of '${selectedTopic}'.`);
    } catch (error) {
      console.error("Error sending topic newsletter:", error);
      setStatusMessage("Failed to send topic newsletter.");
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Users', icon: <PeopleIcon />, path: '/users' },
    { text: 'Articles', icon: <ArticleIcon />, path: '/articles' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <StyledAppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={() => setOpen(true)}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            <span style={{ color: colorPalette.text }}>NEWS</span>
            <span style={{ color: colorPalette.text }}>CREW</span>
          </Typography>
        </Toolbar>
      </StyledAppBar>

      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: colorPalette.gradient.end,
            color: colorPalette.text,
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <Typography variant="h5">
            <span style={{ color: colorPalette.text }}>NEWS</span>
            <span style={{ color: colorPalette.text }}>CREW</span>
          </Typography>
          <IconButton onClick={() => setOpen(false)} sx={{ color: colorPalette.text }}>
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton onClick={() => { navigate(item.path); setOpen(false); }}>
                <ListItemIcon sx={{ color: colorPalette.text }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon sx={{ color: colorPalette.text }}><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      <Main open={open}>
        <DrawerHeader />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ flexGrow: 1, padding: 3 }}>
            {statusMessage && (
              <Typography variant="body1" sx={{ mb: 2, p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
                {statusMessage}
              </Typography>
            )}

            <Typography variant="h6">Send Weekly Newsletter</Typography>
            <Button
              variant="contained"
              color="info"
              startIcon={<SendIcon />}
              onClick={handleSendWeeklyNewsletter}
              disabled={loading}
              sx={{ mb: 4 }}
            >
              {loading ? "Sending..." : "Send Weekly Newsletter"}
            </Button>

            <Typography variant="h6">Send Topic Newsletter</Typography>
            
            <FormControl fullWidth sx={{ marginBottom: 2 }}>
              <InputLabel>Select Topic</InputLabel>
              <Select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                disabled={loading}
              >
                {TOPIC_OPTIONS.map((topic, index) => (
                  <MenuItem key={index} value={topic}>{topic}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              color="success"
              startIcon={<SendIcon />}
              onClick={handleSendTopicNewsletter}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Topic Newsletter"}
            </Button>
          </Box>
        </Container>
      </Main>
    </Box>
  );
}
