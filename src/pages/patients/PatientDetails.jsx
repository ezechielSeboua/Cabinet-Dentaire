import React, { useEffect, useState } from "react";
import NewSidebar from "../../components/NewSidebar";
import { useParams } from "react-router-dom";
import * as fresService from "../../services/fresService";
import * as authService from "../../services/authService";

export default function ClientDetails() {
  const [currentUser] = useState(authService.getCurrentUser());

  const params = useParams();

  const [client, setClient] = useState("");

  const [amount, setAmount] = useState("");


  const singleClient = () => {
    fresService.contractList().then((res) => {
      console.log(
        "CLIENT",
        res.data.filter((x) => x.id === params.id)
      );
      // console.log("TEST")
      setClient(res.data.filter((x) => x.id === params.id));
    });
  };

  useEffect(() => {
    singleClient();
  }, []);

  // var contract1 = document.getElementById('contract').innerHTML;
  const data = {
    agent: currentUser.id,
    contract: params.id,
    amount,
    paymentDate: new Date().toLocaleString(),
  };

  console.log("DADA", data);
  // console.log("CONTRACT", contract1);

  return (
    <section className="flex">
      {/* Side bar here */}
      <NewSidebar />

      {/* Main page here */}

      <div className="mx-auto bg-white rounded-sm  overflow-hidden w-[1200px] md:max-w-7xl mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-3">
            <label className="text-3xl ">BAISIC INFO</label> <br />
            <div className="mb-3 mt-3">
              <div className="relative mb-4 flex w-full flex-wrap items-stretch">
                {client.length > 0 && (
                  <ul>
                    {client.map((client) => (
                      <li key={client.id}>
                        {/* <label className="font-semibold">
                          Enrolment Ref :{" "}
                        </label>{" "}
                        {client.reference} <br />
                        <label className="font-semibold">
                          First Name :{" "}
                        </label>{" "}
                        {client.firstName} <br />
                        <label className="font-semibold">SurName : </label>
                        {client.lastName} <br />
                        <label className="font-semibold">Phone Numer : </label>
                        {client.phoneNumber} <br />
                        <label className="font-semibold"> Village : </label>
                        {client.village} <br />*/}
                        <label className="font-semibold">
                          Contract Reference :{" "}
                        </label> 
                        {client.reference} <br />
                        <label className="font-semibold">
                          Contract offter :{" "}
                        </label>{" "}
                        {client.offer} <br />
                        <label className="font-semibold">
                          Contract Type :{" "}
                        </label>{" "}
                        {client.type} <br />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-3">
            <label className="text-3xl ">Encashment</label>

            <div className="mb-3 mt-3">
              <div className="relative mb-4 flex w-full flex-wrap items-stretch">
                <input
                  type="search"
                  className="relative m-0 -mr-0.5 block w-[1px] min-w-0 flex-auto rounded-l border border-solid border-neutral-300 bg-transparent bg-clip-padding px-3 py-[0.25rem] text-base font-normal leading-[1.6] text-neutral-700 outline-none transition duration-200 ease-in-out focus:z-[3] focus:border-primary focus:text-neutral-700 focus:shadow-[inset_0_0_0_1px_rgb(59,113,202)] focus:outline-none dark:border-neutral-600 dark:text-neutral-200 dark:placeholder:text-neutral-200 dark:focus:border-primary"
                  placeholder="Enter Amount"
                  // onChange={(e) => setQuery(e.target.value)}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />

                <button
                  className="relative z-[2] flex items-center rounded-r bg-primary px-6 py-2.5 text-xs font-medium uppercase leading-tight text-bla shadow-md transition duration-150 ease-in-out hover:bg-primary-700 hover:shadow-lg focus:bg-primary-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-primary-800 active:shadow-lg bg-green-700"
                  type="button"
                  // onClick={fetchData}
                ></button>
              </div>
              {/* <label className="font-semibold">Agent Id:</label>{" "}
              {currentUser.id} <br /> */}
              {/* {client.length > 0 && (
                <ul>
                  {client.map((client) => (
                    <li key={client.id}>
                      <label
                        className="font-semibold"
                        id="contract"
                        name="contract"
                        value={contract}
                        onChange={(e) => setContract(e.target.value)}
                      >
                        TEST
                      </label>{" "}
                      {client.contracts[0]["id"]} <br />
                    </li>
                  ))}
                </ul>
              )} */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
