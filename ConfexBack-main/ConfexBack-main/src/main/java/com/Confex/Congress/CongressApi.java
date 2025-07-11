package com.Confex.Congress;

import com.Confex.DataTransferObjects.BuscarCongresoDTO;
import com.Confex.DataTransferObjects.CongresoDTO;
import com.Confex.DataTransferObjects.NuevoCongresoDTO;
import com.Confex.DataTransferObjects.TematicasDTO;
import com.Confex.Email.EmailService;
import com.Confex.Entidades.Administrador;
import com.Confex.Entidades.Asistencia;
import com.Confex.Entidades.Asistente;
import com.Confex.Entidades.Conferencista;
import com.Confex.Entidades.Congreso;
import com.Confex.Entidades.CongresoTematica;
import com.Confex.Entidades.Dictamen;
import com.Confex.Entidades.Evaluador;
import com.Confex.Entidades.EvaluadorTematica;
import com.Confex.Entidades.FechasCongreso;
import com.Confex.Entidades.FotoCongreso;
import com.Confex.Entidades.Ponencia;
import com.Confex.Entidades.Registrador;
import com.Confex.Entidades.Tematica;
import com.Confex.Entidades.TematicaExtra;
import com.Confex.Entidades.UbicacionCongreso;
import com.Confex.Entidades.Usuario;
import com.Confex.Repositorios.AsistenciaRepository;
import com.Confex.Repositorios.AsistenteRepository;
import com.Confex.Repositorios.EvaluadorRepository;
import com.Confex.Repositorios.PonenciaRepository;
import com.Confex.Repositorios.EvaluarPonenciaRepository;
import com.Confex.Repositorios.EventoRepository;
import com.Confex.Repositorios.DictamenRepository;
import com.Confex.Repositorios.SalaRepository;
import com.Confex.Repositorios.HorarioRepository;
import com.Confex.Entidades.EvaluarPonencia;
import com.Confex.Entidades.EventoHorario;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalTime;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import javax.mail.MessagingException;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.transaction.Transactional;
import javax.validation.Valid;

import org.hibernate.Hibernate;
import org.modelmapper.ModelMapper;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.Confex.Entidades.SalaCongreso;
import com.Confex.Entidades.HorarioCongreso;
import com.Confex.Repositorios.RegistradorRepository;
@RestController
@RequestMapping("/Congresos")
public class CongressApi {

    private final CongressService congressService;
    private final EmailService emailService;
    private final ObjectMapper objectMapper;
    private final ModelMapper modelMapper;
    private final AsistenciaRepository asistenciaRepository;
    private final AsistenteRepository asistenteRepository;
    private final EvaluadorRepository evaluadorRepository;
    private final PonenciaRepository ponenciaRepository;
    private final EvaluarPonenciaRepository evaluarPonenciaRepository;
    private final DictamenRepository dictamenRepository;
    private final SalaRepository salaRepository;
    private final HorarioRepository horarioRepository;
    private final EventoRepository eventoRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public CongressApi(EmailService emailService, CongressService congressService, ObjectMapper objectMapper,
            ModelMapper modelMapper,
            AsistenciaRepository asistenciaRepository, AsistenteRepository asistenteRepository,
            EvaluadorRepository evaluadorRepository,
            PonenciaRepository ponenciaRepository, EvaluarPonenciaRepository evaluarPonenciaRepository,
            DictamenRepository dictamenRepository,
            HorarioRepository horarioRepository,
            EventoRepository eventoRepository,
            SalaRepository salaRepository) {
        this.congressService = congressService;
        this.emailService = emailService;
        this.objectMapper = objectMapper;
        this.modelMapper = modelMapper;
        this.asistenciaRepository = asistenciaRepository;
        this.asistenteRepository = asistenteRepository;
        this.evaluadorRepository = evaluadorRepository;
        this.ponenciaRepository = ponenciaRepository;
        this.evaluarPonenciaRepository = evaluarPonenciaRepository;
        this.dictamenRepository = dictamenRepository;
        this.salaRepository = salaRepository;
        this.horarioRepository = horarioRepository;
        this.eventoRepository = eventoRepository;
    }

    @PostMapping("/tematicas")
    public ResponseEntity<?> tematicasDisponibles() {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");
        try {
            List<TematicasDTO> tematicasDTO = congressService.findAllTematics();
            String jsonResponse = objectMapper.writeValueAsString(tematicasDTO);
            return new ResponseEntity<>(jsonResponse, headers, HttpStatus.OK);
        } catch (JsonProcessingException e) {
            return new ResponseEntity<>("Error al procesar JSON: " + e.getMessage(), headers,
                    HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            return new ResponseEntity<>("Error: " + e.getMessage(), headers, HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping(value = "/altaCongreso", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> altaCongreso(
            @RequestPart("data") @Valid NuevoCongresoDTO nuevoCongresoDTO,
            @RequestPart(value = "archivo", required = false) MultipartFile archivoPDF,
            @RequestPart(value = "foto", required = false) MultipartFile fotoCongreso) {
        if (fotoCongreso != null && fotoCongreso.getSize() > 2 * 1024 * 1024) {
            return new ResponseEntity<>("La imagen supera los 2 MB", HttpStatus.BAD_REQUEST);
        }
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");
        try {
            if (archivoPDF != null && archivoPDF.getSize() > 50 * 1024 * 1024) {
                return new ResponseEntity<>("El archivo excede los 50 MB", HttpStatus.BAD_REQUEST);
            }
            Optional<Administrador> OptionalAdministrador = congressService.logInAdmin(nuevoCongresoDTO.getIdUsuario());
            if (OptionalAdministrador.isPresent()) {
                Administrador administrador = OptionalAdministrador.get();
                if (administrador.getRol() == 'O') {
                    if (congressService.existeCongreso(nuevoCongresoDTO.getNombreCongreso()))
                        return new ResponseEntity<>(
                                "El nombre de congreso " + nuevoCongresoDTO.getNombreCongreso() + " ya existe...",
                                headers, HttpStatus.BAD_REQUEST);
                    Congreso congreso = new Congreso();
                    congreso.setAdministrador(administrador);
                    congreso.setNombre(nuevoCongresoDTO.getNombreCongreso());
                    congreso.setHorasMinimasAsistencia(nuevoCongresoDTO.getHorasMinimas());
                    if (nuevoCongresoDTO.getCorreoContacto() != null)
                        congreso.setCorreo(nuevoCongresoDTO.getCorreoContacto());
                    if (nuevoCongresoDTO.getTelefonoContacto() != null)
                        congreso.setTelefono(nuevoCongresoDTO.getTelefonoContacto());
                    if (nuevoCongresoDTO.getSitioWeb() != null)
                        congreso.setSitioWeb(nuevoCongresoDTO.getSitioWeb());
                    buildOrUpdateFotoCongreso(congreso, fotoCongreso);
                    buildOrUpdateFechasCongreso(congreso, nuevoCongresoDTO.getFechasCongreso());
                    buildOrUpdateUbicacion(congreso, nuevoCongresoDTO.getUbicacion());
                    buildOrUpdateTematicas(congreso, nuevoCongresoDTO.getTematicas());
                    buildOrUpdateStaff(congreso, nuevoCongresoDTO.getStaff());
                    congressService.save(congreso);
                    if (archivoPDF != null && !archivoPDF.isEmpty()) {
                        String rutaBase = System.getProperty("user.dir") + "/uploads/convocatorias";
                        File directorio = new File(rutaBase);
                        if (!directorio.exists()) {
                            directorio.mkdirs();
                        }
                        String nombreArchivo = congreso.getIdCongreso() + ".pdf";
                        Path rutaCompleta = Paths.get(rutaBase, nombreArchivo);
                        Files.write(rutaCompleta, archivoPDF.getBytes());
                    }
                    return new ResponseEntity<>("Congreso creado con éxito.", headers, HttpStatus.OK);
                } else {
                    return new ResponseEntity<>("Usted no es un organizador", headers, HttpStatus.BAD_REQUEST);
                }
            } else {
                return new ResponseEntity<>("USTED NO ES UN ADMINISTRADOR", headers, HttpStatus.BAD_REQUEST);
            }
        } catch (IOException e) {
            return new ResponseEntity<>("Error al guardar el archivo PDF: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            return new ResponseEntity<>("Error: " + e.getMessage(), headers, HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/organizador")
    public ResponseEntity<?> buscar(@Valid @RequestBody BuscarCongresoDTO buscarCongresoDTO) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");
        try {
            Optional<Administrador> OptionalAdministrador = congressService
                    .logInAdmin(buscarCongresoDTO.getIdUsuario());
            if (OptionalAdministrador.isPresent()) {
                Administrador administrador = OptionalAdministrador.get();
                if (administrador.getRol() == 'O') {
                    Set<Congreso> congresos = congressService.buscarCongresos(buscarCongresoDTO.getIdUsuario());
                    List<CongresoDTO> congresosDTO = congresos.stream()
                            .map(this::convertirADTO)
                            .toList();
                    String jsonResponse = objectMapper.writeValueAsString(congresosDTO);
                    return new ResponseEntity<>(jsonResponse, headers, HttpStatus.OK);
                } else {
                    return new ResponseEntity<>("Usted no es un organizador", headers, HttpStatus.BAD_REQUEST);
                }
            } else {
                return new ResponseEntity<>("USTED NO ES UN ADMINISTRADOR", headers, HttpStatus.BAD_REQUEST);
            }
        } catch (JsonProcessingException e) {
            return new ResponseEntity<>("Error al procesar JSON: " + e.getMessage(), headers,
                    HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            return new ResponseEntity<>("Error: " + e.getMessage(), headers, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/fotoCongreso/{idCongreso}")
    public ResponseEntity<byte[]> obtenerFotoUsuario(@PathVariable Integer idCongreso) {
        try {
            Optional<Congreso> congreso = congressService.buscarCongreso(idCongreso);
            if (congreso.isPresent() && congreso.get().getFoto() != null) {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.parseMediaType(congreso.get().getFoto().getMime()));
                headers.setContentLength(congreso.get().getFoto().getFoto().length);
                return new ResponseEntity<>(congreso.get().getFoto().getFoto(), headers, HttpStatus.OK);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping(value = "/subirPonencia", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> subirPonencia(
            @RequestParam("idCongreso") Integer idCongreso,
            @RequestParam("idUsuario") Integer idUsuario,
            @RequestParam("idTematica") Integer idTematica,
            @RequestPart("archivo") MultipartFile archivoPDF) {
        if (archivoPDF == null || archivoPDF.isEmpty()) {
            return new ResponseEntity<>("No se envió ningún archivo.", HttpStatus.BAD_REQUEST);
        }
        if (archivoPDF.getSize() > 50 * 1024 * 1024) {
            return new ResponseEntity<>("El archivo excede los 50 MB", HttpStatus.BAD_REQUEST);
        }
        try {
            congressService.guardarPonencia(idCongreso, idUsuario, idTematica, archivoPDF);
            return new ResponseEntity<>("Ponencia subida con éxito.", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error al subir la ponencia: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/congresos-ponente")
    public ResponseEntity<?> congresosComoPonente(@RequestParam Integer idUsuario) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");
        try {
            List<Congreso> congresos = congressService.obtenerCongresosComoPonente(idUsuario);
            // Si no hay congresos, responde con lista vacía y 200 OK
            if (congresos == null || congresos.isEmpty()) {
                String jsonResponse = objectMapper.writeValueAsString(new ArrayList<>());
                return new ResponseEntity<>(jsonResponse, headers, HttpStatus.OK);
            }
            List<Map<String, Object>> congresosDTO = congresos.stream().map(c -> {
                Map<String, Object> dto = new HashMap<>();
                dto.put("idCongreso", c.getIdCongreso());
                dto.put("nombreCongreso", c.getNombre());
                if (c.getCongresoTematicas() != null) {
                    List<Map<String, Object>> tematicas = c.getCongresoTematicas().stream()
                            .map(ct -> {
                                Map<String, Object> t = new HashMap<>();
                                t.put("idTematica", ct.getTematica().getIdTematica());
                                t.put("nombre", ct.getTematica().getNombre());
                                return t;
                            })
                            .toList();
                    dto.put("tematicas", tematicas);
                }
                if (c.getFechas() != null) {
                    Map<String, Object> fechas = new HashMap<>();
                    fechas.put("convocatoriaInicio", c.getFechas().getConvocatoriaInicio());
                    fechas.put("convocatoriaFin", c.getFechas().getConvocatoriaFin());
                    fechas.put("eventoInicio", c.getFechas().getEventoInicio());
                    fechas.put("eventoFin", c.getFechas().getEventoFin());
                    dto.put("fechasCongreso", fechas);
                }
                return dto;
            }).toList();
            String jsonResponse = objectMapper.writeValueAsString(congresosDTO);
            return new ResponseEntity<>(jsonResponse, headers, HttpStatus.OK);
        } catch (Exception e) {
            // Devuelve lista vacía en caso de error de datos, pero loguea el error
            e.printStackTrace();
            try {
                String jsonResponse = objectMapper.writeValueAsString(new ArrayList<>());
                return new ResponseEntity<>(jsonResponse, headers, HttpStatus.OK);
            } catch (Exception ex) {
                return new ResponseEntity<>("Error: " + ex.getMessage(), headers, HttpStatus.BAD_REQUEST);
            }
        }
    }

    @DeleteMapping("/eliminarPonencia")
    public ResponseEntity<?> eliminarPonencia(
            @RequestParam("idCongreso") Integer idCongreso,
            @RequestParam("idUsuario") Integer idUsuario) {
        try {
            congressService.eliminarPonencia(idCongreso, idUsuario);
            return new ResponseEntity<>("Ponencia eliminada correctamente.", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error al eliminar la ponencia: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/todos")
    public ResponseEntity<?> obtenerTodosCongresos() {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");
        try {
            List<Congreso> congresos = congressService.obtenerTodosCongresos();
            List<CongresoDTO> congresosDTO = congresos.stream()
                    .map(this::convertirADTO)
                    .toList();
            String jsonResponse = objectMapper.writeValueAsString(congresosDTO);
            return new ResponseEntity<>(jsonResponse, headers, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error: " + e.getMessage(), headers, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/{idCongreso}")
    public ResponseEntity<?> obtenerCongresoPorId(@PathVariable Integer idCongreso) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");
        try {
            Optional<Congreso> congresoOpt = congressService.buscarCongreso(idCongreso);
            if (congresoOpt.isPresent()) {
                CongresoDTO dto = convertirADTO(congresoOpt.get());
                String jsonResponse = objectMapper.writeValueAsString(dto);
                return new ResponseEntity<>(jsonResponse, headers, HttpStatus.OK);
            } else {
                return new ResponseEntity<>("Congreso no encontrado", headers, HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>("Error: " + e.getMessage(), headers, HttpStatus.BAD_REQUEST);
        }
    }

    private void buildOrUpdateFotoCongreso(Congreso congreso, MultipartFile foto) throws IOException {
        if (foto == null || foto.isEmpty())
            return;

        String mime = foto.getContentType();
        byte[] fotoBytes = foto.getBytes();

        FotoCongreso fotoCongreso = congreso.getFoto();
        if (fotoCongreso == null) {
            fotoCongreso = new FotoCongreso();
            fotoCongreso.setCongreso(congreso);
            congreso.setFoto(fotoCongreso);
        }

        fotoCongreso.setMime(mime);
        fotoCongreso.setFoto(fotoBytes);
    }

    private void buildOrUpdateFechasCongreso(Congreso congreso, NuevoCongresoDTO.FechasCongresoDTO fechasCongresoDTO) {
        FechasCongreso fechas = modelMapper.map(fechasCongresoDTO, FechasCongreso.class);
        fechas.setCongreso(congreso);
        congreso.setFechas(fechas);
    }

    private void buildOrUpdateUbicacion(Congreso congreso, NuevoCongresoDTO.UbicacionDTO ubicacionDTO) {
        UbicacionCongreso ubicacion = modelMapper.map(ubicacionDTO, UbicacionCongreso.class);
        ubicacion.setCongreso(congreso);
        congreso.setUbicacion(ubicacion);
    }

    private void buildOrUpdateTematicas(Congreso congreso, NuevoCongresoDTO.TematicasDTO tematicasDTO) {
        congreso.getCongresoTematicas().clear();
        congreso.getTematicasExtra().clear();
        if (tematicasDTO.getTematicas() != null) {
            tematicasDTO.getTematicas().stream()
                    .map(idTematica -> {
                        return congressService.buscarTematica(idTematica);
                    })
                    .map(tematica -> {
                        if (tematica == null) {
                            return null;
                        }
                        CongresoTematica ct = new CongresoTematica();
                        ct.setCongreso(congreso);
                        ct.setTematica(tematica);
                        return ct;
                    })
                    .filter(Objects::nonNull)
                    .forEachOrdered(ct -> {
                        congreso.getCongresoTematicas().add(ct);
                    });
        }
        if (tematicasDTO.getTematicasExtra() != null) {
            tematicasDTO.getTematicasExtra().stream()
                    .filter(nombre -> {
                        boolean valido = nombre != null && !nombre.trim().isEmpty();
                        return valido;
                    })
                    .map(nombre -> {
                        TematicaExtra te = new TematicaExtra();
                        te.setCongreso(congreso);
                        te.setNombre(nombre);
                        return te;
                    })
                    .forEachOrdered(te -> {
                        congreso.getTematicasExtra().add(te);
                    });
        }
    }

    private void buildOrUpdateStaff(Congreso congreso, List<NuevoCongresoDTO.StaffDTO> staffDTOList) {
        Set<Evaluador> eval = congreso.getEvaluadores();
        eval.clear();
        congreso.getEvaluadores().clear();
        congreso.getRegistradores().clear();
        congreso.getConferencistas().clear();

        for (NuevoCongresoDTO.StaffDTO staffDTO : staffDTOList) {
            try {
                Usuario usuario = congressService.searchUser(staffDTO.getIdUsuario())
                        .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

                boolean esEvaluador = false;
                boolean esRegistrador = false;
                boolean esConferencista = false;
                List<String> tematicasEvaluador = new ArrayList<>();

                if (staffDTO.isEvaluador()) {
                    esEvaluador = true;
                    Evaluador evaluador = new Evaluador()
                            .setCongreso(congreso)
                            .setUsuario(usuario);

                    Set<EvaluadorTematica> tematicas = staffDTO.getTematicasEvaluador().stream().map(idTematica -> {
                        Tematica tematica = congressService.buscarTematica(idTematica);
                        tematicasEvaluador.add(tematica.getNombre());
                        return new EvaluadorTematica()
                                .setEvaluador(evaluador)
                                .setTematica(tematica);
                    }).collect(Collectors.toSet());

                    evaluador.setEvaluadorTematicas(tematicas);
                    congreso.getEvaluadores().add(evaluador);
                }

                if (staffDTO.isRegistrador()) {
                    esRegistrador = true;
                    Registrador registrador = new Registrador()
                            .setCongreso(congreso)
                            .setUsuario(usuario);
                    congreso.getRegistradores().add(registrador);

                }

                if (staffDTO.isConferencista()) {
                    esConferencista = true;
                    Conferencista conferencista = new Conferencista()
                            .setCongreso(congreso)
                            .setUsuario(usuario);
                    congreso.getConferencistas().add(conferencista);

                }

                try {
                    String nombreCompleto = usuario.getNombre() + " " + usuario.getApellidoPaterno() + " "
                            + usuario.getApellidoMaterno();
                    emailService.sendStaffNotificationEmail(
                            usuario.getCorreo(),
                            nombreCompleto,
                            congreso.getNombre(),
                            esEvaluador,
                            esRegistrador,
                            esConferencista,
                            tematicasEvaluador);
                } catch (MessagingException e) {
                    System.err.println("Error al enviar correo a " + usuario.getCorreo() + ": " + e.getMessage());
                }
            } catch (Exception ex) {
                System.err.println("Error agregando staff: " + ex.getMessage());
            }
        }

    }

    private CongresoDTO convertirADTO(Congreso congreso) {
        String fotoCongresoUrl = null;
        if (congreso.getFoto() != null) {
            fotoCongresoUrl = ("/Congresos/fotoCongreso/" + congreso.getIdCongreso());
        }

        FechasCongreso fechas = congreso.getFechas();
        CongresoDTO.FechasCongresoDTO fechasDTO = new CongresoDTO.FechasCongresoDTO()
                .setConvocatoriaInicio(fechas.getConvocatoriaInicio())
                .setConvocatoriaFin(fechas.getConvocatoriaFin())
                .setEvaluacionInicio(fechas.getEvaluacionInicio())
                .setEvaluacionFin(fechas.getEvaluacionFin())
                .setDictamenInicio(fechas.getDictamenInicio())
                .setDictamenFin(fechas.getDictamenFin())
                .setEventoInicio(fechas.getEventoInicio())
                .setEventoFin(fechas.getEventoFin());

        UbicacionCongreso ubicacionCongreso = congreso.getUbicacion();
        CongresoDTO.UbicacionDTO ubicacionDTO = new CongresoDTO.UbicacionDTO()
                .setLatitud(ubicacionCongreso.getLatitud())
                .setLongitud(ubicacionCongreso.getLongitud());

        List<Tematica> tematicas = congreso.getCongresoTematicas().stream()
                .map(ct -> ct.getTematica())
                .toList();
        List<String> tematicasExtra = congreso.getTematicasExtra().stream()
                .map(TematicaExtra::getNombre)
                .toList();
        CongresoDTO.TematicasDTO tematicasDTO = new CongresoDTO.TematicasDTO()
                .setTematicas(tematicas)
                .setTematicasExtra(tematicasExtra);

        Map<Integer, CongresoDTO.StaffDTO> staffMap = new HashMap<>();

        congreso.getEvaluadores().forEach(evaluador -> {
            Usuario usuario = evaluador.getUsuario();
            List<Integer> tematicasEval = evaluador.getEvaluadorTematicas().stream()
                    .map(et -> et.getTematica().getIdTematica())
                    .toList();
            staffMap.put(usuario.getIdUsuario(),
                    new CongresoDTO.StaffDTO()
                            .setIdUsuario(usuario.getIdUsuario())
                            .setNombre(usuario.getNombre())
                            .setApellidoMaterno(usuario.getApellidoMaterno())
                            .setApellidoPaterno(usuario.getApellidoPaterno())
                            .setCorreo(usuario.getCorreo())
                            .setNombreUsuario(usuario.getNombreUsuario())
                            .setTelefono(usuario.getTelefono())
                            .setEvaluador(true)
                            .setConferencista(false)
                            .setRegistrador(false)
                            .setPonente(false)
                            .setTematicasEvaluador(tematicasEval));
        });

        congreso.getConferencistas().forEach(conferencista -> {
            Usuario usuario = conferencista.getUsuario();
            staffMap.compute(usuario.getIdUsuario(), (id, dto) -> {
                if (dto == null) {
                    return new CongresoDTO.StaffDTO()
                            .setIdUsuario(usuario.getIdUsuario())
                            .setNombre(usuario.getNombre())
                            .setApellidoMaterno(usuario.getApellidoMaterno())
                            .setApellidoPaterno(usuario.getApellidoPaterno())
                            .setCorreo(usuario.getCorreo())
                            .setNombreUsuario(usuario.getNombreUsuario())
                            .setTelefono(usuario.getTelefono())
                            .setEvaluador(false)
                            .setConferencista(true)
                            .setRegistrador(false)
                            .setPonente(false)
                            .setTematicasEvaluador(null);
                } else {
                    dto.setConferencista(true);
                    return dto;
                }
            });
        });

        congreso.getRegistradores().forEach(registrador -> {
            Usuario usuario = registrador.getUsuario();
            staffMap.compute(usuario.getIdUsuario(), (id, dto) -> {
                if (dto == null) {
                    return new CongresoDTO.StaffDTO()
                            .setIdUsuario(usuario.getIdUsuario())
                            .setNombre(usuario.getNombre())
                            .setApellidoMaterno(usuario.getApellidoMaterno())
                            .setApellidoPaterno(usuario.getApellidoPaterno())
                            .setCorreo(usuario.getCorreo())
                            .setNombreUsuario(usuario.getNombreUsuario())
                            .setTelefono(usuario.getTelefono())
                            .setEvaluador(false)
                            .setConferencista(false)
                            .setRegistrador(true)
                            .setPonente(false)
                            .setTematicasEvaluador(null);
                } else {
                    dto.setRegistrador(true);
                    return dto;
                }
            });
        });

        congreso.getPonentes().forEach(ponente -> {
            Usuario usuario = ponente.getUsuario();
            staffMap.compute(usuario.getIdUsuario(), (id, dto) -> {
                if (dto == null) {
                    return new CongresoDTO.StaffDTO()
                            .setIdUsuario(usuario.getIdUsuario())
                            .setNombre(usuario.getNombre())
                            .setApellidoMaterno(usuario.getApellidoMaterno())
                            .setApellidoPaterno(usuario.getApellidoPaterno())
                            .setCorreo(usuario.getCorreo())
                            .setNombreUsuario(usuario.getNombreUsuario())
                            .setTelefono(usuario.getTelefono())
                            .setEvaluador(false)
                            .setConferencista(false)
                            .setRegistrador(false)
                            .setPonente(true)
                            .setTematicasEvaluador(null);
                } else {
                    dto.setPonente(true);
                    return dto;
                }
            });
        });

        List<CongresoDTO.StaffDTO> staff = new ArrayList<>(staffMap.values());

        return CongresoDTO.builder()
                .idCongreso(congreso.getIdCongreso())
                .idUsuario(congreso.getAdministrador().getIdAdministrador())
                .fotoCongresoUrl(fotoCongresoUrl)
                .nombreCongreso(congreso.getNombre())
                .horasMinimas(congreso.getHorasMinimasAsistencia())
                .correoContacto(congreso.getCorreo())
                .telefonoContacto(congreso.getTelefono())
                .sitioWeb(congreso.getSitioWeb())
                .fechasCongreso(fechasDTO)
                .tematicas(tematicasDTO)
                .ubicacion(ubicacionDTO)
                .staff(staff)
                .build();
    }

    @PostMapping("/registrador/asistencia/{idCongreso}/registrar")
    @Transactional
    public ResponseEntity<?> registrarNuevoAsistente(
            @PathVariable Integer idCongreso,
            @RequestBody Map<String, Object> request) {

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");

        try {
            Integer idUsuario = ((Number) request.get("idUsuario")).intValue();

            // Validar que el usuario existe
            Usuario usuario = congressService.buscarUsuarioPorId(idUsuario)
                    .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

            // Verificar si ya existe el asistente para evitar duplicados (por la
            // restricción UNIQUE)
            Optional<Asistente> existente = asistenteRepository.findByIdCongresoAndIdUsuario(idCongreso, idUsuario);
            Asistente asistente;
            if (existente.isPresent()) {
                asistente = existente.get();
            } else {
                // Crear nuevo asistente
                asistente = new Asistente();
                asistente.setIdCongreso(idCongreso);
                asistente.setIdUsuario(idUsuario);
                asistente.setBeifi(false);
                asistente = asistenteRepository.save(asistente);
            }

            // Crear o actualizar registro de asistencia
            Optional<Asistencia> asistenciaOpt = asistenciaRepository.findByIdAsistente(asistente.getIdAsistente());
            Asistencia asistencia;
            if (asistenciaOpt.isPresent()) {
                asistencia = asistenciaOpt.get();
            } else {
                asistencia = new Asistencia();
                asistencia.setIdAsistente(asistente.getIdAsistente());
            }
            asistenciaRepository.save(asistencia);

            // Preparar respuesta
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Asistente registrado correctamente");
            response.put("asistente", Map.of(
                    "idAsistente", asistente.getIdAsistente(),
                    "usuario", Map.of(
                            "idUsuario", usuario.getIdUsuario(),
                            "nombre", usuario.getNombre(),
                            "apellidoPaterno", usuario.getApellidoPaterno(),
                            "apellidoMaterno", usuario.getApellidoMaterno()),
                    "horasAcumuladas", asistencia.getHoras()));

            String jsonResponse = objectMapper.writeValueAsString(response);
            return new ResponseEntity<>(jsonResponse, headers, HttpStatus.OK);

        } catch (Exception e) {
            // Marca la transacción para rollback y devuelve el error
            return new ResponseEntity<>("Error: " + e.getMessage(), headers, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/congresos-asistente")
    public ResponseEntity<?> congresosComoAsistente(@RequestParam Integer idUsuario) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");
        try {
            List<Congreso> congresos = congressService.obtenerCongresosComoAsistente(idUsuario);
            // Siempre responde 200 OK con un array (vacío si no hay)
            List<Map<String, Object>> congresosDTO = new ArrayList<>();
            if (congresos != null) {
                congresosDTO = congresos.stream().map(c -> {
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("idCongreso", c.getIdCongreso());
                    dto.put("nombreCongreso", c.getNombre());
                    dto.put("fotoCongresoUrl", c.getFoto() != null ? c.getFoto().getFoto() : null);
                    if (c.getFechas() != null) {
                        Map<String, Object> fechas = new HashMap<>();
                        fechas.put("eventoInicio", c.getFechas().getEventoInicio());
                        fechas.put("eventoFin", c.getFechas().getEventoFin());
                        dto.put("fechasCongreso", fechas);
                    }
                    return dto;
                }).toList();
            }
            String jsonResponse = objectMapper.writeValueAsString(congresosDTO);
            return new ResponseEntity<>(jsonResponse, headers, HttpStatus.OK);
        } catch (Exception e) {
            // Siempre responde un array vacío en caso de error de datos
            try {
                String jsonResponse = objectMapper.writeValueAsString(new ArrayList<>());
                return new ResponseEntity<>(jsonResponse, headers, HttpStatus.OK);
            } catch (Exception ex) {
                return new ResponseEntity<>("Error: " + ex.getMessage(), headers, HttpStatus.BAD_REQUEST);
            }
        }
    }

    @DeleteMapping("/eliminarAsistente")
    public ResponseEntity<?> eliminarAsistente(
            @RequestParam("idCongreso") Integer idCongreso,
            @RequestParam("idUsuario") Integer idUsuario) {
        try {
            // Busca el asistente por idCongreso y idUsuario
            Optional<Asistente> asistenteOpt = asistenteRepository.findByIdCongresoAndIdUsuario(idCongreso, idUsuario);
            if (asistenteOpt.isPresent()) {
                Asistente asistente = asistenteOpt.get();
                // Elimina primero la asistencia (si existe)
                asistenciaRepository.findByIdAsistente(asistente.getIdAsistente())
                        .ifPresent(asistenciaRepository::delete);
                // Luego elimina el asistente
                asistenteRepository.delete(asistente);
                return new ResponseEntity<>("Asistencia eliminada correctamente.", HttpStatus.OK);
            } else {
                return new ResponseEntity<>("No existe registro de asistente para este usuario y congreso.",
                        HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>("Error al eliminar la asistencia: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/congresos-evaluador")
    public ResponseEntity<?> congresosComoEvaluador(@RequestParam Integer idUsuario) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");
        try {
            // Cambia Lis<Congreso> por List<Congreso> y usa el método correcto
            Set<Congreso> congresosSet = evaluadorRepository.findCongresosByIdUsuario(idUsuario);
            List<Congreso> congresos = new ArrayList<>(congresosSet);
            List<Map<String, Object>> congresosDTO = congresos.stream().map(c -> {
                Map<String, Object> dto = new HashMap<>();
                dto.put("idCongreso", c.getIdCongreso());
                dto.put("nombreCongreso", c.getNombre());
                // Corrige: fotoCongresoUrl debe ser una URL, no el binario
                dto.put("fotoCongresoUrl",
                        c.getFoto() != null ? ("/Congresos/fotoCongreso/" + c.getIdCongreso()) : null);
                if (c.getFechas() != null) {
                    Map<String, Object> fechas = new HashMap<>();
                    fechas.put("evaluacionInicio", c.getFechas().getEvaluacionInicio());
                    fechas.put("evaluacionFin", c.getFechas().getEvaluacionFin());
                    dto.put("fechasCongreso", fechas);
                }
                return dto;
            }).toList();
            String jsonResponse = objectMapper.writeValueAsString(congresosDTO);
            return new ResponseEntity<>(jsonResponse, headers, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error: " + e.getMessage(), headers, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/evaluador/ponencias")
    @Transactional
    public ResponseEntity<?> ponenciasAsignadasEvaluador(
            @RequestParam Integer idCongreso,
            @RequestParam Integer idUsuario) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");
        try {
            Optional<Evaluador> evaluadorOpt = evaluadorRepository
                    .findByCongreso_IdCongresoAndUsuario_IdUsuario(idCongreso, idUsuario);

            if (!evaluadorOpt.isPresent()) {
                String jsonResponse = objectMapper.writeValueAsString(new ArrayList<>());
                return new ResponseEntity<>(jsonResponse, headers, HttpStatus.OK);
            }

            Evaluador evaluador = evaluadorOpt.get();

            List<EvaluarPonencia> asignaciones = evaluarPonenciaRepository
                    .findByEvaluador_IdEvaluador(evaluador.getIdEvaluador());

            // Si no existen asignaciones, repartirlas de forma única y equitativa
            if (asignaciones.isEmpty()) {
                // 1. Obtener todos los evaluadores del congreso con sus temáticas
                Set<Evaluador> evaluadoresCongreso = evaluadorRepository.findByCongreso_IdCongreso(idCongreso);
                Map<Integer, Set<Integer>> evaluadorTematicas = new HashMap<>();
                for (Evaluador ev : evaluadoresCongreso) {
                    Set<Integer> tematicas = ev.getEvaluadorTematicas() != null
                            ? ev.getEvaluadorTematicas().stream()
                                    .filter(et -> et != null && et.getTematica() != null)
                                    .map(et -> et.getTematica().getIdTematica())
                                    .collect(Collectors.toSet())
                            : new HashSet<>();
                    evaluadorTematicas.put(ev.getIdEvaluador(), tematicas);
                }

                // 2. Obtener todas las ponencias del congreso
                List<Ponencia> ponencias = ponenciaRepository.findByCongresoAndTematicaIn(
                        idCongreso,
                        evaluadorTematicas.values().stream().flatMap(Set::stream).collect(Collectors.toSet()));

                // 3. Filtrar ponencias por temática y repartirlas de forma equitativa y única
                // - Cada ponencia solo se asigna a un evaluador que tenga la temática
                // - Se reparte para balancear la cantidad de ponencias por evaluador

                // Map<idEvaluador, List<Ponencia>>
                Map<Integer, List<Ponencia>> asignacionesPorEvaluador = new HashMap<>();
                for (Integer idEval : evaluadorTematicas.keySet()) {
                    asignacionesPorEvaluador.put(idEval, new ArrayList<>());
                }

                // Para cada ponencia, encuentra los evaluadores posibles y asigna al que tenga
                // menos trabajos
                for (Ponencia p : ponencias) {
                    List<Integer> posibles = evaluadorTematicas.entrySet().stream()
                            .filter(e -> e.getValue().contains(p.getTematica().getIdTematica()))
                            .map(Map.Entry::getKey)
                            .collect(Collectors.toList());
                    if (!posibles.isEmpty()) {
                        // Encuentra el evaluador con menos ponencias asignadas
                        Integer elegido = posibles.stream()
                                .min(Comparator.comparingInt(idEval -> asignacionesPorEvaluador.get(idEval).size()))
                                .orElse(posibles.get(0));
                        asignacionesPorEvaluador.get(elegido).add(p);
                    }
                }

                // 4. Guardar las asignaciones en la base de datos (solo si no existen)
                for (Map.Entry<Integer, List<Ponencia>> entry : asignacionesPorEvaluador.entrySet()) {
                    Integer idEval = entry.getKey();
                    Evaluador ev = evaluadoresCongreso.stream()
                            .filter(e -> e.getIdEvaluador().equals(idEval))
                            .findFirst().orElse(null);
                    if (ev != null) {
                        for (Ponencia p : entry.getValue()) {
                            // Verifica que no exista ya la asignación
                            boolean yaExiste = evaluarPonenciaRepository
                                    .findByEvaluador_IdEvaluador(ev.getIdEvaluador())
                                    .stream()
                                    .anyMatch(ep -> ep.getPonencia().getIdPonencia().equals(p.getIdPonencia()));
                            if (!yaExiste) {
                                EvaluarPonencia ep = new EvaluarPonencia();
                                ep.setEvaluador(ev);
                                ep.setPonencia(p);
                                evaluarPonenciaRepository.save(ep);
                            }
                        }
                    }
                }

                // Refresca asignaciones para el evaluador actual
                asignaciones = evaluarPonenciaRepository.findByEvaluador_IdEvaluador(evaluador.getIdEvaluador());
            }

            // 5. Construir respuesta
            List<Map<String, Object>> ponenciasDTO = asignaciones.stream()
                    .filter(ep -> ep != null && ep.getPonencia() != null)
                    .map(ep -> {
                        Ponencia p = ep.getPonencia();
                        Map<String, Object> dto = new HashMap<>();
                        dto.put("idEvaluarPonencia", ep.getIdEvaluarPonencia());
                        dto.put("idPonencia", p.getIdPonencia());
                        dto.put("titulo", p.getNombreArchivo() != null ? p.getNombreArchivo() : "Sin título");
                        String autor = "Desconocido";
                        if (p.getUsuario() != null) {
                            String nombre = p.getUsuario().getNombre() != null ? p.getUsuario().getNombre() : "";
                            String apellido = p.getUsuario().getApellidoPaterno() != null
                                    ? p.getUsuario().getApellidoPaterno()
                                    : "";
                            autor = (nombre + " " + apellido).trim();
                            if (autor.isEmpty())
                                autor = "Desconocido";
                        }
                        dto.put("autor", autor);
                        return dto;
                    })
                    .collect(Collectors.toList());

            String jsonResponse = objectMapper.writeValueAsString(ponenciasDTO);
            return new ResponseEntity<>(jsonResponse, headers, HttpStatus.OK);

        } catch (Exception e) {
            System.err.println("Error en ponenciasAsignadasEvaluador: " + e.getMessage());
            e.printStackTrace();
            try {
                String jsonResponse = objectMapper.writeValueAsString(new ArrayList<>());
                return new ResponseEntity<>(jsonResponse, headers, HttpStatus.OK);
            } catch (Exception ex) {
                return new ResponseEntity<>("Error: " + ex.getMessage(), headers, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    @PostMapping("/evaluador/evaluar")
    @Transactional
    public ResponseEntity<?> evaluarPonencia(
            @RequestBody Map<String, Object> body) {
        // body: { idEvaluarPonencia, decision, comentario }
        try {
            Integer idEvaluarPonencia = null;
            String decision = null;
            String comentario = null;
            // Manejo robusto de tipos para evitar errores de casting
            Object idEvalObj = body.get("idEvaluarPonencia");
            if (idEvalObj instanceof Integer) {
                idEvaluarPonencia = (Integer) idEvalObj;
            } else if (idEvalObj instanceof Number) {
                idEvaluarPonencia = ((Number) idEvalObj).intValue();
            } else if (idEvalObj instanceof String) {
                try {
                    idEvaluarPonencia = Integer.parseInt((String) idEvalObj);
                } catch (Exception ex) {
                    return ResponseEntity.badRequest().body("idEvaluarPonencia inválido.");
                }
            }
            Object decisionObj = body.get("decision");
            if (decisionObj != null) {
                decision = decisionObj.toString();
            }
            Object comentarioObj = body.get("comentario");
            if (comentarioObj != null) {
                comentario = comentarioObj.toString();
            }

            if (idEvaluarPonencia == null || decision == null) {
                return ResponseEntity.badRequest().body("Faltan datos para la evaluación.");
            }

            // Buscar la asignación de evaluación
            Optional<EvaluarPonencia> evaluarPonenciaOpt = evaluarPonenciaRepository.findById(idEvaluarPonencia);
            if (evaluarPonenciaOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("No se encontró la asignación de evaluación.");
            }
            EvaluarPonencia evaluarPonencia = evaluarPonenciaOpt.get();
            Ponencia ponencia = evaluarPonencia.getPonencia();
            Congreso congreso = evaluarPonencia.getEvaluador().getCongreso();

            // Validar que el veredicto sea uno de los permitidos
            if (!decision.equals("aceptado") && !decision.equals("rechazado") && !decision.equals("devuelto")) {
                return ResponseEntity.badRequest().body("Veredicto inválido.");
            }

            // Crear o actualizar el dictamen
            javax.persistence.Query q = entityManager.createQuery(
                    "SELECT d FROM Dictamen d WHERE d.congreso.idCongreso = :idCongreso AND d.ponencia.idPonencia = :idPonencia");
            q.setParameter("idCongreso", congreso.getIdCongreso());
            q.setParameter("idPonencia", ponencia.getIdPonencia());
            List<?> result = q.getResultList();

            Dictamen dictamen;
            if (!result.isEmpty()) {
                dictamen = (Dictamen) result.get(0);
                dictamen.setVeredicto(decision);
                dictamen.setFechaDictamen(new java.util.Date());
            } else {
                dictamen = new Dictamen();
                dictamen.setCongreso(congreso);
                dictamen.setPonencia(ponencia);
                dictamen.setVeredicto(decision);
                dictamen.setFechaDictamen(new java.util.Date());
                entityManager.persist(dictamen);
            }

            entityManager.merge(dictamen);

            // --- ENVÍO DE CORREO AL PONENTE SEGÚN EL VEREDICTO ---
            try {
                Usuario ponente = ponencia.getUsuario();
                String correo = ponente.getCorreo();
                String nombreCompleto = ponente.getNombre() + " " + ponente.getApellidoPaterno() + " "
                        + ponente.getApellidoMaterno();
                String nombreCongreso = congreso.getNombre();
                String tituloPonencia = ponencia.getNombreArchivo() != null ? ponencia.getNombreArchivo()
                        : "Tu trabajo";

                if ("aceptado".equals(decision)) {
                    emailService.sendPonenciaAceptadaEmail(
                            correo,
                            nombreCompleto,
                            nombreCongreso,
                            tituloPonencia);
                } else if ("rechazado".equals(decision)) {
                    emailService.sendPonenciaRechazadaEmail(
                            correo,
                            nombreCompleto,
                            nombreCongreso,
                            tituloPonencia,
                            comentario);
                } else if ("devuelto".equals(decision)) {
                    emailService.sendPonenciaDevueltaEmail(
                            correo,
                            nombreCompleto,
                            nombreCongreso,
                            tituloPonencia,
                            comentario);
                }
            } catch (MessagingException ex) {
                System.err.println("Error enviando correo de dictamen: " + ex.getMessage());
            }

            return ResponseEntity.ok("Evaluación registrada correctamente.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error al registrar la evaluación: " + e.getMessage());
        }
    }

    @GetMapping("/ponencia/pdf/{idPonencia}")
    public ResponseEntity<byte[]> verPonenciaPdf(
            @PathVariable Integer idPonencia,
            @RequestParam(value = "download", required = false, defaultValue = "0") int download) {
        try {
            Optional<Ponencia> ponenciaOpt = ponenciaRepository.findById(idPonencia);
            if (ponenciaOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            Ponencia ponencia = ponenciaOpt.get();
            byte[] pdfBytes = ponencia.getArchivoPdf();
            String mime = ponencia.getMime() != null ? ponencia.getMime() : "application/pdf";
            String nombreArchivo = ponencia.getNombreArchivo() != null ? ponencia.getNombreArchivo() : "ponencia.pdf";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(mime));
            headers.setContentLength(pdfBytes.length);

            ContentDisposition disposition = download == 1
                    ? ContentDisposition.attachment().filename(nombreArchivo).build()
                    : ContentDisposition.inline().filename(nombreArchivo).build();
            headers.setContentDisposition(disposition);

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // NUEVO ENDPOINT PARA CONSULTAR EL DICTAMEN DE UNA PONENCIA
    @GetMapping("/dictamen")
    public ResponseEntity<?> getDictamen(
            @RequestParam("idCongreso") Integer idCongreso,
            @RequestParam("idPonencia") Integer idPonencia) {
        try {
            Optional<Dictamen> dictamenOpt = dictamenRepository
                    .findByCongreso_IdCongresoAndPonencia_IdPonencia(idCongreso, idPonencia);
            if (dictamenOpt.isPresent()) {
                Dictamen d = dictamenOpt.get();
                Map<String, Object> resp = new HashMap<>();
                resp.put("veredicto", d.getVeredicto());
                resp.put("fechaDictamen", d.getFechaDictamen());
                return ResponseEntity.ok(resp);
            } else {
                return ResponseEntity.ok(new HashMap<>()); // vacío = sin dictamen
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al consultar dictamen: " + e.getMessage());
        }
    }

    @GetMapping("/congresos-conferencista")
    public ResponseEntity<?> congresosComoConferencista(@RequestParam Integer idUsuario) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");
        try {
            // Obtener congresos donde el usuario es conferencista
            List<Congreso> congresos = congressService.obtenerCongresosComoConferencista(idUsuario);
            if (congresos == null || congresos.isEmpty()) {
                String jsonResponse = objectMapper.writeValueAsString(new ArrayList<>());
                return new ResponseEntity<>(jsonResponse, headers, HttpStatus.OK);
            }
            List<Map<String, Object>> congresosDTO = congresos.stream().map(c -> {
                Map<String, Object> dto = new HashMap<>();
                dto.put("idCongreso", c.getIdCongreso());
                dto.put("nombreCongreso", c.getNombre());
                // Corrige: fotoCongresoUrl debe ser una URL, no el binario
                dto.put("fotoCongresoUrl",
                        c.getFoto() != null ? ("/Congresos/fotoCongreso/" + c.getIdCongreso()) : null);
                // Temáticas
                if (c.getCongresoTematicas() != null && !c.getCongresoTematicas().isEmpty()) {
                    List<Map<String, Object>> tematicas = c.getCongresoTematicas().stream()
                            .map(ct -> {
                                Map<String, Object> t = new HashMap<>();
                                t.put("idTematica", ct.getTematica().getIdTematica());
                                t.put("nombre", ct.getTematica().getNombre());
                                return t;
                            })
                            .toList();
                    dto.put("tematicas", Map.of("tematicas", tematicas));
                }
                // Fechas
                if (c.getFechas() != null) {
                    Map<String, Object> fechas = new HashMap<>();
                    fechas.put("eventoInicio", c.getFechas().getEventoInicio());
                    fechas.put("eventoFin", c.getFechas().getEventoFin());
                    dto.put("fechasCongreso", fechas);
                }
                return dto;
            }).toList();
            String jsonResponse = objectMapper.writeValueAsString(congresosDTO);
            return new ResponseEntity<>(jsonResponse, headers, HttpStatus.OK);
        } catch (Exception e) {
            try {
                String jsonResponse = objectMapper.writeValueAsString(new ArrayList<>());
                return new ResponseEntity<>(jsonResponse, headers, HttpStatus.OK);
            } catch (Exception ex) {
                return new ResponseEntity<>("Error: " + ex.getMessage(), headers, HttpStatus.BAD_REQUEST);
            }
        }
    }

    @DeleteMapping("/eliminarConferencista")
    public ResponseEntity<?> eliminarConferencista(
            @RequestParam("idCongreso") Integer idCongreso,
            @RequestParam("idUsuario") Integer idUsuario) {
        try {
            // Busca el conferencista por idCongreso y idUsuario
            Optional<Conferencista> conferencistaOpt = congressService
                    .getConferencistaRepository()
                    .findByIdCongresoAndIdUsuario(idCongreso, idUsuario);
            if (conferencistaOpt.isPresent()) {
                Conferencista conferencista = conferencistaOpt.get();
                congressService.getConferencistaRepository().delete(conferencista);
                return new ResponseEntity<>("Conferencista eliminado correctamente.", HttpStatus.OK);
            } else {
                return new ResponseEntity<>("No existe registro de conferencista para este usuario y congreso.",
                        HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>("Error al eliminar el conferencista: " + e.getMessage(),
                    HttpStatus.BAD_REQUEST);
        }
    }

    
    @PostMapping("/registrador/asistencia/{idCongreso}")
    @Transactional
    public ResponseEntity<?> registrarAsistencias(
            @PathVariable Integer idCongreso,
            @RequestBody List<Map<String, Object>> asistencias) {

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");

        try {
            // Validate congress exists
            Congreso congreso = congressService.findCongresoById(idCongreso)
                .orElseThrow(() -> new IllegalArgumentException("Congreso no encontrado"));

            for (Map<String, Object> asistenciaData : asistencias) {
                Integer idUsuario = ((Number) asistenciaData.get("idUsuario")).intValue();
                BigDecimal horas = new BigDecimal(asistenciaData.get("horas").toString());

                // Find or create asistente
                Optional<Asistente> optAsistente = asistenteRepository
                    .findByIdCongresoAndIdUsuario(idCongreso, idUsuario);
                
                Asistente asistente = optAsistente.orElseGet(() -> {
                    Asistente nuevo = new Asistente();
                    nuevo.setIdCongreso(idCongreso);
                    nuevo.setIdUsuario(idUsuario);
                    nuevo.setBeifi(false);
                    return asistenteRepository.save(nuevo);
                });

                // Find or create asistencia
                Optional<Asistencia> optAsistencia = asistenciaRepository
                    .findByIdAsistente(asistente.getIdAsistente());
                
                if (optAsistencia.isPresent()) {
                    // Update existing record
                    Asistencia asistencia = optAsistencia.get();
                    asistencia.setHoras(asistencia.getHoras().add(horas));
                    asistenciaRepository.save(asistencia);
                } else {
                    // Create new record
                    Asistencia asistencia = new Asistencia();
                    asistencia.setIdAsistente(asistente.getIdAsistente());
                    asistencia.setHoras(horas);
                    asistenciaRepository.save(asistencia);
                }
            }

            return new ResponseEntity<>("Asistencias registradas correctamente", headers, HttpStatus.OK);
            
        } catch (Exception e) {
            return new ResponseEntity<>("Error: " + e.getMessage(), headers, HttpStatus.BAD_REQUEST);
        }
    }
    
    @PostMapping("/registrador/asistencia/{idCongreso}/registros")
    public ResponseEntity<?> obtenerRegistrosExistentes(
            @PathVariable Integer idCongreso,
            @RequestBody Map<String, List<Integer>> request) {
        
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");
        
        try {
            List<Integer> idsUsuarios = request.get("idsUsuarios");
            List<Map<String, Object>> registros = new ArrayList<>();
            
            for (Integer idUsuario : idsUsuarios) {
                Optional<Asistente> optAsistente = asistenteRepository
                    .findByIdCongresoAndIdUsuario(idCongreso, idUsuario);
                    
                if (optAsistente.isPresent()) {
                    Asistente asistente = optAsistente.get();
                    Optional<Asistencia> optAsistencia = asistenciaRepository
                        .findByIdAsistente(asistente.getIdAsistente());
                        
                    if (optAsistencia.isPresent()) {
                        Asistencia asistencia = optAsistencia.get();
                        Usuario usuario = congressService.buscarUsuarioPorId(idUsuario)
                            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
                            
                        Map<String, Object> registro = new HashMap<>();
                        registro.put("idAsistente", asistente.getIdAsistente());
                        registro.put("horasAcumuladas", asistencia.getHoras());
                        registro.put("usuario", Map.of(
                            "idUsuario", usuario.getIdUsuario(),
                            "nombre", usuario.getNombre(),
                            "apellidoPaterno", usuario.getApellidoPaterno(),
                            "apellidoMaterno", usuario.getApellidoMaterno()
                        ));
                        
                        registros.add(registro);
                    }
                }
            }
            
            String jsonResponse = objectMapper.writeValueAsString(registros);
            return new ResponseEntity<>(jsonResponse, headers, HttpStatus.OK);
            
        } catch (Exception e) {
            return new ResponseEntity<>("Error: " + e.getMessage(), headers, HttpStatus.BAD_REQUEST);
        }
    }
    
    @PostMapping("/registrador/asistencia/{idCongreso}/verificar")
    public ResponseEntity<?> verificarAsistentes(
            @PathVariable Integer idCongreso,
            @RequestBody Map<String, List<Integer>> request) {
        
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");
        
        try {
            List<Integer> idsUsuarios = request.get("idsUsuarios");
            List<Integer> asistentesExistentes = asistenteRepository
                .findAsistentesByIdCongresoAndIdUsuarioIn(idCongreso, idsUsuarios);
            
            Map<String, Object> response = new HashMap<>();
            response.put("asistentesExistentes", asistentesExistentes);
            
            String jsonResponse = objectMapper.writeValueAsString(response);
            return new ResponseEntity<>(jsonResponse, headers, HttpStatus.OK);
            
        } catch (Exception e) {
            return new ResponseEntity<>("Error: " + e.getMessage(), headers, HttpStatus.BAD_REQUEST);
        }
    }
    

    @GetMapping("/horarios/{idCongreso}")
    public ResponseEntity<?> obtenerHorarios(@PathVariable Integer idCongreso) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");
        
        try {
            List<HorarioCongreso> horarios = horarioRepository.findByIdCongreso(idCongreso);
            List<SalaCongreso> salas = salaRepository.findByIdCongreso(idCongreso);
            
            Map<String, Object> response = new HashMap<>();
            List<Map<String, Object>> horariosList = new ArrayList<>();
            List<Map<String, Object>> eventosList = new ArrayList<>();
            List<Map<String, Object>> salasList = new ArrayList<>();

            // Procesar salas
            Map<Integer, String> salasMapById = new HashMap<>();
            for (SalaCongreso sala : salas) {
                Map<String, Object> salaData = new HashMap<>();
                salaData.put("idSala", sala.getIdSala());
                salaData.put("nombre", sala.getNombreSala());
                salasList.add(salaData);
                salasMapById.put(sala.getIdSala(), sala.getNombreSala());
            }

            // Si no hay salas, crear sala Principal por defecto
            if (salas.isEmpty()) {
                SalaCongreso salaPrincipal = new SalaCongreso();
                salaPrincipal.setIdCongreso(idCongreso);
                salaPrincipal.setNombreSala("Principal");
                salaPrincipal = salaRepository.save(salaPrincipal);
                
                Map<String, Object> salaData = new HashMap<>();
                salaData.put("idSala", salaPrincipal.getIdSala());
                salaData.put("nombre", salaPrincipal.getNombreSala());
                salasList.add(salaData);
                salasMapById.put(salaPrincipal.getIdSala(), salaPrincipal.getNombreSala());
            }

            // Procesar horarios y eventos
            for (HorarioCongreso horario : horarios) {
                Map<String, Object> horarioData = new HashMap<>();
                horarioData.put("fecha", horario.getFecha().toString());
                horarioData.put("horaInicio", horario.getHoraInicio().toString());
                horarioData.put("horaFin", horario.getHoraFin().toString());
                horariosList.add(horarioData);

                List<EventoHorario> eventos = eventoRepository.findByIdHorario(horario.getIdHorario());
                for (EventoHorario evento : eventos) {
                    Map<String, Object> eventoData = new HashMap<>();
                    eventoData.put("idEvento", evento.getIdEvento());
                    eventoData.put("titulo", evento.getTitulo());
                    eventoData.put("tipo", evento.getTipo());
                    eventoData.put("horaInicio", evento.getHoraInicio().toString());
                    eventoData.put("duracion", evento.getDuracion());
                    eventoData.put("color", evento.getColor());
                    eventoData.put("fecha", horario.getFecha().toString());
                    
                    // Agregar información de la sala
                    String nombreSala = salasMapById.get(evento.getIdSala());
                    eventoData.put("sala", nombreSala != null ? nombreSala : "Principal");
                    
                    eventosList.add(eventoData);
                }
            }

            response.put("horarios", horariosList);
            response.put("eventos", eventosList);
            response.put("salas", salasList);

            String jsonResponse = objectMapper.writeValueAsString(response);
            return new ResponseEntity<>(jsonResponse, headers, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error: " + e.getMessage(), headers, HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/horarios/{idCongreso}")
    @Transactional
    public ResponseEntity<?> guardarHorarios(
        @PathVariable Integer idCongreso,
        @RequestBody Map<String, Object> request
    ) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");
        
        try {
            // Verificar que el congreso existe
            Congreso congreso = congressService.findCongresoById(idCongreso)
                .orElseThrow(() -> new IllegalArgumentException("Congreso no encontrado"));

            List<Map<String, Object>> horarios = (List<Map<String, Object>>) request.get("horarios");
            List<Map<String, Object>> eventos = (List<Map<String, Object>>) request.get("eventos");
            List<Map<String, Object>> salas = (List<Map<String, Object>>) request.get("salas");

            // First delete all eventos for this congreso's horarios
            List<HorarioCongreso> horariosExistentes = horarioRepository.findByIdCongreso(idCongreso);
            for (HorarioCongreso horario : horariosExistentes) {
                eventoRepository.deleteByIdHorario(horario.getIdHorario());
            }
            
            // Now we can safely delete the horarios
            horarioRepository.deleteByIdCongreso(idCongreso);
            
            // Limpiar salas existentes (excepto si ya tienen eventos)
            salaRepository.deleteByIdCongresoAndNotUsed(idCongreso);

            // Guardar/actualizar salas
            Map<String, Integer> salasMap = new HashMap<>();
            if (salas != null) {
                for (Map<String, Object> salaData : salas) {
                    String nombreSala = (String) salaData.get("nombre");
                    SalaCongreso sala = salaRepository
                        .findByIdCongresoAndNombreSala(idCongreso, nombreSala)
                        .orElseGet(() -> {
                            SalaCongreso nuevaSala = new SalaCongreso();
                            nuevaSala.setIdCongreso(idCongreso);
                            nuevaSala.setNombreSala(nombreSala);
                            return salaRepository.save(nuevaSala);
                        });
                    salasMap.put(nombreSala, sala.getIdSala());
                }
            }

            // Guardar nuevos horarios y eventos
            for (Map<String, Object> horario : horarios) {
                HorarioCongreso nuevoHorario = new HorarioCongreso();
                nuevoHorario.setIdCongreso(idCongreso);
                nuevoHorario.setFecha(LocalDate.parse((String) horario.get("fecha")));
                nuevoHorario.setHoraInicio(LocalTime.parse((String) horario.get("horaInicio")));
                nuevoHorario.setHoraFin(LocalTime.parse((String) horario.get("horaFin")));
                
                HorarioCongreso horarioGuardado = horarioRepository.save(nuevoHorario);

                if (eventos != null) {
                    eventos.stream()
                        .filter(e -> e.get("fecha").equals(horario.get("fecha")))
                        .forEach(evento -> {
                            EventoHorario nuevoEvento = new EventoHorario();
                            nuevoEvento.setIdHorario(horarioGuardado.getIdHorario());
                            nuevoEvento.setTitulo((String) evento.get("titulo"));
                            nuevoEvento.setTipo((String) evento.get("tipo"));
                            nuevoEvento.setHoraInicio(LocalTime.parse((String) evento.get("horaInicio")));
                            nuevoEvento.setDuracion(Integer.parseInt(evento.get("duracion").toString()));
                            nuevoEvento.setColor((String) evento.get("color"));
                            
                            String nombreSala = (String) evento.get("sala");
                            if (nombreSala != null && salasMap.containsKey(nombreSala)) {
                                nuevoEvento.setIdSala(salasMap.get(nombreSala));
                            }
                            
                            eventoRepository.save(nuevoEvento);
                        });
                }
            }

            return new ResponseEntity<>("Horarios guardados correctamente", headers, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error: " + e.getMessage(), headers, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/salas/{idCongreso}")
    public ResponseEntity<?> obtenerSalas(@PathVariable Integer idCongreso) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");
        
        try {
            List<SalaCongreso> salas = salaRepository.findByIdCongreso(idCongreso);
            
            // Si no hay salas, crear la sala Principal por defecto
            if (salas.isEmpty()) {
                SalaCongreso salaPrincipal = new SalaCongreso();
                salaPrincipal.setIdCongreso(idCongreso);
                salaPrincipal.setNombreSala("Principal");
                salaRepository.save(salaPrincipal);
                salas.add(salaPrincipal);
            }
            
            List<Map<String, Object>> salasList = salas.stream()
                .map(sala -> {
                    Map<String, Object> salaData = new HashMap<>();
                    salaData.put("idSala", sala.getIdSala());
                    salaData.put("nombre", sala.getNombreSala());
                    return salaData;
                })
                .collect(Collectors.toList());

            String jsonResponse = objectMapper.writeValueAsString(salasList);
            return new ResponseEntity<>(jsonResponse, headers, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error: " + e.getMessage(), headers, HttpStatus.BAD_REQUEST);
        }
    }

    // Método para agregar nueva sala
    @PostMapping("/salas/{idCongreso}")
    @Transactional
    public ResponseEntity<?> agregarSala(
        @PathVariable Integer idCongreso,
        @RequestBody Map<String, String> request
    ) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");
        
        try {
            String nombreSala = request.get("nombreSala");
            
            // Verificar que no existe ya una sala con ese nombre
            Optional<SalaCongreso> salaExistente = salaRepository
                .findByIdCongresoAndNombreSala(idCongreso, nombreSala);
            
            if (salaExistente.isPresent()) {
                return new ResponseEntity<>("Ya existe una sala con ese nombre", headers, HttpStatus.BAD_REQUEST);
            }
            
            SalaCongreso nuevaSala = new SalaCongreso();
            nuevaSala.setIdCongreso(idCongreso);
            nuevaSala.setNombreSala(nombreSala);
            
            SalaCongreso salaGuardada = salaRepository.save(nuevaSala);
            
            Map<String, Object> response = new HashMap<>();
            response.put("idSala", salaGuardada.getIdSala());
            response.put("nombre", salaGuardada.getNombreSala());
            
            String jsonResponse = objectMapper.writeValueAsString(response);
            return new ResponseEntity<>(jsonResponse, headers, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error: " + e.getMessage(), headers, HttpStatus.BAD_REQUEST);
        }
    }
    @PostMapping("/buscarRegistrador")
    @Transactional
    public ResponseEntity<?> buscaregistrador(@Valid @RequestBody BuscarCongresoDTO buscarCongresoDTO) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");
        try {
            Optional<Registrador> Optionalregistrador = congressService.logInRegistrador(buscarCongresoDTO.getIdUsuario());
            if(Optionalregistrador.isPresent()) {
                Set<Congreso> congresos = congressService.buscarCongresosRegistrador(buscarCongresoDTO.getIdUsuario());
                // Initialize collections
                for (Congreso congreso : congresos) {
                    Hibernate.initialize(congreso.getTematicasExtra());
                    Hibernate.initialize(congreso.getCongresoTematicas());
                }
                List<CongresoDTO> congresosDTO = congresos.stream()
                        .map(this::convertirADTO)
                        .collect(Collectors.toList());
                String jsonResponse = objectMapper.writeValueAsString(congresosDTO);
                return new ResponseEntity<>(jsonResponse, headers, HttpStatus.OK);
            } else {
                return new ResponseEntity<>("Usted no es un registrador", headers, HttpStatus.BAD_REQUEST);
            }
        } catch (JsonProcessingException e) {
            return new ResponseEntity<>("Error al procesar JSON: " + e.getMessage(), headers, HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            return new ResponseEntity<>("Error: " + e.getMessage(), headers, HttpStatus.BAD_REQUEST);
        }
    }
}
