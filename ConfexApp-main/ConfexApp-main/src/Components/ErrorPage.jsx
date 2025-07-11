import React from "react";
import { useRouteError, Link } from "react-router-dom";

const ErrorPage = () => {
  const error = useRouteError();
  console.error("Route error:", error);
  return (
    <div className="px-4 py-5 my-5 text-center bg-light">
      <h1 className="display-5 fw-bold text-body-emphasis">Oops!</h1>
      <div className="col-lg-6 mx-auto">
        <p className="lead mb-4">
          Sorry, an unexpected error has occurred.
          <br />
          <br />
          <i>{error?.statusText || error?.message || "Unknown error"}</i>
        </p>
        <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
          <Link
            to={"/"}
            className="btn btn-outline-primary btn-lg"
            role="button"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ErrorPage;
