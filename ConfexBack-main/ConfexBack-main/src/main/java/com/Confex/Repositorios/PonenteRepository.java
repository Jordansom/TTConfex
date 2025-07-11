package com.Confex.Repositorios;

import com.Confex.Entidades.Congreso;
import com.Confex.Entidades.Ponente;
import java.util.Optional;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PonenteRepository extends JpaRepository<Ponente, Integer> {
    
    Set<Ponente> findByCongreso_IdCongreso(Integer idCongreso);
    
    Optional<Ponente> findByIdPonente(Integer idPonente);
    
    Set<Ponente> findByUsuario_IdUsuario(Integer idUsuario);
    
    @Query("SELECT e.congreso FROM Ponente e WHERE e.usuario.idUsuario = :idUsuario")
    Set<Congreso> findCongresosByIdUsuario(Integer idUsuario);
}
