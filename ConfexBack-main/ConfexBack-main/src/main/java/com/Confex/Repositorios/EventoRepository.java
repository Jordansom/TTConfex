package com.Confex.Repositorios;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.Confex.Entidades.EventoHorario;

@Repository
public interface EventoRepository extends JpaRepository<EventoHorario, Integer> {
    List<EventoHorario> findByIdHorario(Integer idHorario);
    void deleteByIdHorario(Integer idHorario); // Add this method
}
