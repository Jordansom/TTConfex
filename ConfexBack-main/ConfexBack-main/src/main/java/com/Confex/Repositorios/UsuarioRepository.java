package com.Confex.Repositorios;

import com.Confex.Entidades.Usuario;
import java.util.Optional;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer>{
    Optional<Usuario> findByIdUsuario (Integer idUsuario);
    Optional<Usuario> findByNombreUsuarioOrCorreo(String nombreUsuario, String correo);
    @Query("SELECT u FROM Usuario u WHERE (u.nombreUsuario = :nombreUsuario OR u.correo = :correo) AND u.idUsuario <> :id")
    Set<Usuario> findConflictosAlActualizar(@Param("nombreUsuario") String nombreUsuario, @Param("correo") String correo, @Param("id") Integer idUsuario);
    Optional<Usuario> findByCorreo(String correo);
}
