import axios from "axios";
import { API_URL } from "../utils/config";
import { AuthHeader } from "../utils/authHeader";

const head = {
  "Content-Type": "application/json",
};

export const clinicSettings = (data) => {
  return axios.post(API_URL + "/hospital/register", data, {
    headers: AuthHeader(),
  });
};

export const clinicInfo = () => {
  return axios.get(API_URL + "/hospital/settings", {
    headers: AuthHeader(),
  });
};

export const getClinicInfo = (id) => {
  return axios.get(API_URL + `/hospital/get/${id}`, {
    headers: AuthHeader(),
  });
};

export function updateClinicSettings(id, data) {
  return axios.put(API_URL + "/hospital/update/" + id, data, {
    headers: AuthHeader(),
  });
}

export function updateClinicSettingsNoId(data) {
  return axios.put(API_URL + "/hospital/update", data, {
    headers: AuthHeader(),
  });
}

export const patientList = () => {
  return axios.get(API_URL + "/patient/allPatients", {
    headers: AuthHeader(),
    head,
  });
};

export const patientListPaged = (page = 0, size = 25, search = "") => {
  return axios.get(API_URL + "/patient/patients", {
    headers: AuthHeader(),
    params: { page, size, search },
  });
};

export const ListSignlepatient = (patientid) => {
  return axios.get(API_URL + `/patient/get/${patientid}`, {
    headers: AuthHeader(),
  });
};

export const addPatient = (data) => {
  return axios.post(API_URL + "/patient/register", data, {
    headers: AuthHeader(),
  });
};

export async function savePatient(patient) {
  return await axios.post(API_URL + "/patient/register", patient, {
    headers: AuthHeader(),
  });
}

export async function getLatestPatient() {
  return await axios.get(API_URL + "/patient/lastPatient", {
    headers: AuthHeader(),
  });
}

export function updatePatient(id, data) {
  return axios.put(API_URL + "/patient/update/" + id, data, {
    headers: AuthHeader(),
  });
}

export function updatePatientPhoto(FormData) {
  return axios.put(API_URL + "/patient/photo", FormData, {
    headers: AuthHeader(),
    "Content-Type": "multipart/form-data",
  });
}

export function deletePatient(id) {
  return axios.delete(API_URL + "/patient/delete/" + id, {
    headers: AuthHeader(),
  });
}

export const listInsurancePatient = (id) => {
  return axios.get(API_URL + `/patient/getpatient/${id}`, {
    headers: AuthHeader(),
  });
};

export const insuranceAndPatientList = () => {
  return axios.get(API_URL + "/patient/allPatients", {
    headers: AuthHeader(),
  });
};

export const addTreatment = (data) => {
  return axios.post(API_URL + "/treatment/", data, {
    headers: AuthHeader(),
  });
};

export const allTreatments = () => {
  return axios.get(API_URL + "/treatment/", {
    headers: AuthHeader(),
  }).then((res) => {
    const data = res.data;
    return {
      ...res,
      data: Array.isArray(data) ? data : data?.content ?? [],
    };
  });
};

export const allTreatmentsPaged = (page = 0, size = 20) => {
  return axios.get(API_URL + "/treatment/", {
    headers: AuthHeader(),
    params: { page, size },
  });
};

export const docTreatments = (doctor) => {
  return axios.get(API_URL + "/treatment/" + doctor, {
    headers: AuthHeader(),
  });
};

export const listSignleTreatment = (id) => {
  return axios.get(API_URL + `/treatment/get/${id}`, {
    headers: AuthHeader(),
  });
};

export const getPatientTreatments = (patientno) => {
  return axios.get(API_URL + `/treatment/patient/${patientno}`, {
    headers: AuthHeader(),
  });
};

export const getTreatmentStats = (startDate, endDate) => {
  return axios.get(API_URL + `/treatment/stats/${startDate}/${endDate}`, {
    headers: AuthHeader(),
  });
};

export function updateTreatmentPaymentStatus(id) {
  // Pass `null` or `{}` as the second argument (the request body)
  // Pass the headers object as the THIRD argument (the config)
  return axios.put(
    API_URL + "/treatment/updatepaymentstatus/" + id,
    null, // Or an empty object {}
    {
      headers: AuthHeader(),
    },
  );
}

export function searchTreatmentBasedOnDateInterval(FormData) {
  return axios.put(API_URL + "/treatment/dateInterval", FormData, {
    headers: AuthHeader(),
  });
}
export function updateTreatmentStatus(id) {
  return axios.put(API_URL + "/treatment/updatestatus/" + id, {
    headers: AuthHeader(),
  });
}

export function updateTreatment(id, data) {
  return axios.put(API_URL + "/treatment/update/" + id, data, {
    headers: AuthHeader(),
  });
}

export function deleteTreatment(id) {
  return axios.delete(API_URL + "/treatment/delete/" + id, {
    headers: AuthHeader(),
  });
}

export const addAppointment = (data) => {
  return axios.post(API_URL + "/appointment/", data, {
    headers: AuthHeader(),
  });
};

export const allAppointments = (data) => {
  return axios.get(API_URL + "/appointment/", {
    headers: AuthHeader(),
  });
};

export function getAppointment(id) {
  return axios.get(API_URL + "/appointment/get/" + id, {
    headers: AuthHeader(),
  });
}

export function updateAppointment(id, data) {
  return axios.put(API_URL + "/appointment/update/" + id, data, {
    headers: AuthHeader(),
  });
}

export function deleteAppointment(id) {
  return axios.delete(API_URL + "/appointment/delete/" + id, {
    headers: AuthHeader(),
  });
}

//INSURANCE MANAGEMENT...
export const addInsurance = (data) => {
  return axios.post(API_URL + "/insurance/register", data, {
    headers: AuthHeader(),
  });
};

export const insuranceList = () => {
  return axios.get(API_URL + "/insurance/firstInsurances", {
    headers: AuthHeader(),
  });
};
export const insurance2List = () => {
  return axios.get(API_URL + "/insurance/secondInsurances", {
    headers: AuthHeader(),
  });
};

export const loadSingleInsurance = (id) => {
  return axios.get(API_URL + "/insurance/firstInsurance/" + id, {
    headers: AuthHeader(),
  });
};

export const updateInsurance = (id, data) => {
  return axios.put(API_URL + "/insurance/update/" + id, data, {
    headers: { ...AuthHeader(), "Content-Type": "application/json" },
  });
};

export function deleteInsurance(id) {
  return axios.delete(API_URL + "/insurance/delete/" + id, {
    headers: AuthHeader(),
  });
}

export const publicIntervention = () => {
  return axios.get(API_URL + "/treatment/interventions/", {});
};
export const insurancePublic = () => {
  return axios.get(API_URL + "/insurance/publicInsurances", {});
};

export const clinicPublic = () => {
  return axios.get(API_URL + "/hospital/public", {});
};

//INTERVENTIONS

export const addIntervention = (data) => {
  return axios.post(API_URL + "/intervention/register", data, {
    headers: AuthHeader(),
  });
};

export const importInterventions = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return axios.post(API_URL + "/intervention/import", formData, {
    headers: { ...AuthHeader(), "Content-Type": "multipart/form-data" },
  });
};

export const interventionList = () => {
  return axios.get(API_URL + "/intervention/all", {
    headers: AuthHeader(),
  });
};

export const loadSingleIntervention = (id) => {
  return axios.get(API_URL + "/intervention/get/" + id, {
    headers: AuthHeader(),
  });
};

export const updateIntervention = (id, data) => {
  return axios.put(API_URL + "/intervention/update/" + id, data, {
    headers: AuthHeader(),
  });
};

export function deleteIntervention(id) {
  return axios.delete(API_URL + "/intervention/delete/" + id, {
    headers: AuthHeader(),
  });
}

export const singleIntervention = (id) => {
  return axios.get(API_URL + "/intervention/get/" + id, {
    headers: AuthHeader(),
  });
};

// BILL MANAGEMENT
export const addPayment = (data) => {
  return axios.post(API_URL + "/payment/", data, {
    headers: AuthHeader(),
  });
};

export function updateBill(id, data) {
  return axios.put(API_URL + "/payment/update/" + id, data, {
    headers: AuthHeader(),
  });
}

export const allBills = () => {
  return axios.get(API_URL + "/payment/", {
    headers: AuthHeader(),
  });
};

export const getBillsByDateRange = (startDate, endDate) => {
  return axios.get(API_URL + `/payment/${startDate}/${endDate}`, {
    headers: AuthHeader(),
  });
};

export const billDetails = (id) => {
  return axios.get(API_URL + `/payment/get/${id}`, {
    headers: AuthHeader(),
  });
};

export function deleteBill(id) {
  return axios.delete(API_URL + "/payment/delete/" + id, {
    headers: AuthHeader(),
  });
}

// USER MANAGEMENT
export const usersList = () => {
  return axios.get(API_URL + "/auth/users", {
    headers: AuthHeader(),
  });
};

export async function getAllUsers() {
  const res = await axios.get(`${API_URL}/auth/users`, {
    headers: AuthHeader(),
  });
  return res.data;
}
// Admins management
export const signupUser = (data) => {
  return axios.post(API_URL + "/auth/register", data, {
    headers: AuthHeader(),
  });
};

export const GetDoctor = (docEmail) => {
  return axios.get(API_URL + `/auth/${docEmail}`, {
    headers: AuthHeader(),
  });
};

export const userDetails = (id) => {
  return axios.get(API_URL + `/auth/get/${id}`, {
    headers: AuthHeader(),
  });
};

export function updateUser(id, data) {
  return axios.put(API_URL + "/auth/update/" + id, data, {
    headers: AuthHeader(),
  });
}

export function deleteUser(id) {
  return axios.delete(API_URL + "/auth/delete/" + id, {
    headers: AuthHeader(),
  });
}

// Doctors management
export const signupDoctor = (data) => {
  return axios.post(API_URL + "/account/doctorSignup", data, {
    headers: AuthHeader(),
  });
};

export const doctor = () => {
  return axios.get(API_URL + "/account/doctor", {
    headers: AuthHeader(),
  });
};

export const doctorDetailsUser = (id) => {
  return axios.get(API_URL + `/account/doctor/${id}`, {
    headers: AuthHeader(),
  });
};

export function updateDoctor(id, data) {
  return axios.put(API_URL + "/account/doctor/" + id, data, {
    headers: AuthHeader(),
  });
}

export function deleteDoctor(id) {
  return axios.delete(API_URL + "/account/doctor/" + id, {
    headers: AuthHeader(),
  });
}

// Patient as user

export const signupPatient = (data) => {
  return axios.post(API_URL + "/account/patientSignup", data, {
    headers: AuthHeader(),
  });
};

export const patientUserList = () => {
  return axios.get(API_URL + "/patient/allPatients", {
    headers: AuthHeader(),
  });
};

export const getUserPatient = (id) => {
  return axios.get(API_URL + `/account/patient/${id}`, {
    headers: AuthHeader(),
  });
};

export const patientDetailsUser = (id) => {
  return axios.get(API_URL + `/account/patient/${id}`, {
    headers: AuthHeader(),
  });
};
export function updateUserPatient(id, data) {
  return axios.put(API_URL + "/account/patient/" + id, data, {
    headers: AuthHeader(),
  });
}

export function deleteUserPatient(id) {
  return axios.delete(API_URL + "/account/patient/" + id, {
    headers: AuthHeader(),
  });
}

// Cashier as user
export const signupCahier = (data) => {
  return axios.post(API_URL + "/account/cashierSignup", data, {
    headers: AuthHeader(),
  });
};

export const cashiersList = () => {
  return axios.get(API_URL + "/account/cashier", {
    headers: AuthHeader(),
  });
};

export const getCahier = (id) => {
  return axios.get(API_URL + `/account/cashier/${id}`, {
    headers: AuthHeader(),
  });
};

export function updateCahier(id, data) {
  return axios.put(API_URL + "/account/cashier/" + id, data, {
    headers: AuthHeader(),
  });
}

export function deleteCashier(id) {
  return axios.delete(API_URL + "/account/cashier/" + id, {
    headers: AuthHeader(),
  });
}
// User as accountant
export const signupAccountant = (data) => {
  return axios.post(API_URL + "/account/accountantSignup", data, {
    headers: AuthHeader(),
  });
};

export const AccountantsList = () => {
  return axios.get(API_URL + "/account/accountant", {
    headers: AuthHeader(),
  });
};

export const getAccountant = (id) => {
  return axios.get(API_URL + `/account/accountant/${id}`, {
    headers: AuthHeader(),
  });
};

export function updateAccountant(id, data) {
  return axios.put(API_URL + "/account/accountant/" + id, data, {
    headers: AuthHeader(),
  });
}

export function deleteAccountant(id) {
  return axios.delete(API_URL + "/account/accountant/" + id, {
    headers: AuthHeader(),
  });
}
//
export const insurancePatientList = () => {
  return axios.get(API_URL + "/reports/patientByInsurance", {
    headers: AuthHeader(),
  });
};
/**/

// EXPENSES AND TYPES MANAGEMENT
export const addExpenseType = (data) => {
  return axios.post(API_URL + "/expenseType/", data, {
    headers: AuthHeader(),
  });
};

export const allExpenseType = (data) => {
  return axios.get(API_URL + "/expenseType/", data, {
    headers: AuthHeader(),
  });
};

export function loadExpenseType(id) {
  return axios.get(API_URL + "/expenseType/get/" + id, {
    headers: AuthHeader(),
  });
}

export const updateExpenseType = (id, data) => {
  return axios.put(API_URL + "/expenseType/update/" + id, data, {
    headers: AuthHeader(),
  });
};

export function deleteExpenseType(id) {
  return axios.delete(API_URL + "/expenseType/delete/" + id, {
    headers: AuthHeader(),
  });
}

export const newExpense = (data) => {
  return axios.post(API_URL + "/expense/", data, {
    headers: AuthHeader(),
  });
};

export const allExpenses = (data) => {
  return axios.get(API_URL + "/expense/", data, {
    headers: AuthHeader(),
  });
};

export function loadExpense(id) {
  return axios.get(API_URL + "/expense/get/" + id, {
    headers: AuthHeader(),
  });
}

export function deleteExpense(id) {
  return axios.delete(API_URL + "/expense/delete/" + id, {
    headers: AuthHeader(),
  });
}

export function updateExpense(id, data) {
  return axios.put(API_URL + "/expense/update/" + id, data, {
    headers: AuthHeader(),
  });
}

//  SENDING EXCUSE MESSAGES BY PATIENT

export const getAPatientBasedOnEmail = (patientemail) => {
  return axios.get(API_URL + `/patient/patientby/${patientemail}`, {
    headers: AuthHeader(),
  });
};

export const sendMessage = (data) => {
  return axios.post(API_URL + "/message/", data, {
    headers: AuthHeader(),
  });
};

export const viewMessages = (data) => {
  return axios.get(API_URL + "/message/", data, {
    headers: AuthHeader(),
  });
};
export const viewMessage = (id) => {
  return axios.get(API_URL + "/message/get/" + id, {
    headers: AuthHeader(),
  });
};

// PATIENT APPOINTMENT AND TREATMENT SECTION

export const patientAppointments = (query) => {
  return axios.get(API_URL + `/appointment/${query}`, {
    headers: AuthHeader(),
  });
};

// BLOG MANAGEMENT

export const saveBlog = (blogData) => {
  // // The second argument is the request body, which Axios automatically stringifies to JSON.
  return axios.post(API_URL + "/blog/", blogData, {
    headers: AuthHeader(),
  });
};

// export async function saveBlog(blog) {
//   return await axios.post(API_URL + "/blog/", blog);
// }

export async function getSingleBlog(id) {
  return await axios.get(`${API_URL}/${"blog"}/${id}`);
}

export async function getAPublicBlog(id) {
  return await axios.get(`${API_URL}/${"blog"}/${"public"}/${id}`);
}

export const getPublicBlogs = () => {
  return axios.get(API_URL + "/blog/public", {
    headers: AuthHeader(),
  });
};

export function udpateBlog(id, blog) {
  return axios.put(API_URL + "/blog/update/" + id, blog, {
    headers: AuthHeader(),
  });
}

export async function udpateBlogPhoto(formData) {
  return await axios.put(`${API_URL}/${"blog"}/photo`, formData);
}

export function deleteBlog(id) {
  return axios.delete(API_URL + "/blog/delete/" + id, {
    headers: AuthHeader(),
  });
}

/* SURVEY MANAGEMENT/api/v1/survey*/
export const sendSurvey = (formData) => {
  return axios.post(API_URL + "/survey/", formData, {
    headers: AuthHeader(),
  });
};

/*APPOINTMENT BOOKING MANAGEMENT*/
export const bookAppointment = (payload) => {
  return axios.post(API_URL + "/appointment-booking/", payload);
};

export const getBookedAppointments = () => {
  return axios.get(API_URL + "/appointment-booking/", {
    headers: AuthHeader(),
  });
};

export function confirmAppointment(id) {
  // The second argument to put() is the data/body (we'll send null).
  // The third argument is the config object, which is where headers belong.
  return axios.put(
    `${API_URL}/appointment-booking/updatestatus/${id}`,
    null, // or an empty object {} if your backend requires it
    { headers: AuthHeader() },
  );
}

export async function updateStatus(id, status) {
  try {
    const response = await axios.patch(
      `${API_URL}/appointment-booking/${id}/status`,
      null,
      { params: { status }, headers: AuthHeader() },
    );
    return response.data;
  } catch (error) {
    console.error("Error updating appointment status:", error);
    throw error;
  }
}

export function updateAppointmentDateTime(id, date, time) {
  const payload = {
    rendezvousdate: date,
    rendezvoustime: time,
  };
  return axios.put(
    API_URL + "/appointment-booking/updatedateandtime/" + id,
    payload,
    {
      headers: AuthHeader(),
    },
  );
}

/*  Delete a booked appointment
 This function is used to delete a booked appointment by its ID.
 It sends a DELETE request to the API endpoint for appointment booking deletion.
 The ID of the appointment to be deleted is passed as a parameter.
 The request includes authentication headers using the AuthHeader function.
 It returns the result of the axios delete request.
 The API endpoint is constructed using the base API_URL and the specific endpoint for deleting booked appointments
 The endpoint is "/appointment-booking/delete/" followed by the appointment ID.*/

export function deleteBookedAppointment(id) {
  return axios.delete(API_URL + "/appointment-booking/delete/" + id, {
    headers: AuthHeader(),
  });
}

export function getAvailableSlots(date) {
  // Construct the URL exactly as your new controller expects it:
  // GET /api/appointments/available-slots?date=YYYY-MM-DD
  const url = `${API_URL}/appointment-booking/available-slots?date=${date}`;
  // Make the GET request using your project's pattern
  return axios.get(url, {
    headers: AuthHeader(),
  });
}

// ─── WAITING LIST ─────────────────────────────────────────────────────────────
// Currently backed by localStorage so it works without a backend endpoint.
// When the backend is ready, replace each function body with the commented-out
// axios call and delete the localStorage block.
//
// Required backend endpoints:
//   POST   /waiting/register       body: { patientname, patientno, reason, arrivaltime, position }
//   GET    /waiting/               returns: WaitingEntry[]
//   DELETE /waiting/delete/:id
// ─────────────────────────────────────────────────────────────────────────────

export const getWaitingList = () => {
  return axios.get(API_URL + "/waiting/", { headers: AuthHeader() });
};

export const addToWaitingList = (data) => {
  return axios.post(API_URL + "/waiting/register", data, {
    headers: AuthHeader(),
  });
};

export const removeFromWaitingList = (id) => {
  return axios.delete(API_URL + "/waiting/delete/" + id, {
    headers: AuthHeader(),
  });
};

export function getAvailableSlotsForNewRequestedAppointment(rendezvousdate) {
  // 1. Format the Date object into a 'YYYY-MM-DD' string for the API
  const dateStr = rendezvousdate.toISOString().split("T")[0];
  // 2. Construct the correct URL based on your component's code
  // The original component used: `${API_URL}/appointment-booking/available`
  // Make sure this endpoint '/appointment-booking/available' is correct for your backend.
  const url = `${API_URL}/appointment-booking/available`;
  // 3. Make the GET request with the date as a query parameter
  // We use the `params` key, which axios will correctly format into `?rendezvousdate=YYYY-MM-DD`
  return axios.get(url, {
    params: { rendezvousdate: dateStr },
    // You might not need AuthHeader() for a public booking page.
    // If it's for logged-in users, keep it. If not, you can remove it.
    headers: AuthHeader(),
  });
}

export function getAppointmentById(id) {
  return axios.get(API_URL + `/appointment-booking/${id}`, {
    headers: AuthHeader(),
  });
}

// TREATMENT DATE RANGE
export const getTreatmentsByDateRange = (startDate, endDate) => {
  return axios.get(API_URL + `/treatment/${startDate}/${endDate}`, {
    headers: AuthHeader(),
  });
};

// HOSPITAL FILE UPLOADS
export const uploadClinicLogo = (file) => {
  const formData = new FormData();
  formData.append("logo", file);
  return axios.post(API_URL + "/hospital/upload-logo", formData, {
    headers: { ...AuthHeader(), "Content-Type": "multipart/form-data" },
  });
};

export const uploadClinicFavicon = (file) => {
  const formData = new FormData();
  formData.append("favicon", file);
  return axios.post(API_URL + "/hospital/upload-favicon", formData, {
    headers: { ...AuthHeader(), "Content-Type": "multipart/form-data" },
  });
};

export const uploadClinicBackgroundImage = (file) => {
  const formData = new FormData();
  formData.append("backgroundimage", file);
  return axios.post(API_URL + "/hospital/upload-backgroundimage", formData, {
    headers: { ...AuthHeader(), "Content-Type": "multipart/form-data" },
  });
};

export const uploadClinicQrCode = (file) => {
  const formData = new FormData();
  formData.append("qrcode", file);
  return axios.post(API_URL + "/hospital/upload-qrcode", formData, {
    headers: { ...AuthHeader(), "Content-Type": "multipart/form-data" },
  });
};

// OPENING HOURS
export const registerOpeningHours = (data) => {
  return axios.post(API_URL + "/opening-hours/register", data, {
    headers: AuthHeader(),
  });
};

export const getAllOpeningHours = () => {
  return axios.get(API_URL + "/opening-hours/", {
    headers: AuthHeader(),
  });
};

export const getPublicOpeningHours = () => {
  return axios.get(API_URL + "/opening-hours/public");
};

export const updateOpeningHours = (id, data) => {
  return axios.put(API_URL + `/opening-hours/update/${id}`, data, {
    headers: AuthHeader(),
  });
};

export const deleteOpeningHours = (id) => {
  return axios.delete(API_URL + `/opening-hours/delete/${id}`, {
    headers: AuthHeader(),
  });
};
