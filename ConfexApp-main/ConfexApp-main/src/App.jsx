import React from "react";
import { RouterProvider } from "react-router-dom";
import ErrorBoundary from "./Components/ErrorBoundary.jsx";

const App = ({ router }) => {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default App;
