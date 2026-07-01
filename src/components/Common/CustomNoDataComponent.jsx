import { FiInbox } from "react-icons/fi";

const CustomNoDataComponent = ({ message, suggestion }) => {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-slate-500">
      <FiInbox size={40} className="mb-2" />
      <p className="text-base font-semibold text-gray-600 dark:text-slate-300 mb-1">
        {message}
      </p>
      {suggestion && <p className="text-sm">{suggestion}</p>}
    </div>
  );
};

export default CustomNoDataComponent;
