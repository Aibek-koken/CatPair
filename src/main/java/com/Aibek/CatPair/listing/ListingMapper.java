package com.Aibek.CatPair.listing;

import com.Aibek.CatPair.dictionary.Breed;
import com.Aibek.CatPair.dictionary.City;
import com.Aibek.CatPair.listing.dto.ListingResponse;
import com.Aibek.CatPair.listing.dto.ListingSummaryResponse;
import java.util.List;
import java.util.stream.Collectors;

public final class ListingMapper {

    private ListingMapper() {
    }

    public static ListingResponse toResponse(Listing listing) {
        ListingResponse response = new ListingResponse();
        response.setId(listing.getId());
        response.setOwnerId(listing.getOwner().getId());
        response.setOwnerName(listing.getOwner().getName());
        response.setOwnerAvatarUrl(listing.getOwner().getAvatarUrl());
        response.setOwnerCreatedAt(listing.getOwner().getCreatedAt());
        response.setName(listing.getName());
        mapBreedAndCity(response, listing.getBreed(), listing.getCity());
        response.setAge(listing.getAge());
        response.setGender(listing.getGender());
        response.setColor(listing.getColor());
        response.setWeight(listing.getWeight());
        response.setDescription(listing.getDescription());
        response.setPriceType(listing.getPriceType());
        response.setPriceValue(listing.getPriceValue());
        response.setHasDocs(listing.isHasDocs());
        response.setVaccinated(listing.isVaccinated());
        response.setStatus(listing.getStatus());
        response.setCreatedAt(listing.getCreatedAt());
        response.setPhotoUrls(mapPhotoUrls(listing));
        return response;
    }

    public static ListingSummaryResponse toSummary(Listing listing) {
        ListingSummaryResponse response = new ListingSummaryResponse();
        response.setId(listing.getId());
        response.setName(listing.getName());
        Breed breed = listing.getBreed();
        if (breed != null) {
            response.setBreedId(breed.getId());
            response.setBreedName(breed.getName());
        }
        City city = listing.getCity();
        if (city != null) {
            response.setCityId(city.getId());
            response.setCityName(city.getName());
        }
        response.setAge(listing.getAge());
        response.setGender(listing.getGender());
        response.setDescription(listing.getDescription());
        response.setPriceType(listing.getPriceType());
        response.setPriceValue(listing.getPriceValue());
        response.setHasDocs(listing.isHasDocs());
        response.setVaccinated(listing.isVaccinated());
        if (listing.getOwner() != null) {
            response.setOwnerName(listing.getOwner().getName());
        }
        response.setStatus(listing.getStatus());
        response.setCreatedAt(listing.getCreatedAt());
        response.setPhotoUrls(mapPhotoUrls(listing));
        return response;
    }

    private static void mapBreedAndCity(ListingResponse response, Breed breed, City city) {
        if (breed != null) {
            response.setBreedId(breed.getId());
            response.setBreedName(breed.getName());
            if (breed.getParent() != null) {
                response.setParentBreedId(breed.getParent().getId());
            }
        }
        if (city != null) {
            response.setCityId(city.getId());
            response.setCityName(city.getName());
        }
    }

    private static List<String> mapPhotoUrls(Listing listing) {
        return listing.getPhotos().stream()
                .map(ListingPhoto::getPhotoUrl)
                .collect(Collectors.toList());
    }
}
