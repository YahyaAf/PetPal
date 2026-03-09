package org.project.backend.repository;

import org.project.backend.model.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Integer> {

    Optional<Client> findByEmail(String email);

    boolean existsByEmail(String email);

    /**
     * Charge le Client via une jointure explicite sur users + clients
     * pour contourner le problème de proxy JPA avec l'héritage JOINED.
     */
    @Query("SELECT c FROM Client c WHERE c.idUser = :id")
    Optional<Client> findClientById(@Param("id") Integer id);
}
