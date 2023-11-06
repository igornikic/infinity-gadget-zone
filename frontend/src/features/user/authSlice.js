import axios from "axios";
import { createSlice, createAsyncThunk, isAnyOf } from "@reduxjs/toolkit";

const initialState = {
  user: {},
  loading: false,
  isAuthenticated: false,
  error: null,
};

// Google login
export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async (token, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.post("/api/google-login", token, config);

      return data.user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Register user
export const register = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.post(`/api/register`, userData, config);

      return data.user;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Login user
export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.post(
        `/api/login`,
        { email, password },
        config
      );

      return data.user;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Load user
export const loadUser = createAsyncThunk(
  "auth/loadUser",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/me`);

      return data.user;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        isAnyOf(
          register.pending,
          login.pending,
          googleLogin.pending,
          loadUser.pending
        ),
        (state, action) => {
          state.loading = true;
          state.isAuthenticated = false;
        }
      )
      .addMatcher(
        isAnyOf(
          register.fulfilled,
          login.fulfilled,
          googleLogin.fulfilled,
          loadUser.fulfilled
        ),
        (state, action) => {
          state.loading = false;
          state.isAuthenticated = true;
          state.user = action.payload;
          state.error = null;
        }
      )
      .addMatcher(
        isAnyOf(
          register.rejected,
          login.rejected,
          googleLogin.rejected,
          loadUser.rejected
        ),
        (state, action) => {
          state.loading = false;
          state.isAuthenticated = false;
          state.user = null;
          state.error = action.payload;
        }
      )
      .addDefaultCase((state, action) => {
        return state;
      });
  },
});

export const { clearErrors } = authSlice.actions;

export default authSlice.reducer;
