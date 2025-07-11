package com.Confex.SignUp;

import com.Confex.DataTransferObjects.NuevoUsuarioDTO;
import com.Confex.DataTransferObjects.TokenVerificationDTO;
import com.Confex.DataTransferObjects.VerifyAccountDTO;
import com.Confex.Email.EmailService;
import com.Confex.Email.TokenService;
import com.Confex.Entidades.Usuario;
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
@RequestMapping("/SignUp")
public class SignUpApi {
    
    private final SignUpService signUpService;
    private final EmailService emailService;
    private final TokenService tokenService;
    private final ModelMapper modelMapper;

    public SignUpApi(SignUpService signUpService, EmailService emailService, TokenService tokenService, ModelMapper modelMapper) {
        this.signUpService = signUpService;
        this.emailService = emailService;
        this.tokenService = tokenService;
        this.modelMapper = modelMapper;
    }
    
    @PostMapping("/iniciarRegistro")
    public ResponseEntity<?> iniciarRegistro(@Valid @RequestBody VerifyAccountDTO verifyDTO) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");
        try {           
            if (signUpService.existeCorreo(verifyDTO.getCorreo())) {
                return new ResponseEntity<>("El correo ya está registrado", headers, HttpStatus.BAD_REQUEST);
            } 
            if (signUpService.existeNombreUsuario(verifyDTO.getNombreUsuario())) {
                return new ResponseEntity<>("El nombre de usuario ya está registrado", headers, HttpStatus.BAD_REQUEST);
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
    
    @PostMapping("/verificarRegistro")
    public ResponseEntity<?> verificarRegistro(@Valid @RequestBody TokenVerificationDTO verificationDTO) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");
        try {
            if (tokenService.validateToken(verificationDTO.getIdentifier(), verificationDTO.getToken())) {
                return new ResponseEntity<>("Token de verificación correcto", headers, HttpStatus.OK);
            }
            else {
                return new ResponseEntity<>("Token de verificación incorrecto", headers, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            return new ResponseEntity<>("Error en el servidor: " + e.getMessage(), headers, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @PostMapping("/altaUsuario")
    public ResponseEntity<String> altaUsuario(@Valid @RequestBody NuevoUsuarioDTO nuevoUsuarioDTO) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");
        try {
            Usuario usuario = modelMapper.map(nuevoUsuarioDTO, Usuario.class);
            signUpService.save(usuario);       
            return new ResponseEntity<>("Cuenta creada con éxito.", headers, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error: " + e.getMessage(), headers, HttpStatus.BAD_REQUEST);
        }
    } 
}