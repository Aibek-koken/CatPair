package com.Aibek.CatPair.chat;

import com.Aibek.CatPair.chat.dto.ChatResponse;

public final class ChatMapper {

    private ChatMapper() {
    }

    public static ChatResponse toResponse(Chat chat) {
        ChatResponse response = new ChatResponse();
        response.setId(chat.getId());
        response.setListingId(chat.getListing().getId());
        response.setListingName(chat.getListing().getName());
        response.setInitiatorId(chat.getInitiator().getId());
        response.setOwnerId(chat.getOwner().getId());
        response.setCreatedAt(chat.getCreatedAt());
        return response;
    }
}
