package com.Confex.Repositorios;

import com.Confex.Entidades.Evaluador;
import com.Confex.Entidades.EvaluadorTematica;
import com.Confex.Entidades.Tematica;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EvaluadorTematicasRepository extends JpaRepository<EvaluadorTematica, Integer> {
    
    @Query("SELECT et.tematica FROM EvaluadorTematica et WHERE et.evaluador.idEvaluador = :idEvaluador")
    Set<Tematica> obtenerTematicasPorEvaluador(@Param("idEvaluador") Integer idEvaluador);

    @Query("SELECT et.evaluador FROM EvaluadorTematica et WHERE et.tematica.idTematica = :idTematica")
    Set<Evaluador> obtenerEvaluadoresPorTematica(@Param("idTematica") Integer idTematica);
    
    @Query("""
        SELECT et.evaluador 
        FROM EvaluadorTematica et 
        WHERE et.tematica.idTematica = :idTematica 
          AND et.evaluador.congreso.idCongreso = :idCongreso
    """)
    Set<Evaluador> obtenerEvaluadoresPorTematicaYCongreso(@Param("idTematica") Integer idTematica, @Param("idCongreso") Integer idCongreso);
}