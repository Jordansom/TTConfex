package com.Confex.Repositorios;

import com.Confex.Entidades.EvaluarPonencia;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EvaluarPonenciaRepository extends JpaRepository<EvaluarPonencia, Integer> {
    // Corrige el método: usa evaluador_idEvaluador, no evaluadorId
    List<EvaluarPonencia> findByEvaluador_IdEvaluador(Integer idEvaluador);

    List<EvaluarPonencia> findByPonencia_IdPonencia(Integer idPonencia);
}
