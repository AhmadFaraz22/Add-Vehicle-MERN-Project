"use client";

import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Alert,
  MenuItem,
  IconButton,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import axiosInstance from "@/utils/axiosInstance"; // Axios instance for API requests
import withAuth from "../../hoc/withAuth";
import Image from "next/image";

const VehicleSubmission: React.FC = () => {
  const [form, setForm] = useState({
    model: "",
    price: "",
    phone: "",
    city: "",
    maxImages: 1, // Default maxImages set to 5, can be modified
  });
  const [cities, setCities] = useState(["Lahore", "Karachi"]);
  const [newCity, setNewCity] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [phoneError, setPhoneError] = useState(""); // Phone number validation error
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      thumbnails.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [thumbnails]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const totalFiles = selectedFiles.length + images.length;

    if (totalFiles > form.maxImages) {
      setError(`You can only upload up to ${form.maxImages} images.`);
      return;
    }

    const newImages = [...images, ...selectedFiles];
    const newThumbnails = newImages.map((file) => URL.createObjectURL(file));

    setImages(newImages);
    setThumbnails(newThumbnails);
    setError(""); // Clear previous errors
  };

  const deleteImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    const updatedThumbnails = thumbnails.filter((_, i) => i !== index);

    setImages(updatedImages);
    setThumbnails(updatedThumbnails);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+923\d{2}-\d{7}$/;
    if (!phoneRegex.test(phone)) {
      setPhoneError("Phone number must be in the format +923XX-XXXXXXX.");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const validateForm = () => {
    if (!form.model || !form.price || !form.phone || !form.city || images.length === 0) {
      setError("All fields are required, and at least one image must be uploaded.");
      return false;
    }

    if (!validatePhone(form.phone)) {
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
  
    setLoading(true);
    setError("");
    setSuccess("");
  
    try {
      const formData = new FormData();
  
      // Append form fields
      formData.append("model", form.model);
      formData.append("price", form.price);
      formData.append("phone", form.phone);
      formData.append("city", form.city);
  
      // Append images as files
      images.forEach((image) => {
        formData.append("images", image, image.name); // Ensure that the image is appended with its name
      });

      // Send POST request to the API
      await axiosInstance.post("/vehicle/", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // No need to set this explicitly; the browser will handle it
        },
      });
  
      setSuccess("Vehicle submitted successfully!");
      setForm({
        model: "",
        price: "",
        phone: "",
        city: "",
        maxImages: 5, // Reset maxImages to default
      });
      setImages([]);
      setThumbnails([]);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "An error occurred.");
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };
  

  const handleAddCity = () => {
    if (newCity.trim() && !cities.includes(newCity)) {
      setCities([...cities, newCity.trim()]);
      setNewCity(""); // Clear input field
    }
  };

  return (
    <Box
      p={4}
      sx={{
        maxWidth: 800,
        margin: "0 auto",
        background: "#fff",
        borderRadius: "8px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Typography variant="h4" gutterBottom textAlign="center" fontWeight="bold" color="primary">
        Submit Your Vehicle
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <TextField
        label="Car Model"
        fullWidth
        margin="normal"
        value={form.model}
        onChange={(e) => setForm({ ...form, model: e.target.value })}
      />
      <TextField
        label="Price"
        type="number"
        fullWidth
        margin="normal"
        value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
      />
      <TextField
        label="Phone"
        fullWidth
        margin="normal"
        value={form.phone}
        error={!!phoneError}
        helperText={phoneError || "Format: +923XX-XXXXXXX"}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />

      <TextField
        select
        label="City"
        fullWidth
        margin="normal"
        value={form.city}
        onChange={(e) => setForm({ ...form, city: e.target.value })}
      >
        {cities.map((city) => (
          <MenuItem key={city} value={city}>
            {city}
          </MenuItem>
        ))}
      </TextField>
      <Box display="flex" gap={1} alignItems="center" marginBottom={2}>
        <TextField
          label="Add New City"
          fullWidth
          margin="normal"
          value={newCity}
          onChange={(e) => setNewCity(e.target.value)}
        />
        <IconButton onClick={handleAddCity} color="primary">
          <AddIcon />
        </IconButton>
      </Box>

      <TextField
        label="Max Images"
        type="number"
        fullWidth
        margin="normal"
        inputProps={{ min: 1, max: 20 }} // Set the max value to 20
        value={form.maxImages}
        onChange={(e) =>
          setForm({
            ...form,
            maxImages: Math.min(20, Math.max(1, Number(e.target.value))), // Ensure value stays within 1-20
          })
        }
      />
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: "none" }}
        id="image-upload"
        disabled={form.maxImages <= 0}
      />
      <Grid container spacing={2} mt={2}>
        {thumbnails.map((src, index) => (
          <Grid item key={index} xs={4} position="relative">
            <Box
              position="relative"
              sx={{
                borderRadius: "8px",
                overflow: "hidden",
                border: "1px solid #ddd",
                "&:hover img": { opacity: 0.7 },
              }}
            >
              <Image src={src} alt={`Thumbnail ${index}`} width={500} height={300} layout="responsive" objectFit="cover" />
              <Box
                position="absolute"
                top={0}
                right={0}
                display="flex"
                gap={1}
                p={1}
                bgcolor="rgba(0, 0, 0, 0.6)"
                borderRadius="0 0 0 8px"
              >
                <IconButton color="inherit" onClick={() => window.open(src, "_blank")}>
                  <VisibilityIcon />
                </IconButton>
                <IconButton color="inherit" onClick={() => deleteImage(index)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          </Grid>
        ))}
        {images.length < form.maxImages && (
          <Grid item xs={4}>
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              width="100%"
              height={100}
              border="1px dashed #ddd"
              borderRadius="8px"
              sx={{
                cursor: "pointer",
                "&:hover": { borderColor: "#000" },
              }}
              onClick={() => document.querySelector<HTMLInputElement>("#image-upload")?.click()}
            >
              <Typography color="textSecondary">Add Pictures</Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{
          mt: 3,
          py: 1.5,
          textTransform: "none",
          fontSize: "16px",
          borderRadius: "8px",
          background: "linear-gradient(135deg, #6c63ff, #7b9fff)",
          "&:hover": {
            background: "linear-gradient(135deg, #7b9fff, #6c63ff)",
          },
        }}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : "Add Car"}
      </Button>
    </Box>
  );
};

export default withAuth(VehicleSubmission);
