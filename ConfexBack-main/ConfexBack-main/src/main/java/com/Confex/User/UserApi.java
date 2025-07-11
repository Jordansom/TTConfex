package com.Confex.User;

import com.Confex.Congress.CongressService;
import com.Confex.DataTransferObjects.ActualizaUsuarioDTO;
import com.Confex.DataTransferObjects.BajaCongresoDTO;
import com.Confex.DataTransferObjects.EliminaUsuarioDTO;
import com.Confex.DataTransferObjects.SearchUserDTO;
import com.Confex.DataTransferObjects.TokenVerification2DTO;
import com.Confex.DataTransferObjects.UsuarioDTO;
import com.Confex.DataTransferObjects.VerifyAccountDTO;
import com.Confex.DataTransferObjects.VerifyPasswordDTO;
import com.Confex.Email.EmailService;
import com.Confex.Email.TokenService;
import com.Confex.Entidades.Administrador;
import com.Confex.Entidades.Conferencista;
import com.Confex.Entidades.Congreso;
import com.Confex.Entidades.Evaluador;
import com.Confex.Entidades.Usuario;
import com.Confex.Entidades.FotoUsuario;
import com.Confex.Entidades.Ponente;
import com.Confex.Entidades.Registrador;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
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
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/User")
public class UserApi {
    
    private final UserService userService;
    private final EmailService emailService;
    private final TokenService tokenService;
    private final ObjectMapper objectMapper;
    private final ModelMapper modelMapper;

    public UserApi(UserService userService, EmailService emailService, TokenService tokenService, ObjectMapper objectMapper, ModelMapper modelMapper, CongressService congressService) {
        this.userService = userService;
        this.emailService = emailService;
        this.tokenService = tokenService;
        this.objectMapper = objectMapper;
        this.modelMapper = modelMapper;
    }
    
    @PostMapping(value = "/update" , consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> actualizaUsuario(
        @RequestPart("data") @Valid ActualizaUsuarioDTO actualizaUsuarioDTO,
        @RequestPart(value = "foto", required = false) MultipartFile fotoUsuario
    ) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");
        try {
            Usuario usuario = userService.search(actualizaUsuarioDTO.getIdUsuario());            
            updateUsuarioFields(usuario, actualizaUsuarioDTO);            
            buildOrUpdateFotoUsuario(usuario, fotoUsuario);
            
            userService.update(usuario);
            Optional<Administrador> administrador  = userService.IsAdmin(usuario.getIdUsuario());
            Set<Evaluador> evaluador = userService.logInEvaluador(usuario.getIdUsuario());
            Set<Registrador> registrador = userService.logInRegistrador(usuario.getIdUsuario());
            Set<Conferencista> conferencista = userService.logInConferencista(usuario.getIdUsuario());
            Set<Ponente> ponente = userService.logInPonente(usuario.getIdUsuario());
            boolean esEvaluador = false;
            boolean esRegistrador = false;
            boolean esConferencista = false;
            boolean esPonente = false;
            if (!evaluador.isEmpty()) {
                esEvaluador = true;
            }
            if (!registrador.isEmpty()) {
                esRegistrador = true;
            }
            if (!conferencista.isEmpty()) {
                esConferencista = true;
            }
            if (!ponente.isEmpty()) {
                esPonente = true;
            }      
            UsuarioDTO usuarioDTO = buildUsuarioDTO(usuario, administrador, esEvaluador, esRegistrador, esConferencista, esPonente);       
            String jsonResponse = objectMapper.writeValueAsString(usuarioDTO);
            return new ResponseEntity<>(jsonResponse, headers, HttpStatus.OK);
        } catch (JsonProcessingException e) {
            return new ResponseEntity<>("Ocurrio un error interno: "+ e.getMessage(), headers, HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (IOException e) {
            return new ResponseEntity<>("Error al guardar la foto de perfil: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), headers, HttpStatus.BAD_REQUEST);
        }
    }
    
    @GetMapping("/fotoUsuario/{idUsuario}")
    public ResponseEntity<byte []> obtenerFotoUsuario(@PathVariable Integer idUsuario) {
        try {
            Usuario usuario = userService.search(idUsuario);
            if(usuario.getFoto() != null) {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.parseMediaType(usuario.getFoto().getMime()));
                headers.setContentLength(usuario.getFoto().getFoto().length);
                return new ResponseEntity<>(usuario.getFoto().getFoto(), headers, HttpStatus.OK);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping("/delete")
    public ResponseEntity<String> eliminaUsuario(@Valid @RequestBody EliminaUsuarioDTO eliminaUsuarioDTO) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");
        try {
            Usuario usuario = userService.search(eliminaUsuarioDTO.getIdUsuario());
            Optional<Administrador> administradorOpt = userService.IsAdmin(eliminaUsuarioDTO.getIdUsuario());
            if(administradorOpt.isPresent() && administradorOpt.get().getRol() == 'O'){ 
                Set<Congreso> congresos = userService.obtenerCongresosComoOrganizador(eliminaUsuarioDTO.getIdUsuario());
                Map<Usuario, List<BajaCongresoDTO>> notificaciones = new HashMap<>();
                
                congresos.forEach(congreso -> {
                    Integer idCongreso = congreso.getIdCongreso();
                    Set<Evaluador> evaluadores = userService.obtenerEvaluadoresCongreso(idCongreso);
                    Set<Registrador> registradores = userService.obtenerRegistradoresCongreso(idCongreso);
                    Set<Conferencista> conferencistas = userService.obtenerConferencistasCongreso(idCongreso);
                    
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
            }
            
            String nombreCompleto = usuario.getNombre() + " " + usuario.getApellidoPaterno() + " " + usuario.getApellidoMaterno();
            
            Set<Congreso> evaluador = userService.obtenerCongresosComoEvaluador(usuario.getIdUsuario());
            Set<Congreso> registrador = userService.obtenerCongresosComoRegistrador(usuario.getIdUsuario());
            Set<Congreso> conferencista = userService.obtenerCongresosComoConferencista(usuario.getIdUsuario());
            
            Set<Congreso> congresos = new HashSet<>();
                congresos.addAll(evaluador);
                congresos.addAll(registrador);
                congresos.addAll(conferencista);
                
            congresos.forEach(congreso -> {
                StringBuilder roles = new StringBuilder();
                if(evaluador.contains(congreso)) roles.append("Evaluador, ");
                if(registrador.contains(congreso)) roles.append("Registrador, ");
                if(conferencista.contains(congreso)) roles.append("Conferencista, ");

                if (roles.length() > 0) roles.setLength(roles.length() - 2);

                try {
                    String correoOrganizador = congreso.getAdministrador().getUsuario().getCorreo();
                    emailService.sendBajaStaffNotification(
                            correoOrganizador,
                            congreso.getNombre(),
                            nombreCompleto,
                            roles.toString()
                    );
                } catch (MessagingException e) {
                    System.err.println("Error al enviar correo al organizador del congreso: " + e.getMessage());
                }
            });
            userService.delete(eliminaUsuarioDTO.getIdUsuario(),eliminaUsuarioDTO.getPassword());
            return new ResponseEntity<>("Cuenta eliminada con éxito.", headers, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), headers, HttpStatus.BAD_REQUEST);
        }
    }
    
    @PostMapping("/verifyPassword")
    public ResponseEntity<?> verifyPassword(@Valid @RequestBody VerifyPasswordDTO verifyDTO) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");
        try {           
            if (!userService.verifyPassword(verifyDTO.getIdUsuario(), verifyDTO.getPassword())) {
                return ResponseEntity.badRequest().body("La contraseña es incorrecta.");
            } 
            return new ResponseEntity<>("Contraseña correcta.", headers, HttpStatus.OK);
        }  catch (Exception e) {
            return new ResponseEntity<>("Error en el servidor: " + e.getMessage(), headers, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @PostMapping("/requestEmailChange")
    public ResponseEntity<?> requestEmailChange(@Valid @RequestBody VerifyAccountDTO verifyDTO) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");
        try {           
            if (userService.existeCorreo(verifyDTO.getCorreo())) {
                return ResponseEntity.badRequest().body("El correo ya está registrado");
            } 
            String token = tokenService.generateToken();
            tokenService.storeToken(verifyDTO.getCorreo(), token);
            emailService.sendVerificationEmail(verifyDTO.getCorreo(), token);
            return new ResponseEntity<>("Token de verificación enviado", headers, HttpStatus.OK);
        } catch (MessagingException e) {
            return new ResponseEntity<>("Error al enviar el correo: " + e.getMessage(), headers, HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            return new ResponseEntity<>("Error en el servidor: " + e.getMessage(), headers, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @PostMapping("/verifyEmailChange")
    public ResponseEntity<?> verifyEmailChange(@Valid @RequestBody TokenVerification2DTO verificationDTO) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");
        try {
            if (tokenService.validateToken(verificationDTO.getCorreo(), verificationDTO.getToken())) {
                Usuario usuario = userService.search(verificationDTO.getIdUsuario());
                usuario.setCorreo(verificationDTO.getCorreo());            
                userService.update(usuario);
                Optional<Administrador> administrador  = userService.IsAdmin(usuario.getIdUsuario());
                Set<Evaluador> evaluador = userService.logInEvaluador(usuario.getIdUsuario());
                Set<Registrador> registrador = userService.logInRegistrador(usuario.getIdUsuario());
                Set<Conferencista> conferencista = userService.logInConferencista(usuario.getIdUsuario());
                Set<Ponente> ponente = userService.logInPonente(usuario.getIdUsuario());
                boolean esEvaluador = false;
                boolean esRegistrador = false;
                boolean esConferencista = false;
                boolean esPonente = false;
                if (!evaluador.isEmpty()) {
                    esEvaluador = true;
                }
                if (!registrador.isEmpty()) {
                    esRegistrador = true;
                }
                if (!conferencista.isEmpty()) {
                    esConferencista = true;
                }
                if (!ponente.isEmpty()) {
                    esPonente = true;
                }      
                UsuarioDTO usuarioDTO = buildUsuarioDTO(usuario, administrador, esEvaluador, esRegistrador, esConferencista, esPonente);            
                String jsonResponse = objectMapper.writeValueAsString(usuarioDTO);
                return new ResponseEntity<>(jsonResponse, headers, HttpStatus.OK);
            }
            else {
                return new ResponseEntity<>("Token de verificación incorrecto", headers, HttpStatus.BAD_REQUEST);
            }
        } catch (JsonProcessingException e) {
            return new ResponseEntity<>("Error en el servidor: " + e.getMessage(), headers, HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            return new ResponseEntity<>("Error en el servidor: " + e.getMessage(), headers, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @PostMapping("/buscar")
    public ResponseEntity<String> buscarUsuario(@RequestBody SearchUserDTO searchUserDTO) { 
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");
        try{
            Usuario usuario = userService.searchByNameOrEmail(searchUserDTO.getIdentifier());
            UsuarioDTO usuarioDTO = buildStaffDTO(usuario);
            String jsonResponse = objectMapper.writeValueAsString(usuarioDTO);
            return new ResponseEntity<>(jsonResponse, headers, HttpStatus.OK);
        } catch (JsonProcessingException e) {
            return new ResponseEntity<>("Error al procesar JSON: " + e.getMessage(), headers, HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            return new ResponseEntity<>("Error: " + e.getMessage(), headers, HttpStatus.BAD_REQUEST);
        }
    }
    

    
    private void updateUsuarioFields(Usuario usuario, ActualizaUsuarioDTO actualizaUsuarioDTO) {
        if (actualizaUsuarioDTO.getNombre() != null) usuario.setNombre(actualizaUsuarioDTO.getNombre());
        if (actualizaUsuarioDTO.getApellidoPaterno() != null) usuario.setApellidoPaterno(actualizaUsuarioDTO.getApellidoPaterno());
        if (actualizaUsuarioDTO.getApellidoMaterno() != null) usuario.setApellidoMaterno(actualizaUsuarioDTO.getApellidoMaterno());
        if (actualizaUsuarioDTO.getNombreUsuario() != null) usuario.setNombreUsuario(actualizaUsuarioDTO.getNombreUsuario());
        if (actualizaUsuarioDTO.getCorreo() != null) usuario.setCorreo(actualizaUsuarioDTO.getCorreo());
        if (actualizaUsuarioDTO.getPassword() != null) usuario.setPassword(actualizaUsuarioDTO.getPassword());
        if (actualizaUsuarioDTO.getTelefono() != null) usuario.setTelefono(actualizaUsuarioDTO.getTelefono());
    }
    
    private void buildOrUpdateFotoUsuario(Usuario usuario, MultipartFile foto) throws IOException {
        if (foto == null || foto.isEmpty()) return;
        
        String mime = foto.getContentType();
        byte[] fotoBytes = foto.getBytes();
        
        FotoUsuario fotoUsuario = usuario.getFoto();
        if (fotoUsuario == null) {
            fotoUsuario = new FotoUsuario();
            fotoUsuario.setUsuario(usuario);
            usuario.setFoto(fotoUsuario);
        }
        fotoUsuario.setMime(mime);
        fotoUsuario.setFoto(fotoBytes);
    }

    private UsuarioDTO buildUsuarioDTO(Usuario usuario, Optional<Administrador> administradorOpt, boolean esEvaluador, boolean esRegistrador, boolean esConferencista, boolean esPonente) {
        UsuarioDTO usuarioDTO = modelMapper.map(usuario, UsuarioDTO.class);
        usuarioDTO.setAdministrador(administradorOpt.map(a -> a.getRol() == 'A').orElse(false));
        usuarioDTO.setOrganizador(administradorOpt.map(a -> a.getRol() != 'A').orElse(false));
        usuarioDTO.setEvaluador(esEvaluador);
        usuarioDTO.setConferencista(esConferencista);
        usuarioDTO.setPonente(esPonente);
        usuarioDTO.setRegistrador(esRegistrador);
        if(usuario.getFoto() != null)
            usuarioDTO.setFotoUsuarioUrl("/User/fotoUsuario/"+usuario.getIdUsuario());
        else
            usuarioDTO.setFotoUsuarioUrl(null);
        return usuarioDTO;
    }
    
    private UsuarioDTO buildStaffDTO(Usuario usuario) {   
        UsuarioDTO usuarioDTO = modelMapper.map(usuario, UsuarioDTO.class);
        usuarioDTO.setAdministrador(false);
        usuarioDTO.setOrganizador(false);
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