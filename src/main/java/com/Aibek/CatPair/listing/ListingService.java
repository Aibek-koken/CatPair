package com.Aibek.CatPair.listing;

import com.Aibek.CatPair.common.ApiException;
import com.Aibek.CatPair.config.FileStorageService;
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
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ListingService {

    private static final int MAX_PHOTOS = 4;

    private final ListingRepository listingRepository;
    private final CityRepository cityRepository;
    private final BreedRepository breedRepository;
    private final FileStorageService fileStorageService;

    public ListingService(ListingRepository listingRepository,
                          CityRepository cityRepository,
                          BreedRepository breedRepository,
                          FileStorageService fileStorageService) {
        this.listingRepository = listingRepository;
        this.cityRepository = cityRepository;
        this.breedRepository = breedRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional(readOnly = true)
    public List<ListingSummaryResponse> getListings(Long cityId, Long breedId, String breedName,
                                                    Long parentBreedId, Integer age, String query, ListingStatus status) {
        String resolvedBreedName = breedId == null ? breedName : null;
        Specification<Listing> spec = Specification.where(ListingSpecifications.hasCity(cityId))
                .and(ListingSpecifications.hasBreed(breedId))
                .and(ListingSpecifications.hasBreedName(resolvedBreedName))
                .and(ListingSpecifications.hasParentBreed(parentBreedId))
                .and(ListingSpecifications.hasAge(age))
                .and(ListingSpecifications.matchesQuery(query))
                .and(ListingSpecifications.hasStatus(status));
        List<Listing> listings = listingRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt"));
        List<ListingSummaryResponse> response = new ArrayList<>();
        for (Listing listing : listings) {
            response.add(ListingMapper.toSummary(listing));
        }
        return response;
    }

    @Transactional(readOnly = true)
    public ListingResponse getListing(Long listingId) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Listing not found"));
        return ListingMapper.toResponse(listing);
    }

    @Transactional(readOnly = true)
    public List<ListingSummaryResponse> getListingsByUser(Long userId) {
        List<Listing> listings = listingRepository.findByOwnerIdOrderByCreatedAtDesc(userId);
        List<ListingSummaryResponse> response = new ArrayList<>();
        for (Listing listing : listings) {
            response.add(ListingMapper.toSummary(listing));
        }
        return response;
    }

    @Transactional
    public ListingResponse createListing(User owner, ListingCreateRequest request, MultipartFile[] photos) {
        Listing listing = new Listing();
        listing.setOwner(owner);
        listing.setName(request.getName().trim());
        listing.setAge(request.getAge());
        listing.setGender(request.getGender());
        listing.setColor(request.getColor());
        listing.setWeight(request.getWeight());
        listing.setDescription(request.getDescription());
        listing.setPriceType(request.getPriceType());
        listing.setPriceValue(request.getPriceValue());
        listing.setHasDocs(request.isHasDocs());
        listing.setVaccinated(request.isVaccinated());

        if (request.getCityId() != null) {
            City city = cityRepository.findById(request.getCityId())
                    .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "City not found"));
            listing.setCity(city);
        }
        Breed resolvedBreed = resolveBreed(request.getBreedId(), request.getBreedName());
        if (resolvedBreed != null) {
            listing.setBreed(resolvedBreed);
        }

        if (photos != null && photos.length > 0) {
            if (photos.length > MAX_PHOTOS) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Maximum 4 photos allowed");
            }
            for (MultipartFile file : photos) {
                String url = fileStorageService.store(file);
                ListingPhoto photo = new ListingPhoto();
                photo.setListing(listing);
                photo.setPhotoUrl(url);
                listing.getPhotos().add(photo);
            }
        }

        Listing saved = listingRepository.save(listing);
        return ListingMapper.toResponse(saved);
    }

    @Transactional
    public ListingResponse updateListing(User owner, Long listingId, ListingUpdateRequest request) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Listing not found"));
        if (!listing.getOwner().getId().equals(owner.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can update only your listings");
        }

        if (request.getName() != null) {
            listing.setName(request.getName().trim());
        }
        if (request.getAge() != null) {
            listing.setAge(request.getAge());
        }
        if (request.getGender() != null) {
            listing.setGender(request.getGender());
        }
        if (request.getColor() != null) {
            listing.setColor(request.getColor());
        }
        if (request.getWeight() != null) {
            listing.setWeight(request.getWeight());
        }
        if (request.getDescription() != null) {
            listing.setDescription(request.getDescription());
        }
        if (request.getPriceType() != null) {
            listing.setPriceType(request.getPriceType());
        }
        if (request.getPriceValue() != null) {
            listing.setPriceValue(request.getPriceValue());
        }
        if (request.getHasDocs() != null) {
            listing.setHasDocs(request.getHasDocs());
        }
        if (request.getVaccinated() != null) {
            listing.setVaccinated(request.getVaccinated());
        }
        if (request.getCityId() != null) {
            City city = cityRepository.findById(request.getCityId())
                    .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "City not found"));
            listing.setCity(city);
        }
        Breed resolvedBreed = resolveBreed(request.getBreedId(), request.getBreedName());
        if (resolvedBreed != null) {
            listing.setBreed(resolvedBreed);
        }

        Listing saved = listingRepository.save(listing);
        return ListingMapper.toResponse(saved);
    }

    @Transactional
    public ListingResponse updateStatus(User owner, Long listingId, ListingStatusRequest request) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Listing not found"));
        if (!listing.getOwner().getId().equals(owner.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can update only your listings");
        }
        listing.setStatus(request.getStatus());
        Listing saved = listingRepository.save(listing);
        return ListingMapper.toResponse(saved);
    }

    private Breed resolveBreed(Long breedId, String breedName) {
        if (breedId != null) {
            return breedRepository.findById(breedId)
                    .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Breed not found"));
        }
        if (breedName == null || breedName.isBlank()) {
            return null;
        }
        String normalizedName = breedName.trim();
        return breedRepository.findByNameIgnoreCase(normalizedName)
                .orElseGet(() -> {
                    Breed breed = new Breed();
                    breed.setName(normalizedName);
                    return breedRepository.save(breed);
                });
    }
}
