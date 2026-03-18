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
public class CitySeeder implements ApplicationRunner {

    private final CityRepository cityRepository;

    public CitySeeder(CityRepository cityRepository) {
        this.cityRepository = cityRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        List<String> cityNames = List.of(
                "Астана",
                "Алматы",
                "Шымкент",
                "Актау",
                "Актобе",
                "Атырау",
                "Жезказган",
                "Караганда",
                "Кокшетау",
                "Костанай",
                "Кызылорда",
                "Павлодар",
                "Петропавловск",
                "Семей",
                "Талдыкорган",
                "Тараз",
                "Туркестан",
                "Уральск",
                "Усть-Каменогорск",
                "Конаев"
        );

        if (cityNames.isEmpty()) {
            return;
        }

        Set<String> existing = cityRepository.findAll().stream()
                .map((city) -> city.getName().toLowerCase(Locale.ROOT))
                .collect(Collectors.toSet());

        List<City> toSave = new ArrayList<>();
        for (String name : cityNames) {
            if (name == null || name.isBlank()) {
                continue;
            }
            String normalized = name.trim();
            if (existing.contains(normalized.toLowerCase(Locale.ROOT))) {
                continue;
            }
            City city = new City();
            city.setName(normalized);
            toSave.add(city);
        }

        if (!toSave.isEmpty()) {
            cityRepository.saveAll(toSave);
        }
    }
}
