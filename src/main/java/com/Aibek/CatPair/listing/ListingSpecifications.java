package com.Aibek.CatPair.listing;

import org.springframework.data.jpa.domain.Specification;

public final class ListingSpecifications {

    private ListingSpecifications() {
    }

    public static Specification<Listing> hasCity(Long cityId) {
        return (root, query, cb) -> cityId == null ? null : cb.equal(root.get("city").get("id"), cityId);
    }

    public static Specification<Listing> hasBreed(Long breedId) {
        return (root, query, cb) -> breedId == null ? null : cb.equal(root.get("breed").get("id"), breedId);
    }

    public static Specification<Listing> hasParentBreed(Long parentBreedId) {
        return (root, query, cb) -> parentBreedId == null ? null : cb.equal(root.get("breed").get("parent").get("id"), parentBreedId);
    }

    public static Specification<Listing> hasAge(Integer age) {
        return (root, query, cb) -> age == null ? null : cb.equal(root.get("age"), age);
    }

    public static Specification<Listing> hasStatus(ListingStatus status) {
        return (root, query, cb) -> status == null ? null : cb.equal(root.get("status"), status);
    }
}
