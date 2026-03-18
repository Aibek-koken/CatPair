package com.Aibek.CatPair.dictionary;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CityRepository extends JpaRepository<City, Long> {
    List<City> findAllByOrderByNameAsc();
    Optional<City> findByNameIgnoreCase(String name);
}
