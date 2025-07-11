package com.Confex.SignUp;

import com.Confex.Entidades.Usuario;
import com.Confex.Excepciones.UsuarioExistenteException;
import com.Confex.Repositorios.UsuarioRepository;
import java.util.Optional;
import javax.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class SignUpService {
    
    private final UsuarioRepository usuarioRepository;
    
     public SignUpService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }
    
    public void save(Usuario usuario) {
        Optional<Usuario> usuarioExistente = usuarioRepository.findByNombreUsuarioOrCorreo(usuario.getNombreUsuario(), usuario.getCorreo());
        if (usuarioExistente.isPresent()) {
            Usuario existente = usuarioExistente.get();
            if (existente.getNombreUsuario().equals(usuario.getNombreUsuario())) {
                throw new UsuarioExistenteException("El nombre de usuario: " + usuario.getNombreUsuario() + " ya existe.");
            } else {
                throw new UsuarioExistenteException("El correo: " + usuario.getCorreo() + " ya existe.");
            }
        }
        usuarioRepository.save(usuario);
    }
    
    public boolean existeNombreUsuario(String nombreUsuario) {
        return usuarioRepository.findByNombreUsuarioOrCorreo(nombreUsuario,nombreUsuario).isPresent();
    }
    
    public boolean existeCorreo(String correo) {
        return usuarioRepository.findByCorreo(correo).isPresent();
    }
}
