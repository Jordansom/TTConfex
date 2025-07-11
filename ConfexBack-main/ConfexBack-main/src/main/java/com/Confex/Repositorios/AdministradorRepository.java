package com.Confex.Repositorios;

import com.Confex.Entidades.Administrador;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdministradorRepository extends JpaRepository<Administrador, Integer>{
    Optional<Administrador> findByUsuario_IdUsuario(Integer idUsuario);
}
