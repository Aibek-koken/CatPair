package com.Aibek.CatPair.listing;

import jakarta.persistence.criteria.JoinType;
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

    public static Specification<Listing> hasBreedName(String breedName) {
        if (breedName == null || breedName.isBlank()) {
            return null;
        }
        String normalized = breedName.trim().toLowerCase();
        return (root, query, cb) -> cb.equal(cb.lower(root.get("breed").get("name")), normalized);
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

    public static Specification<Listing> matchesQuery(String queryText) {
        if (queryText == null || queryText.isBlank()) {
            return null;
        }
        String pattern = "%" + queryText.trim().toLowerCase() + "%";
        return (root, criteriaQuery, cb) -> {
            criteriaQuery.distinct(true);
            var breedJoin = root.join("breed", JoinType.LEFT);
            var cityJoin = root.join("city", JoinType.LEFT);
            return cb.or(
                    cb.like(cb.lower(root.get("name")), pattern),
                    cb.like(cb.lower(root.get("description")), pattern),
                    cb.like(cb.lower(breedJoin.get("name")), pattern),
                    cb.like(cb.lower(cityJoin.get("name")), pattern)
            );
        };
    }
}
