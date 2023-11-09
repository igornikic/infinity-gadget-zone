import axios from "axios";
import { createSlice, createAsyncThunk, isAnyOf } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  isUpdated: false,
  isDeleted: false,
  error: null,
};

// Update profile
export const updateProfile = createAsyncThunk(
  "user/updateProfile",
  async (userData, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.put(`/api/me/update`, userData, config);
      return data.success;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateProfileReset: (state) => {
      state.isUpdated = false;
    },
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(isAnyOf(updateProfile.pending), (state, action) => {
        state.loading = true;
      })
      .addMatcher(isAnyOf(updateProfile.fulfilled), (state, action) => {
        state.loading = false;
        state.isUpdated = action.payload;
      })
      .addMatcher(isAnyOf(updateProfile.rejected), (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addDefaultCase((state, action) => {
        return state;
      });
  },
});

export const { updateProfileReset, clearErrors } = userSlice.actions;

export default userSlice.reducer;
