package com.Confex.Repositorios;

import com.Confex.Entidades.Tematica;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TematicaRepository extends JpaRepository<Tematica, Integer>{
    Optional<Tematica> findByIdTematica (Integer idTematica);
    Optional<Tematica> findByNombre (String nombre);
}
