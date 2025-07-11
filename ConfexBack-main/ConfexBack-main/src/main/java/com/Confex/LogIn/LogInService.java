package com.Confex.LogIn;

import com.Confex.Entidades.Administrador;
import com.Confex.Entidades.Conferencista;
import com.Confex.Entidades.Evaluador;
import com.Confex.Entidades.Ponente;
import com.Confex.Entidades.Registrador;
import com.Confex.Entidades.Usuario;
import com.Confex.Excepciones.PasswordIncorrectoException;
import com.Confex.Excepciones.UsuarioNoEncontradoException;
import com.Confex.Repositorios.AdministradorRepository;
import com.Confex.Repositorios.ConferencistaRepository;
import com.Confex.Repositorios.EvaluadorRepository;
import com.Confex.Repositorios.PonenteRepository;
import com.Confex.Repositorios.RegistradorRepository;
import com.Confex.Repositorios.UsuarioRepository;
import java.util.Optional;
import java.util.Set;
import javax.mail.MessagingException;
import javax.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class LogInService {
    
    private final UsuarioRepository usuarioRepository;
    private final AdministradorRepository administradorRepository;
    private final EvaluadorRepository evaluadorRepository;
    private final RegistradorRepository registradorRepository;
    private final ConferencistaRepository conferencistaRepository;
    private final PonenteRepository ponenteRepository;

    public LogInService(PonenteRepository ponenteRepository, ConferencistaRepository conferencistaRepository, RegistradorRepository registradorRepository, EvaluadorRepository evaluadorRepository, UsuarioRepository usuarioRepository, AdministradorRepository administradorRepository) {
        this.usuarioRepository = usuarioRepository;
        this.administradorRepository = administradorRepository;
        this.evaluadorRepository = evaluadorRepository;
        this.registradorRepository = registradorRepository;
        this.conferencistaRepository = conferencistaRepository;
        this.ponenteRepository = ponenteRepository;
    }
    
    public Usuario logIn(String identifier, String password) {
        Usuario usuario = usuarioRepository
            .findByNombreUsuarioOrCorreo(identifier,identifier)
            .orElseThrow(() -> new UsuarioNoEncontradoException("El nombre de usuario o correo no existe o es incorrecto."));
        if (!usuario.getPassword().equals(password)) {
            throw new PasswordIncorrectoException("La contraseña es incorrecta.");
        }
        return usuario;
    }
    
    public Optional<Administrador> logInAdmin(Integer idUsuario) {
        return administradorRepository
            .findByUsuario_IdUsuario(idUsuario);
    }
    
    public Set<Evaluador> logInEvaluador(Integer idUsuario) {
        return evaluadorRepository
            .findByUsuario_IdUsuario(idUsuario);
    }
    
    public Set<Registrador> logInRegistrador(Integer idUsuario) {
        return registradorRepository
            .findByUsuario_IdUsuario(idUsuario);
    }
    
    public Set<Conferencista> logInConferencista(Integer idUsuario) {
        return conferencistaRepository
            .findByUsuario_IdUsuario(idUsuario);
    }
    
    public Set<Ponente> logInPonente(Integer idUsuario) {
        return ponenteRepository
            .findByUsuario_IdUsuario(idUsuario);
    }
    
    public Usuario existeCorreo(String identifier) throws MessagingException {
        Usuario usuario = usuarioRepository.findByNombreUsuarioOrCorreo(identifier,identifier)
                .orElseThrow(() -> new UsuarioNoEncontradoException("No se encontró ninguna cuenta con ese nombre de usuario o correo."));
        return usuario;
    }
    
    public void save(Usuario usuario) {
        usuarioRepository.save(usuario);
    }
}
