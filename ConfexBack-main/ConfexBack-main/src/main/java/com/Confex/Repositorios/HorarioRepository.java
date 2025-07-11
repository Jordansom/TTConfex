package com.Confex.Repositorios;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.Confex.Entidades.HorarioCongreso;

@Repository
public interface HorarioRepository extends JpaRepository<HorarioCongreso, Integer> {
    List<HorarioCongreso> findByIdCongreso(Integer idCongreso);
    void deleteByIdCongreso(Integer idCongreso);
}
