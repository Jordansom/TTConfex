package com.Confex.Administrator;

import com.Confex.Entidades.Administrador;
import com.Confex.Entidades.Conferencista;
import com.Confex.Entidades.Congreso;
import com.Confex.Entidades.CongresoTematica;
import com.Confex.Entidades.Evaluador;
import com.Confex.Entidades.Registrador;
import com.Confex.Entidades.Tematica;
import com.Confex.Entidades.Usuario;
import com.Confex.Excepciones.UsuarioExistenteException;
import com.Confex.Excepciones.UsuarioNoEncontradoException;
import com.Confex.Repositorios.AdministradorRepository;
import com.Confex.Repositorios.ConferencistaRepository;
import com.Confex.Repositorios.CongresoRepository;
import com.Confex.Repositorios.CongresoTematicaRepository;
import com.Confex.Repositorios.EvaluadorRepository;
import com.Confex.Repositorios.EvaluadorTematicasRepository;
import com.Confex.Repositorios.RegistradorRepository;
import com.Confex.Repositorios.TematicaRepository;
import com.Confex.Repositorios.UsuarioRepository;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import javax.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class AdministratorService {
    
    private final AdministradorRepository administradorRepository;
    private final UsuarioRepository usuarioRepository;
    private final CongresoRepository congresoRepository;
    private final EvaluadorRepository evaluadorRepository;
    private final RegistradorRepository registradorRepository;
    private final ConferencistaRepository conferencistaRepository;
    private final TematicaRepository tematicaRepository;
    private final CongresoTematicaRepository congresoTematicaRepository;
    private final EvaluadorTematicasRepository evaluadorTematicasRepository;
    
    public AdministratorService(EvaluadorTematicasRepository evaluadorTematicasRepository, CongresoTematicaRepository congresoTematicaRepository, TematicaRepository tematicaRepository, ConferencistaRepository conferencistaRepository, RegistradorRepository registradorRepository, EvaluadorRepository evaluadorRepository, CongresoRepository congresoRepository, AdministradorRepository administradorRepository, UsuarioRepository usuarioRepository){
        this.administradorRepository = administradorRepository;
        this.usuarioRepository = usuarioRepository;
        this.congresoRepository = congresoRepository;
        this.evaluadorRepository = evaluadorRepository;
        this.registradorRepository = registradorRepository;
        this.conferencistaRepository = conferencistaRepository;
        this.tematicaRepository = tematicaRepository;
        this.congresoTematicaRepository = congresoTematicaRepository;
        this.evaluadorTematicasRepository = evaluadorTematicasRepository;
    }
    
    public Optional<Administrador> logInAdmin(Integer idAdministrador) {
        return administradorRepository
            .findByUsuario_IdUsuario(idAdministrador);
    }
    
    public List<Usuario> findAllUsers (){
        return usuarioRepository.findAll();
    }
    
    public Usuario findUser(String identifier) {
        Usuario usuario = usuarioRepository
            .findByNombreUsuarioOrCorreo(identifier,identifier)
            .orElseThrow(() -> new UsuarioNoEncontradoException("El nombre de usuario o correo no existe o es incorrecto."));
        return usuario;
    }
    
    public Usuario findUserById(Integer idUsuario) {
        Usuario usuario = usuarioRepository
            .findByIdUsuario(idUsuario)
            .orElseThrow(() -> new UsuarioNoEncontradoException("El nombre de usuario o correo no existe o es incorrecto."));
        return usuario;
    }
    
    public void hacerOrganizador(Usuario usuario) {
        Optional<Administrador> administradorExistente = administradorRepository.findByUsuario_IdUsuario(usuario.getIdUsuario());
        if (administradorExistente.isPresent()) {
            Administrador existente = administradorExistente.get();
            throw new UsuarioExistenteException("El usuario: " + existente.getUsuario().getNombreUsuario() + " ya es un administrador con rol "+existente.getRol()+"."); 
        }
        usuarioRepository.save(usuario);
    }
    
    public void quitarOrganizador(Usuario usuario) {
        usuarioRepository.save(usuario);
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
    
    public Boolean buscarTematica(String nombre){
        return tematicaRepository.findByNombre(nombre).isPresent();
    }
    
    public Tematica buscarTematica(Integer idTematica){
        return tematicaRepository.findByIdTematica(idTematica)
                    .orElseThrow(() -> new IllegalArgumentException("Temática no encontrada"));
    }
    
    public Set<Congreso> CongresosPorTematica(Integer idTematica){
        Set<CongresoTematica> ctSet = congresoTematicaRepository.findByTematica_IdTematica(idTematica);
        return ctSet.stream()
                .map(CongresoTematica::getCongreso)
                .collect(Collectors.toSet());
    }
    
    public Set<Evaluador> obtenerEvaluadoresCongresoTematica(Integer idCongreso, Integer idTematica) {
        return evaluadorTematicasRepository.obtenerEvaluadoresPorTematicaYCongreso(idTematica, idCongreso);
    }
    
    public void agregarTematica(Tematica tematica){
        tematicaRepository.save(tematica);
    }
    
    public void borrarTematica(Tematica tematica){
        tematicaRepository.delete(tematica);
    }
}
