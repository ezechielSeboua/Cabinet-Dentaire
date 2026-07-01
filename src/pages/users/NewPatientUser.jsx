import React, { useState } from "react";
import * as cdiService from "../../services/cdiService";

import Select from "react-select";
import { useNavigate, useParams } from "react-router-dom";

import { Tab } from "@headlessui/react";
import Header from "../../components/Header";
import SideBar2 from "../../components/SideBar2";
import { useSidebarMargin } from "../../hooks/useSidebarMargin";

export default function NewPatientUser() {
  const sidebarMargin = useSidebarMargin();

  const navigate = useNavigate();
  const { id } = useParams();

  console.log("PATIENT ID", id)
  // const [username, setUsername] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("MALE");

  const options = [
    { value: "MALE", label: "Male" },
    { value: "FEMALE", label: "Femele" },
    { value: "OTHER", label: "Autre" },
  ];

  const handleSelectChange = ({ value }) => {
    // console.log("SELECTED GENDER ", value);
    setGender(value);
  };

  

  const data = {
    firstname,
    lastname,
    email,
    password,
    telephone,
    gender,
    patient_id:id
  };

  console.log("DATA + ", data);

  const CreatePatientUser = async (e) => {
    e.preventDefault();
    try {
      cdiService
        .signupPatient(data)
        .then(
          (res) => {
            console.log("CHECKING DATA", res.data);
            navigate("/user");
          },
          (error) => {
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
      <Header />
      <SideBar2 />
      <div className={`h-full ml-0 mt-14 mb-10 ${sidebarMargin}`}>
        <div className="grid grid-cols-1 lg:grid-cols-1 p-4 gap-2">
          <div className="bg-white rounded shadow-lg p-4 px-4 md:p-8 mb-6">
            <div className="mt-10">
              <Tab.Group>
                <Tab.List>
                  <Tab className="mr-4 ml-4 pr-4"> PATIENT</Tab>
                </Tab.List>
                <Tab.Panels> 
                 
                  <Tab.Panel>
                    <div className="container max-w-screen-lg mx-auto">
                      <div>
                        <div className="bg-white rounded shadow-lg p-4 px-4 md:p-8 mb-6">
                          <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-3">
                            <div className="text-gray-600">
                              <p className="font-medium text-lg">
                                Information Personnelles du ou de la patient(e)
                              </p>
                              <p>Remplissez ce formulaire, s'il vout plait.</p>
                            </div>
                            <div className="lg:col-span-2">
                              <form onSubmit={CreatePatientUser}>
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
                                    <label for="address">Prénoms</label>
                                    <input
                                      type="text"
                                      name="firstname"
                                      value={firstname}
                                      onChange={(e) =>
                                        setFirstname(e.target.value)
                                      }
                                      className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
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

                                  <div className="md:col-span-3">
                                    <label for="password">Mot de passe</label>
                                    <input
                                      type="password"
                                      name="password"
                                      required
                                      value={password}
                                      onChange={(e) =>
                                        setPassword(e.target.value)
                                      }
                                      className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                                      placeholder="Mot de passe"
                                    />
                                  </div>
                                  <div className="md:col-span-3 mt-2">
                                    <button 
                                      className="dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]] inline-block  rounded bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-black shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] w-full">
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
