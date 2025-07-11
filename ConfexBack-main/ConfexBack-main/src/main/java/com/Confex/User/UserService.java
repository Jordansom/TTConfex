package com.Confex.User;

import com.Confex.Entidades.Administrador;
import com.Confex.Entidades.Conferencista;
import com.Confex.Entidades.Congreso;
import com.Confex.Entidades.Evaluador;
import com.Confex.Entidades.Ponente;
import com.Confex.Entidades.Registrador;
import com.Confex.Entidades.Usuario;
import com.Confex.Excepciones.PasswordIncorrectoException;
import com.Confex.Excepciones.UsuarioExistenteException;
import com.Confex.Excepciones.UsuarioNoEncontradoException;
import com.Confex.Repositorios.AdministradorRepository;
import com.Confex.Repositorios.ConferencistaRepository;
import com.Confex.Repositorios.CongresoRepository;
import com.Confex.Repositorios.EvaluadorRepository;
import com.Confex.Repositorios.PonenteRepository;
import com.Confex.Repositorios.RegistradorRepository;
import com.Confex.Repositorios.UsuarioRepository;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.Set;
import javax.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class UserService {
    
    private final UsuarioRepository usuarioRepository;
    private final CongresoRepository congresoRepository;
    private final AdministradorRepository administradorRepository;
    private final EvaluadorRepository evaluadorRepository;
    private final RegistradorRepository registradorRepository;
    private final ConferencistaRepository conferencistaRepository;
    private final PonenteRepository ponenteRepository;
    
    public UserService(PonenteRepository ponenteRepository, ConferencistaRepository conferencistaRepository, RegistradorRepository registradorRepository, EvaluadorRepository evaluadorRepository, CongresoRepository congresoRepository, UsuarioRepository usuarioRepository, AdministradorRepository administradorRepository) {
        this.usuarioRepository = usuarioRepository;
        this.administradorRepository = administradorRepository;
        this.congresoRepository = congresoRepository;
        this.evaluadorRepository = evaluadorRepository;
        this.registradorRepository = registradorRepository;
        this.conferencistaRepository = conferencistaRepository;
        this.ponenteRepository = ponenteRepository;
    }
    
    public void update(Usuario usuario) {
        Set<Usuario> conflictos = usuarioRepository.findConflictosAlActualizar(
            usuario.getNombreUsuario(),
            usuario.getCorreo(),
            usuario.getIdUsuario()
        );
        conflictos.stream().map(existente -> {
            if (existente.getNombreUsuario().equals(usuario.getNombreUsuario())) {
                throw new UsuarioExistenteException("El nombre de usuario: " + usuario.getNombreUsuario() + " ya existe.");
            }
            return existente;
        }).filter(existente -> (existente.getCorreo().equals(usuario.getCorreo()))).forEachOrdered(_item -> {
            throw new UsuarioExistenteException("El correo: " + usuario.getCorreo() + " ya existe.");
        });
        usuarioRepository.save(usuario);
    }
    
    public void delete(Integer idUsuario, String password) {
        Usuario usuario = usuarioRepository.findByIdUsuario(idUsuario)
            .orElseThrow(() -> new UsuarioNoEncontradoException("El usuario no existe."));
        if (!usuario.getPassword().equals(password)) {
            throw new PasswordIncorrectoException("La contraseña es incorrecta.");
        } 
        usuarioRepository.delete(usuario);
    }
    
    public Usuario search(Integer idUsuario) {
        return usuarioRepository.findByIdUsuario(idUsuario)
            .orElseThrow(() -> new UsuarioNoEncontradoException("El usuario no existe."));
    }
    
    public Usuario searchByNameOrEmail(String identifier) {
        Usuario usuario = usuarioRepository
            .findByNombreUsuarioOrCorreo(identifier,identifier)
            .orElseThrow(() -> new UsuarioNoEncontradoException("El nombre de usuario o correo no existe o es incorrecto."));
        return usuario;
    }
    
    public boolean existeCorreo(String correo) {
        return usuarioRepository.findByCorreo(correo).isPresent();
    }
    
    public Optional<Administrador> IsAdmin(Integer idAdministrador) {
        return administradorRepository
            .findByUsuario_IdUsuario(idAdministrador);
    }
    
    public Boolean verifyPassword(Integer idUsuario, String password) {
        Usuario usuario = usuarioRepository
            .findByIdUsuario(idUsuario)
            .orElseThrow(() -> new UsuarioNoEncontradoException("El usuario no existe."));
        if (!usuario.getPassword().equals(password)) {
            throw new PasswordIncorrectoException("La contraseña es incorrecta.");
        }
        return true;
    }
    
    public String obtenerCorreoOrganizador(Integer idCongreso) {
        Optional<Congreso> congreso = congresoRepository.findByIdCongreso(idCongreso);
        return congreso.map(c -> c.getAdministrador().getUsuario().getCorreo())
                .orElseThrow(() -> new NoSuchElementException("Congreso no encontrado "));
    }
    
    public Set<Congreso> obtenerCongresosComoOrganizador(Integer idAdministrador) {
        return congresoRepository.findFullByAdministrador(idAdministrador);
    }
    
    public Set<Evaluador> obtenerEvaluadoresCongreso(Integer idCongreso) {
        return evaluadorRepository.findByCongreso_IdCongreso(idCongreso);
    }
    
    public Set<Registrador> obtenerRegistradoresCongreso(Integer idCongreso) {
        return registradorRepository.findByCongreso_IdCongreso(idCongreso);
    }
    
    public Set<Conferencista> obtenerConferencistasCongreso(Integer idCongreso) {
        return conferencistaRepository.findByCongreso_IdCongreso(idCongreso);
    }
    
    public Set<Congreso> obtenerCongresosComoEvaluador(Integer idUsuario) {
        return evaluadorRepository.findCongresosByIdUsuario(idUsuario);
    }
    
    public Set<Congreso> obtenerCongresosComoRegistrador(Integer idUsuario) {
        return registradorRepository.findCongresosByIdUsuario(idUsuario);
    }
    
    public Set<Congreso> obtenerCongresosComoConferencista(Integer idUsuario) {
        return conferencistaRepository.findCongresosByIdUsuario(idUsuario);
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
}
