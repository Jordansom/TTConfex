package com.Confex;

import com.Confex.DataTransferObjects.UsuarioDTO;
import com.Confex.Entidades.Usuario;
import java.time.LocalDateTime;
import org.modelmapper.config.Configuration.AccessLevel;
import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ModelMapperConfig {
    @Bean
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();
        modelMapper.addConverter(ctx -> LocalDateTime.parse(ctx.getSource()), String.class, LocalDateTime.class);
        modelMapper.getConfiguration()
          .setSkipNullEnabled(true)
          .setFieldMatchingEnabled(true)
          .setFieldAccessLevel(AccessLevel.PRIVATE);
        modelMapper.addConverter(
            ctx -> ctx.getSource() == null ? null : ctx.getSource().toString(), 
            LocalDateTime.class, 
            String.class
        );
        modelMapper.typeMap(Usuario.class, UsuarioDTO.class).addMappings(mapper -> {
            mapper.skip(UsuarioDTO::setAdministrador);
            mapper.skip(UsuarioDTO::setOrganizador);
            mapper.skip(UsuarioDTO::setEvaluador);
            mapper.skip(UsuarioDTO::setPonente);
            mapper.skip(UsuarioDTO::setRegistrador);
            mapper.skip(UsuarioDTO::setConferencista);
            mapper.skip(UsuarioDTO::setFotoUsuarioUrl);
        });
        return modelMapper;
    }
}
