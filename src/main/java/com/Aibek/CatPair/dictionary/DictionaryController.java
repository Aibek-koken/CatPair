package com.Aibek.CatPair.dictionary;

import com.Aibek.CatPair.dictionary.dto.BreedResponse;
import com.Aibek.CatPair.dictionary.dto.CityResponse;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dictionaries")
public class DictionaryController {

    private final DictionaryService dictionaryService;

    public DictionaryController(DictionaryService dictionaryService) {
        this.dictionaryService = dictionaryService;
    }

    @GetMapping("/cities")
    public List<CityResponse> getCities() {
        return dictionaryService.getCities();
    }

    @GetMapping("/breeds")
    public List<BreedResponse> getBreeds() {
        return dictionaryService.getBreeds();
    }
}
