import React, { useState } from "react";
import { Controller } from "react-hook-form";

const TagInput = ({ control, name, errors, label, minLength = 5 }) => {
  const [inputValue, setInputValue] = useState("");

  return (
    <Controller
      name={name}
      control={control}
      rules={{
        validate: (tags) =>
          !tags ||
          tags.length === 0 ||
          tags.every((tag) => tag.length >= minLength) ||
          `*Cada temática debe tener al menos ${minLength} caracteres.`,
      }}
      render={({ field }) => (
        <div className="mb-3">
          <div className="h-100 w-100"
            style={{
              display: "flex",
              width: "100%",
              alignItems: "stretch",
            }}
          >
            <div
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.07)",
                border: "2px solid #B8860B",
                borderRadius: "30px 0 0 30px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                minHeight: "56px",
                padding: 0,
                marginRight: "-2px",
              }}
            >
              <input
                id={`${name}-taginput`}
                autoComplete="off"
                type="text"
                className="fw-bold custom-input-trasnparent text-center"
                style={{
                  border: "none",
                  boxShadow: "none",
                  background: "transparent",
                  outline: "none",
                  width: "100%",
                  height: "50%",
                  fontFamily: "Jura, sans-serif",
                  fontSize: "clamp(15px, 3vw, 22px)",
                  padding: "10px 10px 10px 10px",
                  color: "#fff",
                  borderRadius: "30px 0 0 0",
                  textAlign: "center",
                  alignSelf: "flex-start",
                  display: "flex",
                  alignItems: "flex-start",
                }}
                placeholder={label}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    (e.key === "Enter" || e.key === ",") &&
                    inputValue.trim().length >= minLength
                  ) {
                    e.preventDefault();
                    if (!field.value?.includes(inputValue.trim())) {
                      field.onChange([
                        ...(field.value || []),
                        inputValue.trim(),
                      ]);
                    }
                    setInputValue("");
                  }
                  if (
                    e.key === "Backspace" &&
                    inputValue === "" &&
                    field.value?.length > 0
                  ) {
                    field.onChange(field.value.slice(0, -1));
                  }
                }}
              />
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "4px",
                  minHeight: "22px",
                  padding: "4px 18px 8px 18px",
                  width: "100%",
                }}
                onClick={() => {
                  document.getElementById(`${name}-taginput`).focus();
                }}
              >
                {(field.value || []).map((tag, idx) => (
                  <span
                    key={tag}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      backgroundColor: "#b8860b",
                      borderRadius: "12px",
                      padding: "1px 6px 1px 8px",
                      marginRight: "2px",
                      marginBottom: "2px",
                      fontSize: "clamp(15px, 3vw, 22px)",
                      height: "22px",
                    }}
                  >
                    <span
                      style={{
                        color: "#23272b",
                        fontWeight: "bold",
                        fontSize: "clamp(15px, 3vw, 22px)",
                        fontFamily: "Jura, sans-serif",
                      }}
                    >
                      {tag}
                    </span>
                    <button
                      type="button"
                      aria-label="Eliminar"
                      onClick={() => {
                        field.onChange(field.value.filter((_, i) => i !== idx));
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginLeft: "6px",
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        cursor: "pointer",
                        borderRadius: "50%",
                        width: "18px",
                        height: "18px",
                        color: "#23272b",
                        transition: "background 0.2s, color 0.2s",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = "#b8860b";
                        e.currentTarget.style.color = "#fff";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#23272b";
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12">
                        <line
                          x1="2"
                          y1="2"
                          x2="10"
                          y2="10"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <line
                          x1="10"
                          y1="2"
                          x2="2"
                          y2="10"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <button
              type="button"
              className="btn btn-outline-light custom-btn-gold2 fw-bold"
              style={{
                borderRadius: "0 30px 30px 0",
                padding: "0px 18px",
                borderLeft: "none",
                marginLeft: 0,
                height: "auto",
                alignSelf: "stretch",
              }}
              onClick={() => {
                if (
                  inputValue.trim().length >= minLength &&
                  !field.value?.includes(inputValue.trim())
                ) {
                  field.onChange([...(field.value || []), inputValue.trim()]);
                  setInputValue("");
                }
              }}
              disabled={inputValue.trim().length < minLength}
            >
              Agregar
            </button>
          </div>
          {errors[name] && (
            <small className="custom-font-Extrasmall fw-bold">
              {errors[name].message}
            </small>
          )}
        </div>
      )}
    />
  );
};

export default TagInput;
