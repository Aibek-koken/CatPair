package com.Aibek.CatPair.listing;

import com.Aibek.CatPair.common.ApiException;
import com.Aibek.CatPair.dictionary.Breed;
import com.Aibek.CatPair.dictionary.BreedRepository;
import com.Aibek.CatPair.dictionary.City;
import com.Aibek.CatPair.dictionary.CityRepository;
import com.Aibek.CatPair.listing.dto.ListingCreateRequest;
import com.Aibek.CatPair.listing.dto.ListingResponse;
import com.Aibek.CatPair.listing.dto.ListingStatusRequest;
import com.Aibek.CatPair.listing.dto.ListingSummaryResponse;
import com.Aibek.CatPair.listing.dto.ListingUpdateRequest;
import com.Aibek.CatPair.user.User;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/listings")
public class ListingController {

    private final ListingService listingService;
    private final CityRepository cityRepository;
    private final BreedRepository breedRepository;

    public ListingController(ListingService listingService,
                             CityRepository cityRepository,
                             BreedRepository breedRepository) {
        this.listingService = listingService;
        this.cityRepository = cityRepository;
        this.breedRepository = breedRepository;
    }

    @GetMapping
    public List<ListingSummaryResponse> getListings(@RequestParam(required = false) Long cityId,
                                                    @RequestParam(required = false) String city,
                                                    @RequestParam(required = false) Long breedId,
                                                    @RequestParam(required = false) String breed,
                                                    @RequestParam(required = false) Long parentBreedId,
                                                    @RequestParam(required = false) String parentBreed,
                                                    @RequestParam(required = false) Integer age,
                                                    @RequestParam(required = false) String query,
                                                    @RequestParam(required = false) ListingStatus status) {
        Long resolvedCityId = resolveCityId(cityId, city);
        String resolvedBreedName = breedId == null ? breed : null;
        Long resolvedParentBreedId = resolveBreedId(parentBreedId, parentBreed);
        return listingService.getListings(resolvedCityId, breedId, resolvedBreedName, resolvedParentBreedId, age, query, status);
    }

    @GetMapping("/{id}")
    public ListingResponse getListing(@PathVariable Long id) {
        return listingService.getListing(id);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ListingResponse createListing(@AuthenticationPrincipal User currentUser,
                                         @Valid @RequestPart("data") ListingCreateRequest request,
                                         @RequestPart(value = "photos", required = false) MultipartFile[] photos) {
        return listingService.createListing(currentUser, request, photos);
    }

    @PutMapping("/{id}")
    public ListingResponse updateListing(@AuthenticationPrincipal User currentUser,
                                         @PathVariable Long id,
                                         @Valid @RequestBody ListingUpdateRequest request) {
        return listingService.updateListing(currentUser, id, request);
    }

    @PatchMapping("/{id}/status")
    public ListingResponse updateStatus(@AuthenticationPrincipal User currentUser,
                                        @PathVariable Long id,
                                        @Valid @RequestBody ListingStatusRequest request) {
        return listingService.updateStatus(currentUser, id, request);
    }

    private Long resolveCityId(Long cityId, String cityName) {
        if (cityId != null || cityName == null || cityName.isBlank()) {
            return cityId;
        }
        City city = cityRepository.findByNameIgnoreCase(cityName.trim())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "City not found"));
        return city.getId();
    }

    private Long resolveBreedId(Long breedId, String breedName) {
        if (breedId != null || breedName == null || breedName.isBlank()) {
            return breedId;
        }
        Breed breed = breedRepository.findByNameIgnoreCase(breedName.trim())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Breed not found"));
        return breed.getId();
    }
}
