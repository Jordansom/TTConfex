package com.Confex.Excepciones;

public class PasswordIncorrectoException extends RuntimeException {
    public PasswordIncorrectoException(String mensaje) {
        super(mensaje);
    }
}
