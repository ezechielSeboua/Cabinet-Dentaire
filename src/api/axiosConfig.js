import axios from "axios";
export default axios.create({
  //Development
  baseURL: "http://localhost:8090/api/v1",
  //Deployment
  // baseURL: "https://cabinetdentaireivoire.com/api"
});
