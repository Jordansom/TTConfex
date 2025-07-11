package com.Confex.Repositorios;

import com.Confex.Entidades.FotoCongreso;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FotoCongresoRepository extends JpaRepository<FotoCongreso, Integer>{
    Optional<FotoCongreso> findByCongreso_IdCongreso(Integer idCongreso);
}
