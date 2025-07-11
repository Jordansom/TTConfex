package com.Confex.Repositorios;

import com.Confex.Entidades.Asistencia;
import com.Confex.Entidades.Congreso;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AsistenciaRepository extends JpaRepository<Asistencia, Integer> {
    
    @Query("SELECT a FROM Asistencia a WHERE a.idAsistente = :idAsistente")
    Optional<Asistencia> findByIdAsistente(@Param("idAsistente") Integer idAsistente);
    
    @Query("SELECT a FROM Asistencia a " +
           "JOIN a.asistente ast " +
           "WHERE ast.idCongreso = :idCongreso")
    List<Asistencia> findByIdCongreso(@Param("idCongreso") Integer idCongreso);

    @Query("SELECT a FROM Asistencia a " +
           "JOIN a.asistente ast " +
           "WHERE ast.idCongreso = :idCongreso AND ast.idUsuario IN :idUsuarios")
    List<Congreso> findAsistentesByIdCongresoAndIdUsuarioIn(Integer idUsuario);


    
}