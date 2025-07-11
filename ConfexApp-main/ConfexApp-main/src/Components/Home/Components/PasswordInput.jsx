import React, { useState } from "react";
import { Eye, EyeSlash } from "react-bootstrap-icons";

const PasswordInput = React.forwardRef(
  ({ placeholder, className1, className2, ...props }, ref) => {
    const [show, setShow] = useState(false);

    return (
      <div className={className1 ? className1 : "form-floating"}>
        <input
          {...props}
          ref={ref}
          type={show ? "text" : "password"}
          autoComplete="off"
          className={className2 ? className2 : "form-control custom-input text-center fw-bold"}
          placeholder={placeholder}
        />
        <span
          onClick={() => setShow((v) => !v)}
          style={{
            position: "absolute",
            right: 20,
            top: "50%",
            transform: "translateY(-50%)",
            cursor: "pointer",
            color: "white",
            zIndex: 2,
          }}
        >
          {show ? <EyeSlash /> : <Eye />}
        </span>
      </div>
    );
  }
);

export default PasswordInput;
