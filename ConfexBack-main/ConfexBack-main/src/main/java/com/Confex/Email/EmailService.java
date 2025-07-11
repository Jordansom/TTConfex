package com.Confex.Email;

import com.Confex.DataTransferObjects.BajaCongresoDTO;
import java.util.List;
import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    public EmailService(JavaMailSender mailSender){
        this.mailSender = mailSender;
    }
    
    public void sendVerificationEmail(String to, String token) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(to);
        helper.setSubject("Confex - Verificación de correo electrónico");
        String content = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                <h2 style="color: #9b59b6; text-align: center;">Bienvenido a Confex</h2>
                <p>Gracias por registrarte. Para verificar tu correo electrónico, utiliza el siguiente código:</p>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center;">
                    <h3 style="margin: 0; letter-spacing: 5px; font-size: 24px;">%s</h3>
                </div>
                <p>Este código es válido por 5 minutos.</p>
                <p>Si no has solicitado este correo, puedes ignorarlo.</p>
                <hr>
                <p style="font-size: 12px; color: #777; text-align: center;">© Confex. Todos los derechos reservados.</p>
            </div>
        """.formatted(token);
        helper.setText(content, true);
        mailSender.send(message);
    }
    
    public void sendPasswordResetEmail(String to, String nombreUsuario, String token) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(to);
        helper.setSubject("Confex - Recuperación de contraseña");
        String emailContent = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                <h2 style="color: #9b59b6; text-align: center;">Recuperación de Contraseña - Confex</h2>
                <p>Hola <strong>%s</strong>,</p>
                <p>Has solicitado restablecer tu contraseña. Utiliza el siguiente código de verificación:</p>
                <div style="text-align: center; margin: 25px 0;">
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; display: inline-block;">
                        <h3 style="margin: 0; letter-spacing: 5px; font-size: 24px;">%s</h3>
                    </div>
                </div>
                <p>Este código es válido por 5 minutos por motivos de seguridad.</p>
                <p>Si no has solicitado este cambio, puedes ignorar este correo y tu contraseña seguirá siendo la misma.</p>
                <hr>
                <p style="font-size: 12px; color: #777; text-align: center;">© Confex. Todos los derechos reservados.</p>
            </div>
        """.formatted(nombreUsuario, token);
        helper.setText(emailContent, true);
        mailSender.send(message);
    }
    
    public void sendStaffNotificationEmail(String to, String nombreCompleto, String nombreCongreso, boolean esEvaluador, boolean esRegistrador, boolean esConferencista, List<String> tematicasEvaluador) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(to);
        helper.setSubject("Confex - Asignación de roles a Congreso");

        StringBuilder roles = new StringBuilder();
        if (esEvaluador) roles.append("Evaluador<br>");
        if (esRegistrador) roles.append("Registrador<br>");
        if (esConferencista) roles.append("Conferencista<br>");

        StringBuilder tematicasHtml = new StringBuilder();
        if (!tematicasEvaluador.isEmpty()) {
            tematicasHtml.append("<p><strong>Temáticas asignadas como evaluador:</strong></p><ul>");
            tematicasEvaluador.forEach(t -> {
                tematicasHtml.append("<li>").append(t).append("</li>");
            });
            tematicasHtml.append("</ul>");
        }

        String content = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                <h2 style="color: #9b59b6; text-align: center;">Has sido asignado a un Congreso</h2>
                <p>Hola <strong>%s</strong>,</p>
                <p>Te notificamos que has sido asignado al congreso <strong>%s</strong> con el(los) siguiente(s) rol(es):</p>
                <div style="background-color: #f5f5f5; padding: 10px 15px; border-radius: 5px;">%s</div>
                %s
                <p>Gracias por participar en el desarrollo de este evento, si no estas de acuerdo con el(los) rol(es) puedes darte de baja en cualquier momento.</p>
                <hr>
                <p style="font-size: 12px; color: #777; text-align: center;">© Confex. Todos los derechos reservados.</p>
            </div>
            """.formatted(nombreCompleto, nombreCongreso, roles, tematicasHtml);

        helper.setText(content, true);
        mailSender.send(message);
    }
    
    public void sendBajaStaffNotification(String to, String nombreCongreso, String nombreCompleto, String roles) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(to);
        helper.setSubject("Confex - Notificación de baja de staff");

        String html = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                <h2 style="color: #9b59b6; text-align: center;">Baja de Staff en Congreso</h2>
                <p>Le informamos que el usuario <strong>%s</strong> se ha dado de baja del sistema.</p>
                <p>Este usuario formaba parte del congreso <strong>%s</strong> con el/los rol(es): <strong>%s</strong>.</p>
                <p>Si esta acción no fue autorizada, por favor contacte al soporte.</p>
                <hr>
                <p style="font-size: 12px; color: #777; text-align: center;">© Confex. Todos los derechos reservados.</p>
            </div>
        """.formatted(nombreCompleto, nombreCongreso, roles);

        helper.setText(html, true);
        mailSender.send(message);
    }
    
    public void sendBajaPorBajaOrganizador(String to, String nombreParticipante, List<BajaCongresoDTO> congresosYRoles) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(to);
        helper.setSubject("Confex - Notificación de baja en congresos");

        StringBuilder cuerpoHtml = new StringBuilder("""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                <h2 style="color: #9b59b6; text-align: center;">Baja de Congresos por cambio de organización</h2>
                <p>Estimado/a <strong>%s</strong>,</p>
                <p>Le informamos que ha sido removido de uno o más congresos debido a la baja del organizador principal.</p>
                <p>A continuación se enlistan los congresos afectados y los roles que usted desempeñaba en cada uno:</p>
                <ul style="padding-left: 20px;">
        """.formatted(nombreParticipante));

        congresosYRoles.forEach(item -> {
            String rolesConcat = String.join(", ", item.getRoles());
            cuerpoHtml.append("<li><strong>")
                    .append(item.getNombreCongreso())
                    .append(":</strong> ")
                    .append(rolesConcat)
                    .append("</li>");
        });

        cuerpoHtml.append("""
                </ul>
                <p>Si considera que esto fue un error, por favor contacte al soporte de Confex.</p>
                <hr>
                <p style="font-size: 12px; color: #777; text-align: center;">© Confex. Todos los derechos reservados.</p>
            </div>
        """);

        helper.setText(cuerpoHtml.toString(), true);
        mailSender.send(message);
    }

    
    public void sendPromocionOrganizadorNotification(String to, String nombreCompleto) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(to);
        helper.setSubject("Confex - ¡Has sido promovido a Organizador!");

        String html = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                <h2 style="color: #9b59b6; text-align: center;">¡Felicidades, %s!</h2>
                <p>Te informamos que has sido promovido como <strong>Organizador</strong> en el sistema <strong>Confex</strong>.</p>
                <p>A partir de ahora, tendrás privilegios especiales para gestionar tus propios congresos.</p>
                <p>Te invitamos a ingresar al sistema para comenzar a crear y compartir con la comunidad tus futuros proyectos.</p>
                <hr>
                <p style="font-size: 12px; color: #777; text-align: center;">© Confex. Todos los derechos reservados.</p>
            </div>
        """.formatted(nombreCompleto);

        helper.setText(html, true);
        mailSender.send(message);
    }
    
    public void sendRemocionOrganizadorNotification(String to, String nombreCompleto) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(to);
        helper.setSubject("Confex - Remoción de privilegios de Organizador");

        String html = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                <h2 style="color: #e74c3c; text-align: center;">Cambio en tus privilegios</h2>
                <p>Estimado/a <strong>%s</strong>,</p>
                <p>Te informamos que tus privilegios como <strong>Organizador</strong> en el sistema <strong>Confex</strong> han sido removidos.</p>
                <p>Esto significa que ya no podrás crear o administrar nuevos congresos dentro de la plataforma.</p>
                <p>Si consideras que esto ha sido un error, por favor ponte en contacto con el soporte técnico de Confex para más información.</p>
                <hr>
                <p style="font-size: 12px; color: #777; text-align: center;">© Confex. Todos los derechos reservados.</p>
            </div>
        """.formatted(nombreCompleto);

        helper.setText(html, true);
        mailSender.send(message);
    }
    
    public void sendRemocionTematicaNotificationAdmin(String to, String nombreCompleto, String nombreTematica) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(to);
        helper.setSubject("Confex - Remoción de temática: " + nombreTematica);

        String html = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                <h2 style="color: #e67e22; text-align: center;">Remoción de temática</h2>
                <p>Estimado/a <strong>%s</strong>,</p>
                <p>Queremos informarte que por razones administrativas, la temática <strong>%s</strong> ha sido removida del sistema <strong>Confex</strong>.</p>
                <p>Como consecuencia, ha sido eliminada de los congresos en los que estaba registrada, así como de los evaluadores asociados a dicha temática.</p>
                <p>Te invitamos a ingresar a la edición de tus congresos para actualizar la asignación de temáticas o modificar tu equipo de evaluadores si es necesario.</p>
                <p>Lamentamos los inconvenientes y agradecemos tu comprensión.</p>
                <hr>
                <p style="font-size: 12px; color: #777; text-align: center;">© Confex. Todos los derechos reservados.</p>
            </div>
        """.formatted(nombreCompleto, nombreTematica);

        helper.setText(html, true);
        mailSender.send(message);
    }
    
    public void sendRemocionTematicaNotificationStaff(String to, String nombreCompleto, String nombreCongreso, String nombreTematica) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(to);
        helper.setSubject("Confex - Remoción de temática: " + nombreTematica);

        String html = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                <h2 style="color: #e67e22; text-align: center;">Remoción de temática</h2>
                <p>Estimado/a evaluador <strong>%s</strong> del congreso <strong>%s</strong>,</p>
                <p>Queremos informarte que por razones administrativas, la temática <strong>%s</strong> ha sido removida del sistema <strong>Confex</strong>.</p>
                <p>Como consecuencia, ha sido eliminada de los congresos en los que estaba registrada, así como de los evaluadores asociados a dicha temática.</p>
                <p>Lamentamos los inconvenientes y agradecemos tu comprensión.</p>
                <hr>
                <p style="font-size: 12px; color: #777; text-align: center;">© Confex. Todos los derechos reservados.</p>
            </div>
        """.formatted(nombreCompleto, nombreCongreso, nombreTematica);

        helper.setText(html, true);
        mailSender.send(message);
    }
    
    // --- NUEVOS CORREOS PARA DICTAMEN DE PONENCIA ---
    public void sendPonenciaAceptadaEmail(String to, String nombreCompleto, String nombreCongreso, String tituloPonencia) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(to);
        helper.setSubject("Confex - Tu trabajo ha sido ACEPTADO");

        String content = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                <h2 style="color: #28a745; text-align: center;">¡Felicidades, %s!</h2>
                <p>Tu trabajo <strong>%s</strong> ha sido <b>aceptado</b> para el congreso <strong>%s</strong>.</p>
                <p>Podrás descargar tu gafete en la sección <b>Mis Ponencias</b> próximamente y te pedimos estar pendiente de tu correo para más información sobre el evento.</p>
                <p>¡Gracias por participar!</p>
                <hr>
                <p style="font-size: 12px; color: #777; text-align: center;">© Confex. Todos los derechos reservados.</p>
            </div>
        """.formatted(nombreCompleto, tituloPonencia, nombreCongreso);

        helper.setText(content, true);
        mailSender.send(message);
    }

    public void sendPonenciaRechazadaEmail(String to, String nombreCompleto, String nombreCongreso, String tituloPonencia, String comentario) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(to);
        helper.setSubject("Confex - Tu trabajo ha sido RECHAZADO");

        String content = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                <h2 style="color: #dc3545; text-align: center;">Dictamen de tu trabajo</h2>
                <p>Lamentamos informarte que tu trabajo <strong>%s</strong> para el congreso <strong>%s</strong> ha sido <b>rechazado</b>.</p>
                %s
                <p>Si tienes dudas o deseas más información, por favor comunícate con el Staff del congreso.</p>
                <hr>
                <p style="font-size: 12px; color: #777; text-align: center;">© Confex. Todos los derechos reservados.</p>
            </div>
        """.formatted(
            tituloPonencia,
            nombreCongreso,
            (comentario != null && !comentario.trim().isEmpty())
                ? "<div style='background:#f8d7da;padding:10px;border-radius:5px;margin:10px 0;'><b>Comentario del evaluador:</b><br>" + comentario + "</div>"
                : ""
        );

        helper.setText(content, true);
        mailSender.send(message);
    }

    public void sendPonenciaDevueltaEmail(String to, String nombreCompleto, String nombreCongreso, String tituloPonencia, String comentario) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(to);
        helper.setSubject("Confex - Tu trabajo requiere corrección");

        String content = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                <h2 style="color: #ffc107; text-align: center;">Tu trabajo requiere corrección</h2>
                <p>Tu trabajo <strong>%s</strong> para el congreso <strong>%s</strong> ha sido <b>devuelto</b> para corrección.</p>
                %s
                <p>Por favor ingresa a la sección <b>Mis Congresos</b> para actualizar tu trabajo y volver a enviarlo.</p>
                <hr>
                <p style="font-size: 12px; color: #777; text-align: center;">© Confex. Todos los derechos reservados.</p>
            </div>
        """.formatted(
            tituloPonencia,
            nombreCongreso,
            (comentario != null && !comentario.trim().isEmpty())
                ? "<div style='background:#fff3cd;padding:10px;border-radius:5px;margin:10px 0;'><b>Comentario del evaluador:</b><br>" + comentario + "</div>"
                : ""
        );

        helper.setText(content, true);
        mailSender.send(message);
    }
    
    public void sendPonenciaEliminadaEvaluadorEmail(String to, String nombreEvaluador, String nombreCongreso, String tituloPonencia, String motivo) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(to);
        helper.setSubject("Confex - Ponencia eliminada de tu evaluación");

        String content = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                <h2 style="color: #dc3545; text-align: center;">Ponencia eliminada</h2>
                <p>Estimado/a <b>%s</b>,</p>
                <p>La ponencia <strong>%s</strong> del congreso <strong>%s</strong> ha sido eliminada por el ponente y ya no requiere tu evaluación.</p>
                <div style='background:#f8d7da;padding:10px;border-radius:5px;margin:10px 0;'><b>Motivo:</b><br>%s</div>
                <p>Gracias por tu colaboración.</p>
                <hr>
                <p style="font-size: 12px; color: #777; text-align: center;">© Confex. Todos los derechos reservados.</p>
            </div>
        """.formatted(nombreEvaluador, tituloPonencia, nombreCongreso, motivo);

        helper.setText(content, true);
        mailSender.send(message);
    }

    public void sendPonenciaEliminadaOrganizadorEmail(String to, String nombreOrganizador, String nombreCongreso, String tituloPonencia, String motivo) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(to);
        helper.setSubject("Confex - Ponencia eliminada en tu congreso");

        String content = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                <h2 style="color: #dc3545; text-align: center;">Ponencia eliminada</h2>
                <p>Estimado/a <b>%s</b>,</p>
                <p>La ponencia <strong>%s</strong> en el congreso <strong>%s</strong> ha sido eliminada por el ponente. El dictamen asociado también ha sido eliminado.</p>
                <div style='background:#f8d7da;padding:10px;border-radius:5px;margin:10px 0;'><b>Motivo:</b><br>%s</div>
                <p>Para más detalles, consulta el panel de administración.</p>
                <hr>
                <p style="font-size: 12px; color: #777; text-align: center;">© Confex. Todos los derechos reservados.</p>
            </div>
        """.formatted(nombreOrganizador, tituloPonencia, nombreCongreso, motivo);

        helper.setText(content, true);
        mailSender.send(message);
    }
}
