package com.Confex.LogIn;

import com.Confex.DataTransferObjects.LogInDTO;
import com.Confex.DataTransferObjects.PasswordResetDTO;
import com.Confex.DataTransferObjects.PasswordResetRequestDTO;
import com.Confex.DataTransferObjects.TokenVerificationDTO;
import com.Confex.DataTransferObjects.UsuarioDTO;
import com.Confex.Email.EmailService;
import com.Confex.Email.TokenService;
import com.Confex.Entidades.Administrador;
import com.Confex.Entidades.Conferencista;
import com.Confex.Entidades.Evaluador;
import com.Confex.Entidades.Ponente;
import com.Confex.Entidades.Registrador;
import com.Confex.Entidades.Usuario;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Optional;
import java.util.Set;
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
@RequestMapping("/LogIn")
public class LogInApi {
    
    private final LogInService logInService;
    private final EmailService emailService;
    private final TokenService tokenService;
    private final ObjectMapper objectMapper; 
    private final ModelMapper modelMapper;

    public LogInApi(LogInService logInService, EmailService emailService, TokenService tokenService, ObjectMapper objectMapper, ModelMapper modelMapper) {
        this.logInService = logInService;
        this.emailService = emailService;
        this.tokenService = tokenService;
        this.objectMapper = objectMapper;
        this.modelMapper = modelMapper;
    }
    
    @PostMapping("/RequestReset")
    public ResponseEntity<String> requestPasswordReset(@Valid @RequestBody PasswordResetRequestDTO requestDTO) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");
        try {
            Usuario usuario = logInService.existeCorreo(requestDTO.getIdentifier());
            String token = tokenService.generateToken();
            tokenService.storeToken(usuario.getCorreo(), token);
            emailService.sendPasswordResetEmail(usuario.getCorreo(),usuario.getNombreUsuario(), token);
            return new ResponseEntity<>("Se ha enviado un código de verificación a tu correo electrónico.", headers, HttpStatus.OK);
        } catch (MessagingException e) {
            return new ResponseEntity<>("Error al enviar el correo electrónico: " + e.getMessage(), headers, HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), headers, HttpStatus.BAD_REQUEST);
        }
    }
    
    @PostMapping("/verifyToken")
    public ResponseEntity<String> verifyToken(@Valid @RequestBody TokenVerificationDTO verificationDTO) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");
        try {
            Usuario usuario = logInService.existeCorreo(verificationDTO.getIdentifier());
            if (tokenService.validateToken(usuario.getCorreo(), verificationDTO.getToken())) {
                return new ResponseEntity<>("Token de verificación correcto", headers, HttpStatus.OK);
            }
            else {
                return new ResponseEntity<>("Token de verificación incorrecto", headers, HttpStatus.BAD_REQUEST);
            }
        } catch (MessagingException e) {
            return new ResponseEntity<>("Error en el servidor: " + e.getMessage(), headers, HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            return new ResponseEntity<>("Error en el servidor: " + e.getMessage(), headers, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @PostMapping("/resetPassword")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody PasswordResetDTO resetDTO) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");
        try {
            Usuario usuario = logInService.existeCorreo(resetDTO.getIdentifier());
            usuario.setPassword(resetDTO.getPassword());
            logInService.save(usuario);
            return new ResponseEntity<>("Contraseña actualizada exitosamente.", headers, HttpStatus.OK);
        } catch (MessagingException e) {
            return new ResponseEntity<>("Error al enviar el correo: " + e.getMessage(), headers, HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
             return new ResponseEntity<>("Error en el servidor: " + e.getMessage(), headers, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    } 
    
    @PostMapping("/buscar")
    public ResponseEntity<String> buscarUsuario(@RequestBody LogInDTO logInDTO) { 
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");
        try{
            Usuario usuario = logInService.logIn(logInDTO.getIdentifier(), logInDTO.getPassword());
            Optional<Administrador> administrador  = logInService.logInAdmin(usuario.getIdUsuario());
            Set<Evaluador> evaluador = logInService.logInEvaluador(usuario.getIdUsuario());
            Set<Registrador> registrador = logInService.logInRegistrador(usuario.getIdUsuario());
            Set<Conferencista> conferencista = logInService.logInConferencista(usuario.getIdUsuario());
            Set<Ponente> ponente = logInService.logInPonente(usuario.getIdUsuario());
            
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
            return new ResponseEntity<>("Error al procesar JSON: " + e.getMessage(), headers, HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            return new ResponseEntity<>("Error: " + e.getMessage(), headers, HttpStatus.BAD_REQUEST);
        }
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
}
