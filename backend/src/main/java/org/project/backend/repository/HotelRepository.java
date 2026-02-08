package org.project.backend.repository;

import org.project.backend.model.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Integer> {

    List<Hotel> findByCityIdCity(Integer cityId);

    boolean existsByNomAndCityIdCity(String nom, Integer cityId);
}
