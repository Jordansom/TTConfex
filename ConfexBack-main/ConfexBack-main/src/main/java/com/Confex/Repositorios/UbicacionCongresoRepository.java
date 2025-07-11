package com.Confex.Repositorios;

import com.Confex.Entidades.UbicacionCongreso;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UbicacionCongresoRepository extends JpaRepository<UbicacionCongreso, Integer> {
    Optional<UbicacionCongreso> findByCongreso_IdCongreso(Integer idCongreso);
}
