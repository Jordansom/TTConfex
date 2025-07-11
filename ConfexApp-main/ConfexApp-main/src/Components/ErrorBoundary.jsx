import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="px-4 py-5 my-5 text-center bg-light">
          <h1 className="display-5 fw-bold text-body-emphasis">Oops!</h1>
          <div className="col-lg-6 mx-auto">
            <p className="lead mb-4">
              Sorry, an unexpected error has occurred.
              <br />
              <br />
              <i>
                {this.state.error?.message || "An unexpected error occurred."}
              </i>
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
    return this.props.children;
  }
}

export default ErrorBoundary;
