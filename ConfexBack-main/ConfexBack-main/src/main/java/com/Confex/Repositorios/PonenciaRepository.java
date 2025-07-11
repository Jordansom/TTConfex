package com.Confex.Repositorios;

import com.Confex.Entidades.Congreso;
import com.Confex.Entidades.Ponencia;

import java.util.List;
import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PonenciaRepository extends JpaRepository<Ponencia, Integer> {

    @Query("SELECT e.congreso FROM Ponencia e WHERE e.usuario.idUsuario = :idUsuario")
    List<Ponencia> findByCongresoId(Integer idUsuario);
    @Query("SELECT e FROM Ponencia e WHERE e.congreso.idCongreso = :idCongreso")
    Set<Ponencia> findByCongreso(Congreso idCongreso);
    @Query("SELECT p.congreso FROM Ponencia p WHERE p.usuario.idUsuario = :idUsuario")
    List<Congreso> findCongresosByUsuarioId(@Param("idUsuario") Integer idUsuario);
    @Modifying
    @Query("DELETE FROM Ponencia p WHERE p.congreso.idCongreso = :idCongreso and p.usuario.idUsuario = :idUsuario")
    int deleteByCongresoIdAndUsuarioId(@Param("idCongreso") Integer idCongreso, @Param("idUsuario") Integer idUsuario);
    @Query("SELECT p FROM Ponencia p " +
           "LEFT JOIN FETCH p.usuario " +
           "LEFT JOIN FETCH p.tematica " +
           "WHERE p.congreso.idCongreso = :idCongreso " +
           "AND p.tematica.idTematica IN :tematicaIds")
    List<Ponencia> findByCongresoAndTematicaIn(
        @Param("idCongreso") Integer idCongreso, 
        @Param("tematicaIds") Set<Integer> tematicaIds
    );
}
