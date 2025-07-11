package com.Confex.Repositorios;

import com.Confex.Entidades.FechasCongreso;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface FechasCongresoRepository extends JpaRepository<FechasCongreso, Integer> {
    
    @Query("SELECT f FROM FechasCongreso f WHERE f.congreso.idCongreso = :idCongreso")
    Optional<FechasCongreso> obtenerFechasPorCongreso(@Param("idCongreso") Integer idCongreso);
}
