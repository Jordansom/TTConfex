package com.Confex.Repositorios;

import com.Confex.Entidades.Congreso;
import com.Confex.Entidades.Evaluador;
import java.util.Optional;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EvaluadorRepository extends JpaRepository<Evaluador, Integer> {
    
    Set<Evaluador> findByCongreso_IdCongreso(Integer idCongreso);
    
    Optional<Evaluador> findByIdEvaluador(Integer idEvaluador);
    
    Set<Evaluador> findByUsuario_IdUsuario(Integer idUsuario);
    
    
     // Method 1: Fetch join to eagerly load evaluadorTematicas
    @Query("SELECT e FROM Evaluador e " +
           "LEFT JOIN FETCH e.evaluadorTematicas et " +
           "LEFT JOIN FETCH et.tematica " +
           "WHERE e.congreso.idCongreso = :idCongreso " +
           "AND e.usuario.idUsuario = :idUsuario")
    Optional<Evaluador> findByCongreso_IdCongresoAndUsuario_IdUsuarioWithTematicas(
        @Param("idCongreso") Integer idCongreso, 
        @Param("idUsuario") Integer idUsuario
    );
    
    // Method 2: Alternative approach - get tematica IDs directly
    @Query("SELECT et.tematica.idTematica FROM EvaluadorTematica et " +
           "WHERE et.evaluador.congreso.idCongreso = :idCongreso " +
           "AND et.evaluador.usuario.idUsuario = :idUsuario")
    Set<Integer> findTematicaIdsByCongresoAndUsuario(
        @Param("idCongreso") Integer idCongreso, 
        @Param("idUsuario") Integer idUsuario
    );
    
    // Method 3: Get evaluador with basic info only
    @Query("SELECT e FROM Evaluador e " +
           "WHERE e.congreso.idCongreso = :idCongreso " +
           "AND e.usuario.idUsuario = :idUsuario")
    Optional<Evaluador> findByCongreso_IdCongresoAndUsuario_IdUsuario(
        @Param("idCongreso") Integer idCongreso, 
        @Param("idUsuario") Integer idUsuario
    );
    
    // Existing method with fetch join improvement
    @Query("SELECT e.congreso FROM Evaluador e WHERE e.usuario.idUsuario = :idUsuario")
    Set<Congreso> findCongresosByIdUsuario(Integer idUsuario);
}
