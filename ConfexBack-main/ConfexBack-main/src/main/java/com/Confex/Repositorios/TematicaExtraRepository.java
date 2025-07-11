package com.Confex.Repositorios;

import com.Confex.Entidades.TematicaExtra;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TematicaExtraRepository extends JpaRepository<TematicaExtra, Integer>{
    Set<TematicaExtra> findByCongreso_IdCongreso(Integer idCongreso);
}
