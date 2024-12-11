"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  CircularProgress,
  Paper,
} from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    Cookies.remove("authToken");
    Cookies.remove("refreshToken");

    const token = Cookies.get("authToken");
    if (token) {
      router.push("/vehicleSubmission");
    }
  }, [router]);

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.post<{ token: string; refreshToken: string }>(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        }
      );

      if (response.status === 200) {
        const { token, refreshToken } = response.data;

        Cookies.set("authToken", token, { expires: 1 / 24 });
        Cookies.set("refreshToken", refreshToken, { expires: 1 });

        router.push("/vehicleSubmission");
      }
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      bgcolor="#f9f9f9"
      px={2}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          maxWidth: 400,
          width: "100%",
          borderRadius: "12px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          textAlign="center"
          fontWeight="bold"
          color="primary"
        >
          Welcome 
        </Typography>
        <Typography
          variant="body2"
          gutterBottom
          textAlign="center"
          color="textSecondary"
        >
          Please log in to access your account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: "8px" }}>
            {error}
          </Alert>
        )}

        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={!!error}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
            },
          }}
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={!!error}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
            },
          }}
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleLogin}
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
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
        </Button>

        <Typography
          variant="body2"
          mt={2}
          textAlign="center"
          color="textSecondary"
        >
          Don’t have an account?{" "}
          Please use these Credientals 
          <br />
          Email: Amjad@desolint.com
          <br />
          Password: 123456abc

        </Typography>
      </Paper>
    </Box>
  );
}
