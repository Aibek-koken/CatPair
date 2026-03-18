package com.Aibek.CatPair.dictionary;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BreedRepository extends JpaRepository<Breed, Long> {
    List<Breed> findAllByOrderByNameAsc();
    Optional<Breed> findByNameIgnoreCase(String name);
}
