package com.Aibek.CatPair.dictionary;

import com.Aibek.CatPair.dictionary.dto.BreedResponse;
import com.Aibek.CatPair.dictionary.dto.CityResponse;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DictionaryService {

    private final CityRepository cityRepository;
    private final BreedRepository breedRepository;

    public DictionaryService(CityRepository cityRepository, BreedRepository breedRepository) {
        this.cityRepository = cityRepository;
        this.breedRepository = breedRepository;
    }

    @Transactional(readOnly = true)
    public List<CityResponse> getCities() {
        List<City> cities = cityRepository.findAllByOrderByNameAsc();
        List<CityResponse> response = new ArrayList<>();
        for (City city : cities) {
            CityResponse dto = new CityResponse();
            dto.setId(city.getId());
            dto.setName(city.getName());
            response.add(dto);
        }
        return response;
    }

    @Transactional(readOnly = true)
    public List<BreedResponse> getBreeds() {
        List<Breed> breeds = breedRepository.findAllByOrderByNameAsc();
        List<BreedResponse> response = new ArrayList<>();
        for (Breed breed : breeds) {
            BreedResponse dto = new BreedResponse();
            dto.setId(breed.getId());
            dto.setName(breed.getName());
            if (breed.getParent() != null) {
                dto.setParentId(breed.getParent().getId());
            }
            response.add(dto);
        }
        return response;
    }
}
