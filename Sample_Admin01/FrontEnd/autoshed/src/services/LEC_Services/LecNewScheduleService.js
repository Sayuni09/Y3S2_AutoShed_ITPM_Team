import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api/lec";

/**
 * Fetch schedules for a specific lecturer.
 * @param {string} lecId - Lecturer ID.
 * @returns {Promise} - Promise resolving to the fetched schedule data.
 */
const getLecturerSchedules = async (lecId) => {
    try {
        const response = await axios.get(`${BASE_URL}/lecturer-schedules/${lecId}`);
        return response.data.schedules;
    } catch (error) {
        // If it's a 404 error (no schedules found), don't treat it as an error
        // but rather pass it along so we can display a more user-friendly message
        if (error.response && error.response.status === 404) {
            console.log("No schedules found:", error.response.data.message);
            return [];  // Return empty array instead of throwing
        }
        console.error("Error fetching lecturer schedules:", error);
        throw error;  // Re-throw other errors
    }
};

// Create a named object for export
const LecNewScheduleService = {
    getLecturerSchedules,
};

export default LecNewScheduleService;