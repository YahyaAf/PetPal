package org.project.backend.repository;

import org.project.backend.model.City;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CityRepository extends JpaRepository<City, Integer> {

    boolean existsByNomVille(String nomVille);
}
