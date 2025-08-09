
import { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import ReactMarkdown from 'react-markdown';
import {
  Box, Drawer, AppBar, Toolbar, List, Typography, Divider, IconButton,
  ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Container,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
  Menu as MenuIcon, ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon, Article as ArticleIcon,
  Settings as SettingsIcon, Logout as LogoutIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const colorPalette = {
  primary: "#FF4D4D",
  text: "#fff",
  inputBackground: "#fff",
  gradient: {
    start: "rgba(0,0,0,0.3)",
    end: "rgba(0,0,0,0.8)",
  },
  button: {
    background: "#FF4D4D",
    hoverScale: 1.1,
    borderRadius: "30px",
  },
  borderRadius: {
    input: 1,
  },
};

const drawerWidth = 240;

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

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: colorPalette.gradient.end,
  color: colorPalette.text,
}));

export default function Uarticles() {
  const [open, setOpen] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [dashboardData, setDashboardData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login'); // Redirect if no token found
    } else {
      //fetchUserData();
      fetchDashboardData();
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
  try {
    const token = localStorage.getItem('authToken');

    // Step 1: Get user's subscription topic
    const subResponse = await api.get('/api/user/profile/', {
      headers: { Authorization: `Token ${token}` }
    });

    const userTopic = subResponse.data.subscribed_topic;

    // Step 2: Fetch articles for that topic
    const feedResponse = await api.get(`api/latest-feeds/?topic=${userTopic}`, {
      headers: { Authorization: `Token ${token}` }
    });

    setDashboardData({ [userTopic]: feedResponse.data[userTopic] });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }
};


  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);

  const handleLogout = async () => {
    try {
      await api.post('api/user/logout', {}, {
        headers: {
          Authorization: `Token ${localStorage.getItem('authToken')}`
        }
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const handleViewArticle = (article) => {
    setSelectedArticle(article);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedArticle(null);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/udashboard' },
    { text: 'Articles', icon: <ArticleIcon />, path: '/uarticles' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/usettings' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <StyledAppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
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
          <IconButton onClick={handleDrawerClose} sx={{ color: colorPalette.text }}>
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton onClick={() => { navigate(item.path); setOpen(false); }} sx={{ color: colorPalette.text }}>
                <ListItemIcon sx={{ color: colorPalette.text }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout} sx={{ color: colorPalette.text }}>
              <ListItemIcon sx={{ color: colorPalette.text }}><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      <Main open={open}>
        <DrawerHeader />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {Object.entries(dashboardData).map(([topic, articles]) => (
            <Box key={topic} sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>{topic}</Typography>
              <StyledPaper>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Published</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {articles.map((article, index) => (
                        <TableRow key={index}>
                          <TableCell>{article.title}</TableCell>
                          <TableCell>{new Date(article.published).toLocaleString()}</TableCell>
                          <TableCell>
                            <Button variant="contained" color="primary" onClick={() => handleViewArticle(article)}>
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </StyledPaper>
            </Box>
          ))}

          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
            <DialogTitle>{selectedArticle?.title}</DialogTitle>
            <DialogContent>
              <div
                dangerouslySetInnerHTML={{
                  __html: selectedArticle?.content || selectedArticle?.summary || "<p>No content available.</p>"
                }}
              />
              {selectedArticle?.link && (
                <Box mt={2}>
                  <Button
                    variant="outlined"
                    color="primary"
                    href={selectedArticle.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Read more
                  </Button>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary">Close</Button>
            </DialogActions>
          </Dialog>


        </Container>
      </Main>
    </Box>
  );
}
