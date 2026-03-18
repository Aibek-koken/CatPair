package com.Aibek.CatPair.listing.dto;

import com.Aibek.CatPair.listing.ListingStatus;
import jakarta.validation.constraints.NotNull;

public class ListingStatusRequest {

    @NotNull
    private ListingStatus status;

    public ListingStatus getStatus() {
        return status;
    }

    public void setStatus(ListingStatus status) {
        this.status = status;
    }
}
