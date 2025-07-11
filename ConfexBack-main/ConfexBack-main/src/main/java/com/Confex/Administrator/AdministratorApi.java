package com.Confex.Administrator;

import com.Confex.DataTransferObjects.AdminDeleteTematicasDTO;
import com.Confex.DataTransferObjects.AdminEditarTematicasDTO;
import com.Confex.DataTransferObjects.AdminNuevasTematicasDTO;
import com.Confex.DataTransferObjects.AdminOrganizadoresDTO;
import com.Confex.DataTransferObjects.BajaCongresoDTO;
import com.Confex.DataTransferObjects.UsuarioDTO;
import com.Confex.Email.EmailService;
import com.Confex.Entidades.Administrador;
import com.Confex.Entidades.Conferencista;
import com.Confex.Entidades.Congreso;
import com.Confex.Entidades.Evaluador;
import com.Confex.Entidades.Registrador;
import com.Confex.Entidades.Tematica;
import com.Confex.Entidades.Usuario;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import javax.mail.MessagingException;
import javax.validation.Valid;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/Admin")
public class AdministratorApi {
    
    private final AdministratorService administratorService;
    private final EmailService emailService;
    private final ObjectMapper objectMapper;
    private final ModelMapper modelMapper;
    
    public AdministratorApi(AdministratorService administratorService, EmailService emailService, ObjectMapper objectMapper, ModelMapper modelMapper){
        this.administratorService = administratorService;
        this.emailService = emailService;
        this.objectMapper = objectMapper;
        this.modelMapper = modelMapper;
    }
    
    @PostMapping("/usuarios")
    public ResponseEntity<?> buscar(@Valid @RequestBody AdminOrganizadoresDTO adminOrganizadoresDTO) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");
        try {
            Optional<Administrador> OptionalAdministrador  = administratorService.logInAdmin(adminOrganizadoresDTO.getIdAdmin());
            if(OptionalAdministrador.isPresent()){
                Administrador administrador = OptionalAdministrador.get();
                if (administrador.getRol() == 'A') {
                    List<Usuario> usuarios = administratorService.findAllUsers();
                    List<UsuarioDTO> usuariosDTO = usuarios.stream()
                            .map(this::buildUsuarioDTO)
                            .toList();
                    String jsonResponse = objectMapper.writeValueAsString(usuariosDTO);
                    return new ResponseEntity<>(jsonResponse, headers, HttpStatus.OK);
                } else {
                    return new ResponseEntity<>("USTED NO ES UN ADMINISTRADOR", headers, HttpStatus.BAD_REQUEST);
                }
            } else {
                return new ResponseEntity<>("USTED NO ES UN ADMINISTRADOR", headers, HttpStatus.BAD_REQUEST);
            }
        } catch (JsonProcessingException e) {
            return new ResponseEntity<>("Error al procesar JSON: " + e.getMessage(), headers, HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            return new ResponseEntity<>("Error: " + e.getMessage(), headers, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @PostMapping("/filteredUsuarios")
    public ResponseEntity<?> buscarUsuario(@Valid @RequestBody AdminOrganizadoresDTO adminOrganizadoresDTO) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");
        try {
            Optional<Administrador> OptionalAdministrador  = administratorService.logInAdmin(adminOrganizadoresDTO.getIdAdmin());
            if(OptionalAdministrador.isPresent()){
                Administrador administrador = OptionalAdministrador.get();
                if (administrador.getRol() == 'A') {
                    Usuario usuario = administratorService.findUser(adminOrganizadoresDTO.getIdentificadorUsuario());
                    UsuarioDTO usuarioDTO = buildUsuarioDTO(usuario);
                    String jsonResponse = objectMapper.writeValueAsString(usuarioDTO);
                    return new ResponseEntity<>(jsonResponse, headers, HttpStatus.OK);
                } else {
                    return new ResponseEntity<>("USTED NO ES UN ADMINISTRADOR", headers, HttpStatus.BAD_REQUEST);
                }
            } else {
                return new ResponseEntity<>("USTED NO ES UN ADMINISTRADOR", headers, HttpStatus.BAD_REQUEST);
            }
        } catch (JsonProcessingException e) {
            return new ResponseEntity<>("Error al procesar JSON: " + e.getMessage(), headers, HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            return new ResponseEntity<>("Error: " + e.getMessage(), headers, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @PostMapping("/toggleOrganizador")
    public ResponseEntity<?> toggleOrganizador(@Valid @RequestBody AdminOrganizadoresDTO adminOrganizadoresDTO) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");
        try {
            Optional<Administrador> OptionalAdministrador  = administratorService.logInAdmin(adminOrganizadoresDTO.getIdAdmin());
            if(OptionalAdministrador.isPresent()){
                Administrador administrador = OptionalAdministrador.get();
                if (administrador.getRol() == 'A') {
                    Integer idUsuario = Integer.parseInt(adminOrganizadoresDTO.getIdentificadorUsuario());
                    Usuario usuario = administratorService.findUserById(idUsuario);
                    if(adminOrganizadoresDTO.getOrganizador()){
                        OptionalAdministrador = administratorService.logInAdmin(idUsuario);
                        if(!OptionalAdministrador.isPresent())
                            return new ResponseEntity<>("El usuario seleccionado no es un organizador", headers, HttpStatus.BAD_REQUEST);
                        if(OptionalAdministrador.get().getRol() == 'A')
                            return new ResponseEntity<>("El usuario seleccionado es un administrador, no se puede eliminar", headers, HttpStatus.BAD_REQUEST);
                        
                        Set<Congreso> congresos = administratorService.obtenerCongresosComoOrganizador(usuario.getIdUsuario());
                        Map<Usuario, List<BajaCongresoDTO>> notificaciones = new HashMap<>();

                        congresos.forEach(congreso -> {
                            Integer idCongreso = congreso.getIdCongreso();
                            Set<Evaluador> evaluadores = administratorService.obtenerEvaluadoresCongreso(idCongreso);
                            Set<Registrador> registradores = administratorService.obtenerRegistradoresCongreso(idCongreso);
                            Set<Conferencista> conferencistas = administratorService.obtenerConferencistasCongreso(idCongreso);

                            evaluadores.forEach(evaluador -> {
                                notificaciones
                                    .computeIfAbsent(evaluador.getUsuario(), k->new ArrayList<>());

                                agregarRolANotificacion(notificaciones.get(evaluador.getUsuario()), congreso.getNombre(), "Evaluador");
                            });
                            registradores.forEach(registrador -> {
                                notificaciones
                                    .computeIfAbsent(registrador.getUsuario(), k->new ArrayList<>());

                                agregarRolANotificacion(notificaciones.get(registrador.getUsuario()), congreso.getNombre(), "Registrador");
                            });
                            conferencistas.forEach(conferencista -> {
                                notificaciones
                                    .computeIfAbsent(conferencista.getUsuario(), k->new ArrayList<>());
                                agregarRolANotificacion(notificaciones.get(conferencista.getUsuario()), congreso.getNombre(), "Conferencista");
                            });
                        });

                        notificaciones.forEach((receptor, lista) -> {
                            String nombreCompleto = receptor.getNombre() + " " + receptor.getApellidoPaterno() + " " + receptor.getApellidoMaterno();

                            try {
                                emailService.sendBajaPorBajaOrganizador(receptor.getCorreo(), nombreCompleto, lista);
                            } catch (MessagingException e) {
                                System.err.println("Error al enviar correo al usuario " + receptor.getCorreo()
                                    + " que participaba en congresos: "
                                    + lista.stream()
                                             .map(BajaCongresoDTO::getNombreCongreso)
                                             .collect(Collectors.joining(", "))
                                    + " con roles: "
                                    + lista.stream()
                                             .flatMap(r -> r.getRoles().stream())
                                             .collect(Collectors.joining(", "))
                                    + ". Error: " + e.getMessage());
                            }
                        });
                        String nombreCompleto = usuario.getNombre() + " " + usuario.getApellidoPaterno() + " " + usuario.getApellidoMaterno();
                        emailService.sendRemocionOrganizadorNotification(usuario.getCorreo(), nombreCompleto);
                        usuario.setAdministrador(null);
                        administratorService.quitarOrganizador(usuario);
                    } else {
                        Administrador newAdministrador = new Administrador()
                                .setIdAdministrador(usuario.getIdUsuario())
                                .setUsuario(usuario)
                                .setRol('O');
                        usuario.setAdministrador(newAdministrador);
                        administratorService.hacerOrganizador(usuario);
                        String nombreCompleto = usuario.getNombre()+" "+usuario.getApellidoPaterno()+" "+usuario.getApellidoMaterno();
                        emailService.sendPromocionOrganizadorNotification(usuario.getCorreo(), nombreCompleto);
                    }
                    return new ResponseEntity<>("Cuenta eliminada con éxito.", headers, HttpStatus.OK);
                } else {
                    return new ResponseEntity<>("USTED NO ES UN ADMINISTRADOR", headers, HttpStatus.BAD_REQUEST);
                }
            } else {
                return new ResponseEntity<>("USTED NO ES UN ADMINISTRADOR", headers, HttpStatus.BAD_REQUEST);
            }
        }  catch (MessagingException e) {
            return new ResponseEntity<>("Error al enviar el correo: " + e.getMessage(), headers, HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (NumberFormatException e) {
            return new ResponseEntity<>("El identificador enviado no es un entero: " + e.getMessage(), headers, HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            return new ResponseEntity<>("Error: " + e.getMessage(), headers, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @PostMapping("/nuevaTematica")
    public ResponseEntity<?> nuevaTematica(@Valid @RequestBody AdminNuevasTematicasDTO adminNuevasTematicasDTO) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");
        try {
            Optional<Administrador> OptionalAdministrador  = administratorService.logInAdmin(adminNuevasTematicasDTO.getIdAdmin());
            if(OptionalAdministrador.isPresent()){
                Administrador administrador = OptionalAdministrador.get();
                if (administrador.getRol() == 'A') {
                    if(administratorService.buscarTematica(adminNuevasTematicasDTO.getNombre()))
                        return new ResponseEntity<>("La temática ya existe", headers, HttpStatus.BAD_REQUEST);
                    Tematica tematica = new Tematica()
                            .setNombre(adminNuevasTematicasDTO.getNombre());
                    administratorService.agregarTematica(tematica);
                    return new ResponseEntity<>("Temática agregada con éxito.", headers, HttpStatus.OK);
                } else {
                    return new ResponseEntity<>("USTED NO ES UN ADMINISTRADOR", headers, HttpStatus.BAD_REQUEST);
                }
            } else {
                return new ResponseEntity<>("USTED NO ES UN ADMINISTRADOR", headers, HttpStatus.BAD_REQUEST);
            }
        }  catch (Exception e) {
           return new ResponseEntity<>("Error: " + e.getMessage(), headers, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @PostMapping("/editarTematica")
    public ResponseEntity<?> editarTematica(@Valid @RequestBody AdminEditarTematicasDTO adminEditarTematicasDTO) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");
        try {
            Optional<Administrador> OptionalAdministrador  = administratorService.logInAdmin(adminEditarTematicasDTO.getIdAdmin());
            if(OptionalAdministrador.isPresent()){
                Administrador administrador = OptionalAdministrador.get();
                if (administrador.getRol() == 'A') {
                    Tematica tematica = administratorService.buscarTematica(adminEditarTematicasDTO.getIdTematica());
                    tematica.setNombre(adminEditarTematicasDTO.getNombre());
                    administratorService.agregarTematica(tematica);
                    return new ResponseEntity<>("Temática editada con éxito.", headers, HttpStatus.OK);
                } else {
                    return new ResponseEntity<>("USTED NO ES UN ADMINISTRADOR", headers, HttpStatus.BAD_REQUEST);
                }
            } else {
                return new ResponseEntity<>("USTED NO ES UN ADMINISTRADOR", headers, HttpStatus.BAD_REQUEST);
            }
        }  catch (Exception e) {
           return new ResponseEntity<>("Error: " + e.getMessage(), headers, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @PostMapping("/eliminarTematica")
    public ResponseEntity<?> eliminarTematica(@Valid @RequestBody AdminDeleteTematicasDTO adminDeleteTematicasDTO) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");
        try {
            Optional<Administrador> OptionalAdministrador  = administratorService.logInAdmin(adminDeleteTematicasDTO.getIdAdmin());
            if(OptionalAdministrador.isPresent()){
                Administrador administrador = OptionalAdministrador.get();
                if (administrador.getRol() == 'A') {
                    Tematica tematica = administratorService.buscarTematica(adminDeleteTematicasDTO.getIdTematica());
                    Set<Congreso> congresos = administratorService.CongresosPorTematica(adminDeleteTematicasDTO.getIdTematica());
                    Set<String> correosNotificados = new HashSet<>();
                
                    congresos.forEach(congreso -> {
                        Integer idCongreso = congreso.getIdCongreso();
                        Set<Evaluador> evaluadores = administratorService.obtenerEvaluadoresCongresoTematica(idCongreso,tematica.getIdTematica());
                        
                        evaluadores.forEach(evaluador -> {
                            try {
                                Usuario usuario = evaluador.getUsuario();
                                if (usuario != null && correosNotificados.add(usuario.getCorreo())) {
                                    String nombre = usuario.getNombre() + " " + usuario.getApellidoPaterno() + " " + usuario.getApellidoMaterno();
                                    emailService.sendRemocionTematicaNotificationStaff(usuario.getCorreo(), nombre, congreso.getNombre(), tematica.getNombre());
                                }
                            } catch (MessagingException e) {
                                Usuario usuario = evaluador.getUsuario();
                                String nombre = usuario.getNombre() + " " + usuario.getApellidoPaterno() + " " + usuario.getApellidoMaterno();
                                System.err.println("Error al enviar correo al evaluador "+nombre+" del congreso "+congreso.getNombre()+" Error: " + e.getMessage());
                            }
                        });
                        
                        try {
                            Administrador admin = congreso.getAdministrador();
                            if (admin != null) {
                                Usuario usuario = admin.getUsuario();
                                if (usuario != null) {
                                    String nombre = usuario.getNombre() + " " + usuario.getApellidoPaterno() + " " + usuario.getApellidoMaterno();
                                    emailService.sendRemocionTematicaNotificationAdmin(usuario.getCorreo(), nombre, tematica.getNombre());
                                }
                            }
                        } catch (MessagingException e) {
                            Administrador admin = congreso.getAdministrador();
                            Usuario usuario = admin.getUsuario();
                            String nombre = usuario.getNombre() + " " + usuario.getApellidoPaterno() + " " + usuario.getApellidoMaterno();
                            System.err.println("Error al enviar correo al organizador "+nombre+" del congreso "+congreso.getNombre()+" Error: " + e.getMessage());
                        }
                    });
                    administratorService.borrarTematica(tematica);
                    return new ResponseEntity<>("Temática editada con éxito.", headers, HttpStatus.OK);
                } else {
                    return new ResponseEntity<>("USTED NO ES UN ADMINISTRADOR", headers, HttpStatus.BAD_REQUEST);
                }
            } else {
                return new ResponseEntity<>("USTED NO ES UN ADMINISTRADOR", headers, HttpStatus.BAD_REQUEST);
            }
        }  catch (Exception e) {
           return new ResponseEntity<>("Error: " + e.getMessage(), headers, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    private UsuarioDTO buildUsuarioDTO(Usuario usuario) {   
        UsuarioDTO usuarioDTO = modelMapper.map(usuario, UsuarioDTO.class);
        Optional<Administrador> administradorOpt = administratorService.logInAdmin(usuario.getIdUsuario());
        usuarioDTO.setAdministrador(false);
        usuarioDTO.setOrganizador(administradorOpt.map(a -> a.getRol() != 'A').orElse(false));
        usuarioDTO.setEvaluador(false);
        usuarioDTO.setPonente(false);
        usuarioDTO.setRegistrador(false);
        usuarioDTO.setConferencista(false);
        usuarioDTO.setTelefono(null);
        usuarioDTO.setFotoUsuarioUrl(null);
        return usuarioDTO;
    }
    
    private void agregarRolANotificacion(List<BajaCongresoDTO> lista, String congreso, String rol) {
        boolean actualizado = false;
        for (BajaCongresoDTO dto : lista) {
            if (dto.getNombreCongreso().equals(congreso)) {
                if (!dto.getRoles().contains(rol)) {
                    dto.getRoles().add(rol);
                }
                actualizado = true;
                break;
            }
        }

        if (!actualizado) {
            lista.add(new BajaCongresoDTO(congreso, new ArrayList<>(List.of(rol))));
        }
    }
}
