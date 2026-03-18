package com.Aibek.CatPair.chat;

import com.Aibek.CatPair.chat.dto.MessageResponse;

public final class MessageMapper {

    private MessageMapper() {
    }

    public static MessageResponse toResponse(Message message) {
        MessageResponse response = new MessageResponse();
        response.setId(message.getId());
        response.setChatId(message.getChat().getId());
        response.setSenderId(message.getSender().getId());
        response.setSenderName(message.getSender().getName());
        response.setText(message.getText());
        response.setCreatedAt(message.getCreatedAt());
        return response;
    }
}
