package com.Confex.Repositorios;

import com.Confex.Entidades.Congreso;
import com.Confex.Entidades.Registrador;
import java.util.Optional;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface RegistradorRepository extends JpaRepository<Registrador, Integer> {
    
    Set<Registrador> findByCongreso_IdCongreso(Integer idCongreso);
    
    Optional<Registrador> findByIdRegistrador(Integer idRegistrador);
    
    Set<Registrador> findByUsuario_IdUsuario(Integer idUsuario);
    
    @Query("SELECT DISTINCT e.congreso FROM Registrador e LEFT JOIN FETCH e.congreso.congresoTematicas WHERE e.usuario.idUsuario = :idUsuario")
    Set<Congreso> findCongresosByIdUsuario(Integer idUsuario);
}
