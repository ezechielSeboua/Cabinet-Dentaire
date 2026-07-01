import React from "react";
import { BsArrowLeftCircleFill, BsArrowRightCircleFill } from "react-icons/bs";
const Pagination = ({
  totalItems,
  itemsPerPage,
  currentPage,
  setCurrentPage,
}) => {
  let pages = [];

  for (let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++) {
    pages.push(i);
  }
  return (
    <div className="pagination">
      <span>
        <BsArrowLeftCircleFill size={36} />
      </span>
      {pages.map((page, index) => {
        return (
          <button
            className={page === currentPage ? "active" : ""}
            key={index}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        );
      })}
      <span>
        {" "}
        <BsArrowRightCircleFill size={36} />
      </span>
    </div>
  );
};

export default Pagination;
