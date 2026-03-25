package com.Aibek.CatPair.dictionary;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class BreedSeeder implements ApplicationRunner {

    private final BreedRepository breedRepository;

    public BreedSeeder(BreedRepository breedRepository) {
        this.breedRepository = breedRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        List<String> breedNames = List.of(
                "Абиссинская",
                "Американская короткошёрстная",
                "Бенгальская",
                "Бирманская",
                "Британская короткошёрстная",
                "Бурманская",
                "Девон-рекс",
                "Египетская мау",
                "Корниш-рекс",
                "Курильский бобтейл",
                "Манчкин",
                "Мейн-кун",
                "Невская маскарадная",
                "Норвежская лесная",
                "Ориентальная",
                "Оцикет",
                "Персидская",
                "Рэгдолл",
                "Русская голубая",
                "Саванна",
                "Сиамская",
                "Сибирская",
                "Скоттиш-фолд",
                "Сноу-шу",
                "Сомалийская",
                "Сфинкс",
                "Тойгер",
                "Турецкая ангора",
                "Шартрез",
                "Экзотическая короткошёрстная"
        );

        if (breedNames.isEmpty()) {
            return;
        }

        Set<String> existing = breedRepository.findAll().stream()
                .map((breed) -> breed.getName().toLowerCase(Locale.ROOT))
                .collect(Collectors.toSet());

        List<Breed> toSave = new ArrayList<>();
        for (String name : breedNames) {
            if (name == null || name.isBlank()) {
                continue;
            }
            String normalized = name.trim();
            if (existing.contains(normalized.toLowerCase(Locale.ROOT))) {
                continue;
            }
            Breed breed = new Breed();
            breed.setName(normalized);
            toSave.add(breed);
        }

        if (!toSave.isEmpty()) {
            breedRepository.saveAll(toSave);
        }
    }
}
