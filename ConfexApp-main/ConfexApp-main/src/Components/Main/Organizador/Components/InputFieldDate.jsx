import React from "react";
import { Controller } from "react-hook-form";
import DatePicker from "react-datepicker";

const InputFieldDate = ({
  label,
  name,
  control,
  errors,
  rules,
  minDate,
  maxDate,
  showTimeSelect = true,
  disabled = false,
  restrictTimeToNow = false, 
}) => (
  <div className="form-floating">
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => {
        const selected = field.value ? new Date(field.value) : null;

        const isMinDateToday =
          minDate &&
          new Date(minDate).toDateString() === new Date().toDateString();

        const isSelectedMinDate =
          selected &&
          minDate &&
          new Date(selected).toDateString() ===
            new Date(minDate).toDateString();

        let minTime = new Date(0, 0, 0, 0, 0);
        if (restrictTimeToNow && (isSelectedMinDate || (!selected && isMinDateToday))) {
          const now = new Date();
          minTime = new Date(0, 0, 0, now.getHours(), now.getMinutes() + 1);
        }

        return (
          <DatePicker
            id={field.name}
            name={field.name}
            className={`form-control custom-input-gold text-center fw-bold ${
              disabled ? "input-disabled-dark" : ""
            }`}
            onChange={(date) => {
              const selectedDate = new Date(date);
              const min = minDate ? new Date(minDate) : null;
              if (min && selectedDate < min) {
                const corrected = new Date(min);
                corrected.setHours(
                  selectedDate.getHours(),
                  selectedDate.getMinutes()
                );
                field.onChange(corrected);
              } else {
                field.onChange(selectedDate);
              }
            }}
            placeholderText={label}
            selected={selected}
            onBlur={field.onBlur}
            showTimeSelect={showTimeSelect}
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="yyyy-MM-dd HH:mm"
            minDate={minDate}
            maxDate={maxDate}
            minTime={minTime}
            maxTime={new Date(0, 0, 0, 23, 59)}
            disabled={disabled}
            autoComplete="off"
            wrapperClassName="w-100"
            popperClassName="datepicker-dark"
          />
        );
      }}
    />
    {errors[name] && (
      <small className="custom-font-Extrasmall fw-bold">
        {errors[name].message}
      </small>
    )}
  </div>
);

export default InputFieldDate;
