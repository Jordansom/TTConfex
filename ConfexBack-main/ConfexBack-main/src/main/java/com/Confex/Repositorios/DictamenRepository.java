package com.Confex.Repositorios;

import com.Confex.Entidades.Dictamen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface DictamenRepository extends JpaRepository<Dictamen, Integer> {
    Optional<Dictamen> findByCongreso_IdCongresoAndPonencia_IdPonencia(Integer idCongreso, Integer idPonencia);
}
