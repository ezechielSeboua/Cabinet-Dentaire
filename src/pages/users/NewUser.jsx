import React, { useEffect, useState } from "react";
import * as cdiService from "../../services/cdiService";
import Select from "react-select";
import { Link, useNavigate } from "react-router-dom";
import { Tab } from "@headlessui/react";
import Header from "../../components/Header";
import SideBar2 from "../../components/SideBar2";
import { useSidebarMargin } from "../../hooks/useSidebarMargin";
import { MdSick } from "react-icons/md";
import Swal from "sweetalert2";

export default function NewUser() {
  const sidebarMargin = useSidebarMargin();
  const Alert = () => {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Erreur pendant l'enregistrement!",
      footer:
        "Les champs sont obligatoire et les numero de telephone sont uniques",
      width: "400px",
      confirmButtonColor: "#000000",
      allowOutsideClick: false,
    });
  };

  const [record, setRecord] = useState([]);
  const [filterrecords, setFilterRecords] = useState([]);
  const columns = [
    {
      name: "#",
      selector: (row) => row.id,
      sortable: true,
    },
    {
      name: " Prénoms & Nom",
      selector: (row) => row.firstname + " " + row.lastname,
      sortable: true,
    },
    {
      name: "Assurance",
      selector: (row) => row.insurance,
      sortable: true,
    },
    {
      name: "Assigner",
      cell: (row) => (
        <Link Link to={`/user/create-patient-user/${row.id}`}>
          <MdSick size={20} className="" />
        </Link>
      ),
    },
  ];

  const allClients = () => {
    cdiService.patientList().then((res) => {
      setRecord(res.data);
      setFilterRecords(res.data);
    });
  };

  useEffect(() => {
    allClients();
  }, []);

  // const search = (event) => {
  //   const newData = filterrecords.filter(
  //     (row) =>
  //       (row.firstname + " " + row.lastname)
  //         .toLowerCase()
  //         .includes(event.target.value.toLowerCase()) ||
  //       row.insurance
  //         .toLowerCase()
  //         .includes(event.target.value.toLowerCase()) ||
  //       row.id.toString().includes(event.target.value.toLowerCase())
  //   );
  //   setRecord(newData);
  // };

  // const tableHeaderstyle = {
  //   headCells: {
  //     style: {
  //       fontWeight: "bold",
  //       fontSize: "14px",
  //       backgroundColor: "black",
  //       color: "white",
  //     },
  //   },
  // };

  const navigate = useNavigate();

  // const [username, setUsername] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  // const [password] = useState("");
  // const [password, setPassword] = useState("");
  const [gender, setGender] = useState("MALE");
  const [authorisation, setAuthorisation] = useState("MALE");

  const options = [
    { value: "MALE", label: "Male" },
    { value: "FEMELE", label: "Femele" },
    { value: "AUTRE", label: "Autre" },
  ];



  const authorisationOption = [
    { value: "admin", label: "Administrateur" },
    { value: "doctor", label: "Docteur" },
    { value: "cashier", label: "Receptioniste" },
    { value: "accountant", label: "Comptable" },
    { value: "patient", label: "Patient" }
  ];

  const handleSelectChange = ({ value }) => {
    console.log("SELECTED GENDER ", value);
    setGender(value);
  };

  const handleSelectAuthorisationChange = ({ value }) => {
    console.log("SELECTED Authorisation ", value);
    setAuthorisation(value);
  };

  var randomstring = Math.random().toString(36).slice(-8);
  // console.log("Le mot de passe " + randomstring);

  const data = {
    authorisation,
    firstname,
    lastname,
    email,
    password:randomstring,
    telephone,
    gender,
  };

  console.log("DATA + ", data);

  const CreateAdminUser = async (e) => {
    e.preventDefault();
    try {
      cdiService
        .signupUser(data)
        .then(
          (res) => {
            console.log("CHECKING DATA", res.data);
            navigate("/user");
          },
          (error) => {
            Alert();
            console.log(error);
          }
        )
        .catch((error) => {
          console.log("ERROR", error.res);
        });
    } catch (err) {
      console.log(err);
    }
  };

 

  return (
    <div class="min-h-screen flex flex-col flex-auto flex-shrink-0 antialiased bg-white dark:bg-gray-700 text-black dark:text-white">
      <SideBar2 />
      <div class="h-14 bg-white dark:bg-gray-800 shadow-md fixed w-full z-10 top-0 left-0 border-b border-gray-200 dark:border-gray-600">
        <Header />
      </div>
      <div className={`h-full ml-0 mt-14 mb-10 ${sidebarMargin}`}>
        <div className="grid grid-cols-1 lg:grid-cols-1 p-4 gap-2">
          <div className="bg-white rounded shadow-lg p-4 px-4 md:p-8 mb-6">
            <div className="mt-10">
              <Tab.Group>
                <Tab.Panels>
                  {/* Admin creation */}
                  <Tab.Panel>
                    <div className="container max-w-screen-lg mx-auto">
                      <div>
                        <div className="bg-white rounded shadow-lg p-4 px-4 md:p-8 mb-6">
                          <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-3">
                            <div className="text-gray-600">
                              <p className="font-medium text-lg">
                                Information Personnelles de l'Administrateur
                              </p>
                              <p>Remplissez ce formulaire, s'il vout plait.</p>
                            </div>

                            <div className="lg:col-span-2">
                              <form onSubmit={CreateAdminUser}>
                                <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-6">
                                  <div className="md:col-span-3">
                                    <label for="Status"> Sex</label>
                                    <Select
                                      required
                                      placeholder="Assignez le sex"
                                      options={options}
                                      onChange={handleSelectChange}
                                      isSearchable
                                      autoFocus
                                      noOptionsMessage={() =>
                                        "No gender found..."
                                      }
                                      styles={{
                                        placeholder: (baseStyles, state) => ({
                                          ...baseStyles,
                                          color: "red",
                                        }),
                                        dropdownIndicator: () => ({
                                          color: "red",
                                        }),
                                      }}
                                    />
                                  </div>
                                  <div className="md:col-span-3">
                                    <label for="Status"> Authorisation</label>
                                    <Select
                                      required
                                      placeholder="Assignez le sex"
                                      options={authorisationOption}
                                      onChange={handleSelectAuthorisationChange}
                                      isSearchable
                                      autoFocus
                                      noOptionsMessage={() =>
                                        "No authorisation found..."
                                      }
                                      styles={{
                                        placeholder: (baseStyles, state) => ({
                                          ...baseStyles,
                                          color: "red",
                                        }),
                                        dropdownIndicator: () => ({
                                          color: "red",
                                        }),
                                      }}
                                    />
                                  </div>
                                  <div className="md:col-span-3">
                                    <label for="prenom">
                                      <span className="my-4">Prénoms</span>
                                    </label>
                                    <input
                                      type="text"
                                      name="firstname"
                                      value={firstname}
                                      onChange={(e) =>
                                        setFirstname(e.target.value)
                                      }
                                      className="h-10 border  rounded px-4 w-full bg-gray-50 mt-1 "
                                      placeholder=""
                                      required
                                    />
                                  </div>

                                  <div className="md:col-span-3">
                                    <label for="city">Nom</label>
                                    <input
                                      type="text"
                                      required
                                      name="lastname"
                                      value={lastname}
                                      onChange={(e) =>
                                        setLastname(e.target.value)
                                      }
                                      className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                                      placeholder=""
                                    />
                                  </div>

                                  <div className="md:col-span-3">
                                    <label for="address">Email</label>
                                    <input
                                      type="email"
                                      name="email"
                                      required
                                      value={email}
                                      onChange={(e) => setEmail(e.target.value)}
                                      className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                                      placeholder=""
                                    />
                                  </div>

                                  <div className="md:col-span-3">
                                    <label for="address">N° Téléphone</label>
                                    <input
                                      type="text"
                                      name="telephone"
                                      required
                                      value={telephone}
                                      onChange={(e) =>
                                        setTelephone(e.target.value)
                                      }
                                      className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                                      placeholder="N° de téléphone"
                                    />
                                  </div>

                                  <div className="md:col-span-3 hidden">
                                    <label for="password">Mot de passe</label>
                                    <input
                                      // type="password"
                                      // name="password"
                                      // required
                                      // value={password}
                                      // onChange={(e) =>
                                      //   setPassword(e.target.value)
                                      // }
                                      className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                                      placeholder="Mot de passe"
                                    />
                                  </div>
                                  <div className="md:col-span-3 mt-2">
                                    <button className="dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]] inline-block  rounded bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-black shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] w-full">
                                      Sauvegarder
                                    </button>
                                  </div>
                                </div>
                              </form>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
