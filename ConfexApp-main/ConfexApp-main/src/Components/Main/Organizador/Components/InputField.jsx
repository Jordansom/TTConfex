import React from "react";
import { Controller } from "react-hook-form";

const InputField = ({
  label,
  name,
  type = "text",
  control,
  errors,
  validationRules,
  inputProps = {},
}) => (
  <div className="form-floating p-0">
    <Controller
      name={name}
      control={control}
      rules={validationRules}
      defaultValue=""
      render={({ field }) => (
        <>
          <input
            {...field}
            {...inputProps}
            type={type}
            className="form-control custom-input-gold text-center fw-bold"
            placeholder={label}
            autoComplete="off"
            id={name}
            min={type === "number" ? 1 : undefined}
          />
          {errors[name] && (
            <small className="custom-font-Extrasmall fw-bold">
              {errors[name].message}
            </small>
          )}
        </>
      )}
    />
  </div>
);

export default InputField;
