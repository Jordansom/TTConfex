package com.Confex.Congress;

import com.Confex.DataTransferObjects.TematicasDTO;
import com.Confex.Entidades.Administrador;
import com.Confex.Entidades.Conferencista;
import com.Confex.Entidades.Congreso;
import com.Confex.Entidades.Tematica;
import com.Confex.Entidades.Usuario;
import com.Confex.Entidades.Ponencia;
import com.Confex.Entidades.Registrador;
import com.Confex.Excepciones.CongresoExistenteException;
import com.Confex.Repositorios.AdministradorRepository;
import com.Confex.Repositorios.AsistenciaRepository;
import com.Confex.Repositorios.AsistenteRepository;
import com.Confex.Repositorios.CongresoRepository;
import com.Confex.Repositorios.TematicaRepository;
import com.Confex.Repositorios.UsuarioRepository;
import com.Confex.Repositorios.PonenciaRepository;
import com.Confex.Repositorios.ConferencistaRepository;
import com.Confex.Repositorios.RegistradorRepository;

import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.stereotype.Service;
import com.Confex.Repositorios.RegistradorRepository;
import org.hibernate.Hibernate;

@Service
@Transactional
public class CongressService {
    
    private final AdministradorRepository administradorRepository;
    private final UsuarioRepository usuarioRepository;
    private final CongresoRepository congresoRepository;
    private final TematicaRepository tematicaRepository;
    private final PonenciaRepository ponenciaRepository;
    private final ConferencistaRepository conferencistaRepository;
    private final RegistradorRepository registradorRepository;
    private final AsistenteRepository asistenteRepository;


    public CongressService(
        UsuarioRepository usuarioRepository,
        AdministradorRepository administradorRepository,
        CongresoRepository congresoRepository,
        TematicaRepository tematicaRepository,
        PonenciaRepository ponenciaRepository,
        AsistenciaRepository asistenciaRepository,
        AsistenteRepository asistenteRepository,
        ConferencistaRepository conferencistaRepository,
        RegistradorRepository registradorRepository
    ) {
        this.administradorRepository = administradorRepository;
        this.congresoRepository = congresoRepository;
        this.tematicaRepository = tematicaRepository;
        this.usuarioRepository = usuarioRepository;
        this.ponenciaRepository = ponenciaRepository;
        this.asistenteRepository = asistenteRepository;
        this.conferencistaRepository = conferencistaRepository;
        this.registradorRepository = registradorRepository;
    }
    
    public void save(Congreso congreso) {
        Optional<Congreso> congresoExistente = congresoRepository.findByNombre(congreso.getNombre());
        if (congresoExistente.isPresent()) {
            throw new CongresoExistenteException("El congreso: " + congreso.getNombre() + " ya existe.");
        }
        congresoRepository.save(congreso);
    }
    
    public Optional<Usuario> searchUser(Integer idUsuario) {
        return usuarioRepository.findByIdUsuario(idUsuario);
    }

    public Optional<Administrador> logInAdmin(Integer idAdministrador) {
        return administradorRepository
            .findByUsuario_IdUsuario(idAdministrador);
    }
    
    public List<TematicasDTO> findAllTematics() {
        return tematicaRepository.findAll()
            .stream()
            .map(t -> new TematicasDTO(t.getIdTematica(), t.getNombre()))
            .collect(Collectors.toList());
    }
    
    public Tematica buscarTematica(Integer idTematica){
        return tematicaRepository.findByIdTematica(idTematica)
                    .orElseThrow(() -> new IllegalArgumentException("Temática no encontrada"));
    }
    
    public Set<Congreso> buscarCongresos(Integer idAdministrador) {
        return congresoRepository.findFullByAdministrador(idAdministrador);
    }
    
    public Optional<Congreso> buscarCongreso(Integer idCongreso) {
        return congresoRepository.findByIdCongresoWithRelations(idCongreso);
    }
    
    public Boolean existeCongreso(String nombre) {
        return congresoRepository.findByNombre(nombre).isPresent();
    }

    public void guardarPonencia(Integer idCongreso, Integer idUsuario, Integer idTematica, MultipartFile archivoPDF) throws Exception {
        Congreso congreso = congresoRepository.findByIdCongreso(idCongreso)
            .orElseThrow(() -> new IllegalArgumentException("Congreso no encontrado"));
        Usuario usuario = usuarioRepository.findByIdUsuario(idUsuario)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        Tematica tematica = tematicaRepository.findByIdTematica(idTematica)
            .orElseThrow(() -> new IllegalArgumentException("Temática no encontrada"));

        // Buscar si ya existe una ponencia para este usuario y congreso
        Optional<Ponencia> ponenciaOpt = ponenciaRepository
            .findAll()
            .stream()
            .filter(p -> p.getCongreso().getIdCongreso().equals(idCongreso)
                      && p.getUsuario().getIdUsuario().equals(idUsuario))
            .findFirst();

        Ponencia ponencia;
        if (ponenciaOpt.isPresent()) {
            // Actualizar ponencia existente
            ponencia = ponenciaOpt.get();
        } else {
            // Crear nueva ponencia
            ponencia = new Ponencia();
            ponencia.setCongreso(congreso);
            ponencia.setUsuario(usuario);
        }
        ponencia.setTematica(tematica);
        ponencia.setArchivoPdf(archivoPDF.getBytes());
        ponencia.setNombreArchivo(archivoPDF.getOriginalFilename());
        ponencia.setMime(archivoPDF.getContentType());
        ponenciaRepository.save(ponencia);
    }

    public List<Congreso> obtenerTodosCongresos() {
        List<Congreso> congresos = congresoRepository.findAllWithRelations();
        for (Congreso c : congresos) {
            Hibernate.initialize(c.getCongresoTematicas());
            Hibernate.initialize(c.getTematicasExtra());
            Hibernate.initialize(c.getEvaluadores());
            Hibernate.initialize(c.getRegistradores());
            Hibernate.initialize(c.getConferencistas());
            Hibernate.initialize(c.getPonentes());
            // Inicializa otras colecciones si es necesario
        }
        return congresos;
    }
    public List<Congreso> obtenerCongresosComoPonente(Integer idUsuario) {
        // Cargar congresos con todas las relaciones necesarias para evitar LazyInitializationException
        List<Congreso> congresos = ponenciaRepository.findCongresosByUsuarioId(idUsuario);
        // Forzar inicialización de relaciones necesarias
        for (Congreso c : congresos) {
            Hibernate.initialize(c.getCongresoTematicas());
            Hibernate.initialize(c.getTematicasExtra());
            Hibernate.initialize(c.getFechas());
            // Si necesitas más relaciones, inicialízalas aquí
        }
        return congresos;
    }
    @Transactional
    public void eliminarPonencia(Integer idCongreso, Integer idUsuario) {
        // Busca la ponencia
        List<Ponencia> ponencias = ponenciaRepository.findAll()
            .stream()
            .filter(p -> p.getCongreso().getIdCongreso().equals(idCongreso)
                      && p.getUsuario().getIdUsuario().equals(idUsuario))
            .toList();
        for (Ponencia ponencia : ponencias) {
            // Elimina la ponencia, y en cascada se eliminan dictamenes y evaluaciones
            ponenciaRepository.delete(ponencia);
        }
    }

    public Optional<Congreso> findCongresoById(Integer idCongreso) {
        return congresoRepository.findById(idCongreso);
    }
    public Optional<Usuario> buscarUsuarioPorId(Integer idUsuario) {
            return usuarioRepository.findByIdUsuario(idUsuario);
        }

    public List<Congreso> obtenerCongresosComoAsistente(Integer idUsuario) {
        // Corrige: usa el repositorio de asistentes para obtener los congresos
        List<Congreso> congresos = asistenteRepository.findByIdUsuario(idUsuario)
            .stream()
            .map(a -> congresoRepository.findByIdCongresoWithRelations(a.getIdCongreso()).orElse(null))
            .filter(c -> c != null)
            .collect(Collectors.toList());
        for (Congreso c : congresos) {
            Hibernate.initialize(c.getCongresoTematicas());
            Hibernate.initialize(c.getTematicasExtra());
            Hibernate.initialize(c.getFechas());
        }
        return congresos;
    }
    
    @Transactional
    public List<Congreso> obtenerCongresosComoConferencista(Integer idUsuario) {
        // Obtener los conferencistas del usuario
        Set<Conferencista> conferencistas = conferencistaRepository.findByUsuario_IdUsuario(idUsuario);
        
        if (conferencistas.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Extraer los congresos e inicializar las relaciones lazy
        List<Congreso> congresos = conferencistas.stream()
            .map(Conferencista::getCongreso)
            .collect(Collectors.toList());
        
        // Inicializar las relaciones lazy necesarias para el DTO
        for (Congreso c : congresos) {
            Hibernate.initialize(c.getCongresoTematicas());
            if (c.getCongresoTematicas() != null) {
                c.getCongresoTematicas().forEach(ct -> 
                    Hibernate.initialize(ct.getTematica())
                );
            }
            Hibernate.initialize(c.getFechas());
            Hibernate.initialize(c.getTematicasExtra());
        }
        
        return congresos;
    }

    // Agrega este getter para exponer el repositorio desde el service
    public ConferencistaRepository getConferencistaRepository() {
        return conferencistaRepository;
    }
    @Transactional(readOnly = true)
    public Set<Congreso> buscarCongresosRegistrador(Integer idUsuario) {
        try {
            Set<Congreso> congresos = registradorRepository.findByUsuario_IdUsuario(idUsuario)
                .stream()
                .map(Registrador::getCongreso)
                .collect(Collectors.toSet());
                
            // Initialize collections
            congresos.forEach(congreso -> {
                Hibernate.initialize(congreso.getTematicasExtra());
                Hibernate.initialize(congreso.getCongresoTematicas());
            });
            
            return congresos;
        } catch (Exception e) {
 
            return new HashSet<>();
        }
    }
    public Optional<Registrador> logInRegistrador(Integer idRegistrador) {
        return registradorRepository.findByIdRegistrador(idRegistrador);
    }
}
