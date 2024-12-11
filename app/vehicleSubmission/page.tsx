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
import axiosInstance from "@/utils/axiosInstance";
import withAuth from "../../hoc/withAuth";

const VehicleSubmission: React.FC = () => {
  const [form, setForm] = useState({
    model: "",
    price: "",
    phone: "",
    city: "",
    maxImages: 3,
  });
  const [cities, setCities] = useState(["Lahore", "Karachi"]); // Dynamic list of cities
  const [newCity, setNewCity] = useState(""); // New city input
  const [images, setImages] = useState<File[]>([]);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [phoneError, setPhoneError] = useState(""); // Error for phone validation
  const [loading, setLoading] = useState(false); // Loading state for form submission

  useEffect(() => {
    // Clean up object URLs on unmount
    return () => {
      thumbnails.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [thumbnails]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length + images.length > form.maxImages) {
      setError(`You can only upload up to ${form.maxImages} images.`);
      return;
    }

    setError("");
    const newImages = [...images, ...selectedFiles].slice(0, form.maxImages); // Limit total to maxImages
    setImages(newImages);
    setThumbnails(newImages.map((file) => URL.createObjectURL(file))); // Generate URLs for browser
  };

  const deleteImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    const updatedThumbnails = thumbnails.filter((_, i) => i !== index);
    setImages(updatedImages);
    setThumbnails(updatedThumbnails);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+923\d{2}-\d{7}$/; // Regex for +923XX-XXXXXXX format
    if (!phoneRegex.test(phone)) {
      setPhoneError(
        "Phone number must be in the format +923XX-XXXXXXX and contain only numbers."
      );
      return false;
    }
    setPhoneError("");
    return true;
  };

  const validateForm = () => {
    if (!form.model || !form.price || !form.phone || !form.city || images.length === 0) {
      setError("All fields are required and at least one image must be uploaded.");
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
    const formData = new FormData();

    // Append form data fields
    Object.keys(form).forEach((key) => {
      formData.append(key, String(form[key as keyof typeof form]));
    });

    // Append files
    images.forEach((image) => {
      formData.append("images", image, image.name);
    });

    try {
      const response = await axiosInstance.post("/vehicle", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Set appropriate headers for FormData
        },
      });

      setSuccess("Vehicle submitted successfully!");
      setError("");
      console.log("Response:", response.data);

      // Reset form and state after successful submission
      setForm({
        model: "",
        price: "",
        phone: "",
        city: "",
        maxImages: 3,
      });
      setImages([]);
      setThumbnails([]);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit vehicle.");
      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCity = () => {
    if (newCity.trim() && !cities.includes(newCity)) {
      setCities([...cities, newCity.trim()]);
      setNewCity(""); // Clear the input
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
        onChange={(e) => {
          setForm({ ...form, phone: e.target.value });
          validatePhone(e.target.value);
        }}
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
        inputProps={{ min: 1, max: 10 }}
        value={form.maxImages}
        onChange={(e) =>
          setForm({ ...form, maxImages: Math.min(10, Number(e.target.value)) }) // Limit to max 10
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
                "&:hover img": {
                  opacity: 0.7,
                },
              }}
            >
              <img src={src} alt={`Thumbnail ${index}`} width="100%" />
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
                <IconButton
                  color="inherit"
                  onClick={() => window.open(src, "_blank")}
                >
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
