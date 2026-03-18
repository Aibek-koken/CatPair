package com.Aibek.CatPair.chat.dto;

import jakarta.validation.constraints.NotNull;

public class CreateChatRequest {

    @NotNull
    private Long listingId;

    public Long getListingId() {
        return listingId;
    }

    public void setListingId(Long listingId) {
        this.listingId = listingId;
    }
}
