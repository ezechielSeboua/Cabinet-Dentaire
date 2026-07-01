import axios from "axios";
import { API_URL } from "../utils/config";

const appointmentBookingService = {
  getUpcomingAppointments: async () => {
    const response = await axios.get(API_URL+"/appointment-booking/");
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await axios.patch(`${API_URL}/${id}/appointment-booking/status`, null, {
      params: { status },
    });
    return response.data;
  },

  getAppointmentsByStatus: async (status) => {
        try {
            const response = await axios.get(`${API_URL}/appointment-booking/by-status`, {
                params: { status }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching appointments by status:', error);
            throw error;
        }
    }
};



export default appointmentBookingService;
