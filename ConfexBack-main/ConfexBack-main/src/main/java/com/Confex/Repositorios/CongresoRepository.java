package com.Confex.Repositorios;

import com.Confex.Entidades.Congreso;

// import antlr.collections.List; // Removed to avoid type conflict

import java.time.LocalDateTime;
import java.util.Set;
import java.util.Optional;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CongresoRepository extends JpaRepository<Congreso, Integer>{
    Optional<Congreso> findByIdCongreso (Integer idCongreso);
    Optional<Congreso> findByNombre (String nombre);
    
    @EntityGraph(attributePaths = {
        "congresoTematicas.tematica",
        "tematicasExtra",
        "ubicacion",
        "fechas",
        "evaluadores.usuario",
        "evaluadores.evaluadorTematicas.tematica",
        "registradores.usuario",
        "conferencistas.usuario",
        "ponentes.usuario",
        "foto"
    })
    @Query("SELECT c FROM Congreso c WHERE c.administrador.idAdministrador = :idAdministrador")
    Set<Congreso> findFullByAdministrador(@Param("idAdministrador") Integer idAdministrador);
    
// Fechas de convocatoria
    @Query("SELECT c FROM Congreso c JOIN FechasCongreso f ON c.idCongreso = f.idCongreso WHERE f.convocatoriaInicio >= :desde")
    Set<Congreso> buscarPorConvocatoriaInicio(@Param("desde") LocalDateTime desde);

    @Query("SELECT c FROM Congreso c JOIN FechasCongreso f ON c.idCongreso = f.idCongreso WHERE f.convocatoriaFin <= :antes")
    Set<Congreso> buscarPorConvocatoriaFin(@Param("antes") LocalDateTime antes);

    // Fechas de evaluación
    @Query("SELECT c FROM Congreso c JOIN FechasCongreso f ON c.idCongreso = f.idCongreso WHERE f.evaluacionInicio >= :desde")
    Set<Congreso> buscarPorEvaluacionInicio(@Param("desde") LocalDateTime desde);

    @Query("SELECT c FROM Congreso c JOIN FechasCongreso f ON c.idCongreso = f.idCongreso WHERE f.evaluacionFin <= :antes")
    Set<Congreso> buscarPorEvaluacionFin(@Param("antes") LocalDateTime antes);

    // Fechas de dictamen
    @Query("SELECT c FROM Congreso c JOIN FechasCongreso f ON c.idCongreso = f.idCongreso WHERE f.dictamenInicio >= :desde")
    Set<Congreso> buscarPorDictamenInicio(@Param("desde") LocalDateTime desde);

    @Query("SELECT c FROM Congreso c JOIN FechasCongreso f ON c.idCongreso = f.idCongreso WHERE f.dictamenFin <= :antes")
    Set<Congreso> buscarPorDictamenFin(@Param("antes") LocalDateTime antes);
    
    // Fechas de evento
    @Query("SELECT c FROM Congreso c JOIN FechasCongreso f ON c.idCongreso = f.idCongreso WHERE f.eventoInicio >= :desde")
    Set<Congreso> buscarPorEventoInicio(@Param("desde") LocalDateTime desde);

    @Query("SELECT c FROM Congreso c JOIN FechasCongreso f ON c.idCongreso = f.idCongreso WHERE f.eventoFin <= :antes")
    Set<Congreso> buscarPorEventoFin(@Param("antes") LocalDateTime antes);
    
    @Query("""
        SELECT DISTINCT c FROM Congreso c
        LEFT JOIN FETCH c.congresoTematicas ct
        LEFT JOIN FETCH ct.tematica t
        LEFT JOIN FETCH c.tematicasExtra te
        LEFT JOIN FETCH c.fechas f
        LEFT JOIN FETCH c.ubicacion u
        LEFT JOIN FETCH c.evaluadores e
        LEFT JOIN FETCH e.usuario eu
        LEFT JOIN FETCH e.evaluadorTematicas et
        LEFT JOIN FETCH et.tematica ett
        LEFT JOIN FETCH c.registradores r
        LEFT JOIN FETCH r.usuario ru
        LEFT JOIN FETCH c.conferencistas cf
        LEFT JOIN FETCH cf.usuario cfu
        LEFT JOIN FETCH c.ponentes p
        LEFT JOIN FETCH p.usuario pu
        LEFT JOIN FETCH c.foto
    """)
    List<Congreso> findAllWithRelations();
    
    @Query("""
        SELECT c FROM Congreso c
        LEFT JOIN FETCH c.congresoTematicas ct
        LEFT JOIN FETCH ct.tematica t
        LEFT JOIN FETCH c.tematicasExtra te
        LEFT JOIN FETCH c.fechas f
        LEFT JOIN FETCH c.ubicacion u
        LEFT JOIN FETCH c.evaluadores e
        LEFT JOIN FETCH e.usuario eu
        LEFT JOIN FETCH e.evaluadorTematicas et
        LEFT JOIN FETCH et.tematica ett
        LEFT JOIN FETCH c.registradores r
        LEFT JOIN FETCH r.usuario ru
        LEFT JOIN FETCH c.conferencistas cf
        LEFT JOIN FETCH cf.usuario cfu
        LEFT JOIN FETCH c.ponentes p
        LEFT JOIN FETCH p.usuario pu
        LEFT JOIN FETCH c.foto
        WHERE c.idCongreso = :idCongreso
    """)
    Optional<Congreso> findByIdCongresoWithRelations(@Param("idCongreso") Integer idCongreso);
}
