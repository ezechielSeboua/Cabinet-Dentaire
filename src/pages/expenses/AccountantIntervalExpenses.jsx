import React, { useRef, useState } from "react";
import Header from "../../components/Header";
import SideBar2 from "../../components/SideBar2";
import DataTable from "react-data-table-component";
import { useReactToPrint } from "react-to-print";
import { API_URL } from "../../utils/config";
import { Bounce, toast } from "react-toastify";
import { useSidebarMargin } from "../../hooks/useSidebarMargin";

export default function AccountantIntervalExpenses() {
  const sidebarMargin = useSidebarMargin();
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const componentToPrint = useRef();
  const tableHeaderstyle = {
    headCells: {
      style: {
        fontWeight: "bold",
        fontSize: "14px",
        backgroundColor: "black",
        color: "white",
      },
    },
  };

  const url = `${API_URL}/expense/${startDate}/${endDate}`;
  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      return fetch(url)
        .then((res) => res.json())
        .then((d) => setData(d));
    } catch (err) {
      console.log("Une erreur s'est produite!!: ", err);
      toast.error("Une erreur s'est produite!!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
    }
  };

  let totalsolde = 0;
  data.forEach((d) => {
    totalsolde += d.amount;
  });

  var result = [];
  data.reduce(function (res, amt) {
    if (!res[amt.expense]) {
      res[amt.expense] = {
        DEPENSE: amt.expense,
        amount: 0,
      };
      result.push(res[amt.expense]);
    }
    res[amt.expense].amount += amt.amount;
    return res;
  }, {});

  const sammary = [
    {
      name: "Nom ",
      selector: (row) => (row.DEPENSE ? row.DEPENSE : 0),
    },
    {
      name: "Montant total",
      selector: (row) => (row.amount ? row.amount : 0),
    },
  ];

  const columns = [
    
    {
      name: "Depense ",
      selector: (row) => (row.expense ? row.expense : 0),
    },
    {
      name: "Montant",
      width: "350px",
      selector: (row) => (row.amount ? row.amount : 0),
    },
    {
      name: "Date",
      width: "245px",
      selector: (row) => (row.expenseof ? row.expenseof : ""),
    },
  ];

  const printbill = useReactToPrint({
    content: () => componentToPrint.current,
    documentTitle: "Details de la recette",
  });

  return (
    <div class="min-h-screen flex flex-col flex-auto flex-shrink-0 antialiased bg-white dark:bg-gray-700 text-black dark:text-white">
      <Header />
      <SideBar2 />
      <div className={`h-full ml-0 mt-14 mb-10 ${sidebarMargin}`}>
        <div className="grid grid-cols-1 lg:grid-cols-1 p-4 gap-2">
          <div className="flex flex-wrap items-end gap-3 mb-2">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                Du
              </label>
              <input
                className="w-full sm:w-44 h-10 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
                type="date"
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                Au
              </label>
              <input
                className="w-full sm:w-44 h-10 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
                type="date"
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <button
              className="h-10 px-4 text-sm font-semibold text-white bg-primary-700 hover:bg-primary-800 rounded-md transition-colors cursor-pointer"
              onClick={handleSubmit}
            >
              Voir
            </button>
          </div>

          <div
            className="bg-white rounded shadow-lg p-4 px-4 md:p-8 mb-1 text-2xl"
            ref={componentToPrint}
          >
            <div>
              <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                Total de {totalsolde} Francs CFA
              </div>
            </div>
            <DataTable
              className="-mt-2"
              columns={sammary}
              data={result}
              pagination
              responsive
              fixedHeader
              fixedHeaderScrollHeight="450px"
              selectableRowsHighlight
              highlightOnHover
              customStyles={tableHeaderstyle}
              subHeader
              subHeaderAlign="left"
            />
            <div className="-mt-5 overflow-x-auto">
              <DataTable
                className="-mt-8"
                columns={columns}
                data={data}
                pagination
                responsive
                fixedHeader
                fixedHeaderScrollHeight="450px"
                selectableRowsHighlight
                highlightOnHover
                customStyles={tableHeaderstyle}
                subHeader
                subHeaderAlign="left"
              />
            </div>

            <button
              className="flex items-center gap-2 bg-white text-black font-bold py-2 px-4 rounded w-full  mb-6 text-sm"
              onClick={printbill}
            >
              Cabinet Dentaire Ivoire
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
