import axios from "axios";

const API_URL = "http://localhost:5000/api/free_time_slots";

// Reuse your existing auth header configuration
const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    console.log("Using token:", token);
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const getFreeTimeSlots = async () => {
    try {
        const response = await axios.get(API_URL, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error fetching free time slots:", error);
        
        if (error.response?.data?.message) {
            throw error.response.data.message;
        } else {
            throw new Error ("Failed to fetch available slots. Please try again.");
        }
    }
};

export const addFreeTimeSlot = async (slotData) => {
    try {
        const response = await axios.post(API_URL, slotData, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error adding available slot:", error);
        
        if (error.response?.data?.message) {
            throw error.response.data.message;
        } else {
            throw new Error ("Failed to add available slot. Please try again.");
        }
    }
};

export const updateFreeTimeSlot = async (id, slotData) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, slotData, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error updating available slot:", error);
        
        if (error.response?.data?.message) {
            throw error.response.data.message;
        } else {
            throw new Error ("Failed to update available slot. Please try again.");
        }
    }
};

export const deleteFreeTimeSlot = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error deleting available slot:", error);
        
        if (error.response?.data?.message) {
            throw error.response.data.message;
        } else {
            throw new Error ("Failed to delete available slot. Please try again.");
        }
    }
};

export const bookFreeTimeSlot = async (id, licId) => {
    try {
        const response = await axios.patch(
            `${API_URL}/${id}/book`,
            { allocated_to: licId },
            getAuthHeader()
        );
        return response.data;
    } catch (error) {
        console.error("Error booking available slot:", error);
        
        if (error.response?.data?.message) {
            throw error.response.data.message;
        } else {
            throw new Error ("Failed to book this slot. Please try again.");
        }
    }
};

export const getModules = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/modules", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching modules:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch modules");
    }
  };