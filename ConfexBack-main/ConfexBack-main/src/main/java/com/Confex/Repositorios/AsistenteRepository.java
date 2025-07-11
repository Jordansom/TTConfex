package com.Confex.Repositorios;

import com.Confex.Entidades.Asistente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AsistenteRepository extends JpaRepository<Asistente, Integer> {
    
    @Query("SELECT a FROM Asistente a WHERE a.idCongreso = :idCongreso")
    List<Asistente> findByIdCongreso(@Param("idCongreso") Integer idCongreso);
    
    @Query("SELECT a FROM Asistente a WHERE a.idCongreso = :idCongreso AND a.idUsuario = :idUsuario")
    Optional<Asistente> findByIdCongresoAndIdUsuario(@Param("idCongreso") Integer idCongreso, @Param("idUsuario") Integer idUsuario);
    
    @Query("SELECT a.idUsuario FROM Asistente a WHERE a.idCongreso = :idCongreso")
    List<Integer> findUsuarioIdsByIdCongreso(@Param("idCongreso") Integer idCongreso);
    
    @Query("SELECT a.idUsuario FROM Asistente a WHERE a.idCongreso = ?1 AND a.idUsuario IN ?2")
    List<Integer> findAsistentesByIdCongresoAndIdUsuarioIn(Integer idCongreso, List<Integer> idUsuarios);
    
    List<Asistente> findByIdUsuario(Integer idUsuario);
    void deleteByIdCongresoAndIdUsuario(Integer idCongreso, Integer idUsuario);
}
