package com.Confex.Repositorios;

import com.Confex.Entidades.SalaCongreso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SalaRepository extends JpaRepository<SalaCongreso, Integer> {
    
    List<SalaCongreso> findByIdCongreso(Integer idCongreso);
    
    Optional<SalaCongreso> findByIdCongresoAndNombreSala(Integer idCongreso, String nombreSala);
    
    @Modifying
    @Query("DELETE FROM SalaCongreso s WHERE s.idCongreso = :idCongreso AND s.idSala NOT IN " +
           "(SELECT DISTINCT e.idSala FROM EventoHorario e JOIN HorarioCongreso h ON e.idHorario = h.idHorario " +
           "WHERE h.idCongreso = :idCongreso AND e.idSala IS NOT NULL)")
    void deleteByIdCongresoAndNotUsed(@Param("idCongreso") Integer idCongreso);
}