package com.Confex.Repositorios;

import com.Confex.Entidades.Conferencista;
import com.Confex.Entidades.Congreso;
import java.util.Optional;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ConferencistaRepository extends JpaRepository<Conferencista, Integer> {
    
    Set<Conferencista> findByCongreso_IdCongreso(Integer idCongreso);
    
    Optional<Conferencista> findByIdConferencista(Integer idConferencista);
    
    Set<Conferencista> findByUsuario_IdUsuario(Integer idUsuario);
    
    @Query("SELECT e.congreso FROM Conferencista e WHERE e.usuario.idUsuario = :idUsuario")
    Set<Congreso> findCongresosByIdUsuario(Integer idUsuario);

    @Query("SELECT c FROM Conferencista c WHERE c.congreso.idCongreso = :idCongreso AND c.usuario.idUsuario = :idUsuario")
    Optional<Conferencista> findByIdCongresoAndIdUsuario(Integer idCongreso, Integer idUsuario);
}
