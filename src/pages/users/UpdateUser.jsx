import React, { useEffect, useState } from "react";
import { updateUser, userDetails } from "../../services/cdiService";
import Select from "react-select";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Header from "../../components/Header";
import SideBar2 from "../../components/SideBar2";
import { useSidebarMargin } from "../../hooks/useSidebarMargin";
import { Bounce, toast } from "react-toastify";

export default function UpdateUser() {
  const sidebarMargin = useSidebarMargin();
  const { id } = useParams();
  const navigate = useNavigate();
  const [firstname] = useState("");
  const [lastname] = useState("");
  const [email] = useState("");
  const [telephone] = useState("");
  const [gender, setGender] = useState("");
  const [password] = useState("");
  const [authorisation, setAuthorisation] = useState("MALE");

  const loadUserInfo = () => {
    userDetails(id).then((res) => {
      setData(res.data);
    });
  };

  useEffect(() => {
    loadUserInfo();
  }, []);

  const [data, setData] = useState({
    firstname,
    authorisation,
    lastname,
    email,
    telephone,
    gender,
    password,
  });

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
    { value: "patient", label: "Patient" },
  ];

  const handleSelectChange = ({ value }) => {
    setGender(value);
  };

  const handleSelectAuthorisationChange = ({ value }) => {
    setAuthorisation(value);
  };

  const updateUserDetails = async (e) => {
    e.preventDefault();
    try {
      Swal.fire({
        title: "Es-tu sûr de cette opération?",
        text: "Vous ne pourrez pas annuler cette opération!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Oui, mettre à jour!",
      })
        .then((result) => {
          if (result.isConfirmed) {
            updateUser(id, data).then((res) => {
              navigate("/user");
            });
            toast.success(
              "Les informations ont été mises à jour avec success!",
              {
                position: "top-right",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
              }
            );
          }
        })
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
            <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-3">
              <div className="text-gray-600">
                <p className="font-medium text-lg">
                  Information Personnelles du patient
                </p>
                <p>Remplissez ce formulaire, s'il vout plait.</p>
              </div>

              <div className="lg:col-span-2">
                <form onSubmit={updateUserDetails}>
                  <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-6">
                    <div className="md:col-span-3">
                      <label for="Status"> Sex ({data.gender}) </label>
                      <Select
                        placeholder="Assignez le sex"
                        options={options}
                        value={data.gender}
                        onChange={(handleSelectChange) =>
                          setData({
                            ...data,
                            gender: handleSelectChange.value,
                          })
                        }
                        isSearchable
                        autoFocus
                        noOptionsMessage={() => "No gender found..."}
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
                      <label for="Status">
                        {" "}
                        Authorisation ({data.authorisation})
                      </label>
                      <Select
                        placeholder="Assignez l'authorisation"
                        options={authorisationOption}
                        value={data.authorisation}
                        onChange={(handleSelectAuthorisationChange) => {
                          setData({
                            ...data,
                            authorisation:
                              handleSelectAuthorisationChange.value,
                          });
                        }}
                        isSearchable
                        autoFocus
                        noOptionsMessage={() => "No authorisation found..."}
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
                        value={data.firstname}
                        onChange={(e) =>
                          setData({
                            ...data,
                            firstname: e.target.value,
                          })
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
                        value={data.lastname}
                        onChange={(e) =>
                          setData({
                            ...data,
                            lastname: e.target.value,
                          })
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
                        value={data.email}
                        onChange={(e) =>
                          setData({
                            ...data,
                            email: e.target.value,
                          })
                        }
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
                        value={data.telephone}
                        onChange={(e) =>
                          setData({
                            ...data,
                            telephone: e.target.value,
                          })
                        }
                        className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                        placeholder="N° de téléphone"
                      />
                    </div>

                    <div className="md:col-span-3 mt-6">
                      <button className="dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]] inline-block  rounded bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-black shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] w-full h-10">
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
    </div>
  );
}
