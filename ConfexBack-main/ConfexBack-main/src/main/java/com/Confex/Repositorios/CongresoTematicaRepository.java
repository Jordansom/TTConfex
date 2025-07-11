package com.Confex.Repositorios;

import com.Confex.Entidades.Congreso;
import com.Confex.Entidades.CongresoTematica;
import com.Confex.Entidades.Tematica;
import java.util.List;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CongresoTematicaRepository extends JpaRepository<CongresoTematica, Integer> {

    @Query("SELECT ct.tematica FROM CongresoTematica ct WHERE ct.congreso.idCongreso = :idCongreso")
    Set<Tematica> obtenerTematicasPorCongreso(@Param("idCongreso") Integer idCongreso);
    
    @Query("SELECT DISTINCT ct.congreso FROM CongresoTematica ct WHERE ct.tematica.idTematica IN :idsTematicas")
    Set<Congreso> buscarCongresosPorTematicas(@Param("idsTematicas") List<Integer> idsTematicas);
    
    Set<CongresoTematica> findByTematica_IdTematica(Integer idTematica);
}
