package com.Confex.Excepciones;

public class UsuarioExistenteException extends RuntimeException {
    public UsuarioExistenteException(String mensaje) {
        super(mensaje);
    }
}
