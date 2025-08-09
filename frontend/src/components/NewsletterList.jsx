import { useEffect, useState, useRef } from "react";
import api from "../api";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";

// Image imports
const aiImage = new URL("../assets/ai.jpg", import.meta.url).href;
const TechnologyImage = new URL("../assets/technology.webp", import.meta.url).href;
const HealthImage = new URL("../assets/health.webp", import.meta.url).href;
const FinanceImage = new URL("../assets/finance.webp", import.meta.url).href;
const ScienceImage = new URL("../assets/science.webp", import.meta.url).href;
const SportsImage = new URL("../assets/sports.webp", import.meta.url).href;
const EducationImage = new URL("../assets/education.webp", import.meta.url).href;
const EnvironmentImage = new URL("../assets/environment.webp", import.meta.url).href;
const worldPoliticsImage = new URL("../assets/world_politics.jpg", import.meta.url).href;
const EntertainmentImage = new URL("../assets/entertainment.webp", import.meta.url).href;
const defaultImage = new URL("../assets/default.jpg", import.meta.url).href;

const newsletterImages = {
  AI: aiImage,
  Technology: TechnologyImage,
  Health: HealthImage,
  Finance: FinanceImage,
  Science: ScienceImage,
  Sports: SportsImage,
  Education: EducationImage,
  Environment: EnvironmentImage,
  Politics: worldPoliticsImage,
  Entertainment: EntertainmentImage,
};


const NewsletterList = () => {
  const [newsletters, setNewsletters] = useState([]);
  const [selectedNewsletter, setSelectedNewsletter] = useState(null);
  const [loading, setLoading] = useState(true);
  const latestNewsRef = useRef(null);

  useEffect(() => {
    const fetchNewsletters = async () => {
      try {
        const response = await api.get("api/latest-feeds/");
        const formatted = Object.entries(response.data).map(([topic, articles]) => ({
          topic,
          ...articles[0], // Only the latest article
        }));
        setNewsletters(formatted);

        setTimeout(() => {
          if (latestNewsRef.current) {
            latestNewsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 1000);
      } catch (error) {
        console.error("Error fetching newsletters:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsletters();
  }, []);

  if (loading) return <CircularProgress sx={{ display: "block", mx: "auto", my: 4 }} />;

  return (
    <Box
      sx={{
        px: 3,
        textAlign: "center",
        background: "linear-gradient(135deg, #FFEBEE, #FFCDD2)",
        minHeight: "100vh",
        py: 4,
      }}
      ref={latestNewsRef}
    >
      <Typography
        variant="h4"
        fontWeight="bold"
        sx={{ mb: 3, color: "#333" }}
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Latest News Feed
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {newsletters.map((newsletter, index) => (
          <Grid item xs={12} sm={6} md={4} key={`${newsletter.topic}-${index}`}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <Card
                onClick={() => setSelectedNewsletter(newsletter)}
                sx={{
                  cursor: "pointer",
                  boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
                  borderRadius: 3,
                  overflow: "hidden",
                  transition: "0.3s",
                  backdropFilter: "blur(15px)",
                  background: "rgba(255, 255, 255, 0.2)",
                  height: "400px", // Fixed height
                  width: "300px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  "&:hover": {
                    boxShadow: "0px 15px 40px rgba(0, 0, 0, 0.2)",
                    transform: "scale(1.03)",
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={newsletterImages[newsletter.topic] || defaultImage}
                  sx={{ width: "100%", objectFit: "cover" }}
                  onError={(e) => (e.target.src = defaultImage)}
                />
                <CardContent
                  sx={{
                    textAlign: "center",
                    flexGrow: 1,
                    overflow: "hidden",
                    px: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="#001219"
                    sx={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {newsletter.topic}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{
                      mt: 1,
                      maxHeight: "40px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {newsletter.title}
                  </Typography>
                </CardContent>
                <Box sx={{ textAlign: "center", pb: 2 }}>
                  <Button
                    variant="contained"
                    sx={{
                      mt: 2,
                      bgcolor: "#FF4D4D",
                      color: "#fff",
                      borderRadius: 2,
                      fontWeight: "bold",
                      "&:hover": {
                        background: "linear-gradient(45deg, #FF3D00, #FF6D00)",
                      },
                    }}
                  >
                    Read More
                  </Button>
                </Box>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={!!selectedNewsletter}
        onClose={() => setSelectedNewsletter(null)}
        fullWidth
        maxWidth="md"
        sx={{
          "& .MuiPaper-root": {
            borderRadius: "16px",
            background: "#F5F5F5",
            boxShadow: "0px 10px 40px rgba(0, 0, 0, 0.2)",
          },
        }}
      >
        {selectedNewsletter && (
          <>
            <DialogTitle
              sx={{
                background: "linear-gradient(135deg, #1E2A38, #283747)",
                color: "#FFF",
                textAlign: "center",
                fontWeight: "bold",
                padding: "16px",
                borderRadius: "16px 16px 0 0",
              }}
            >
              {selectedNewsletter.title}
            </DialogTitle>

            <DialogContent
              sx={{
                padding: "24px",
                background: "rgba(255, 255, 255, 0.98)",
                borderRadius: "0 0 16px 16px",
                maxHeight: "60vh",
                overflowY: "auto",
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {selectedNewsletter.summary ? (
                  <>
                    <div
                      dangerouslySetInnerHTML={{ __html: selectedNewsletter.content || selectedNewsletter.summary }}
                      style={{ fontSize: "16px", lineHeight: "1.6", color: "#333", marginBottom: "16px" }}
                    />
                    <Button
                      variant="contained"
                      href={selectedNewsletter.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        background: "linear-gradient(135deg, #1976D2, #0D47A1)",
                        color: "#fff",
                        fontWeight: "bold",
                        borderRadius: "24px",
                        px: 4,
                        py: 1,
                        "&:hover": {
                          background: "linear-gradient(135deg, #1565C0, #0D47A1)",
                        },
                      }}
                    >
                      Read Full Article
                    </Button>
                  </>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" minHeight="50px">
                    <CircularProgress size={40} />
                  </Box>
                )}
              </motion.div>
            </DialogContent>



            <DialogActions sx={{ justifyContent: "center", background: "#F5F5F5" }}>
              <Button
                onClick={() => setSelectedNewsletter(null)}
                sx={{
                  background: "linear-gradient(135deg, #A64B2A, #8B3E1C)",
                  color: "#fff",
                  fontWeight: "bold",
                  px: 4,
                  borderRadius: "24px",
                }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default NewsletterList;
