package com.Confex.Repositorios;

import com.Confex.Entidades.FotoUsuario;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FotoUsuarioRepository extends JpaRepository<FotoUsuario, Integer>{
    Optional<FotoUsuario> findByUsuario_IdUsuario(Integer idUsuario);
}
