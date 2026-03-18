package com.Aibek.CatPair.chat;

import com.Aibek.CatPair.chat.dto.ChatResponse;
import com.Aibek.CatPair.chat.dto.MessageResponse;
import com.Aibek.CatPair.common.ApiException;
import com.Aibek.CatPair.listing.Listing;
import com.Aibek.CatPair.listing.ListingRepository;
import com.Aibek.CatPair.user.User;
import java.util.ArrayList;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ChatService {

    private final ChatRepository chatRepository;
    private final MessageRepository messageRepository;
    private final ListingRepository listingRepository;

    public ChatService(ChatRepository chatRepository,
                       MessageRepository messageRepository,
                       ListingRepository listingRepository) {
        this.chatRepository = chatRepository;
        this.messageRepository = messageRepository;
        this.listingRepository = listingRepository;
    }

    @Transactional
    public ChatResponse createChat(User currentUser, Long listingId) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Listing not found"));
        if (listing.getOwner().getId().equals(currentUser.getId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot start chat with yourself");
        }

        return chatRepository.findByListingIdAndInitiatorId(listingId, currentUser.getId())
                .map(ChatMapper::toResponse)
                .orElseGet(() -> {
                    Chat chat = new Chat();
                    chat.setListing(listing);
                    chat.setInitiator(currentUser);
                    chat.setOwner(listing.getOwner());
                    Chat saved = chatRepository.save(chat);
                    return ChatMapper.toResponse(saved);
                });
    }

    @Transactional(readOnly = true)
    public List<ChatResponse> getChats(User currentUser) {
        List<Chat> chats = chatRepository.findByInitiatorIdOrOwnerIdOrderByCreatedAtDesc(
                currentUser.getId(), currentUser.getId()
        );
        List<ChatResponse> response = new ArrayList<>();
        for (Chat chat : chats) {
            response.add(ChatMapper.toResponse(chat));
        }
        return response;
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> getMessages(User currentUser, Long chatId) {
        Chat chat = getChatForUser(currentUser, chatId);
        List<Message> messages = messageRepository.findByChatIdOrderByCreatedAtAsc(chat.getId());
        List<MessageResponse> response = new ArrayList<>();
        for (Message message : messages) {
            response.add(MessageMapper.toResponse(message));
        }
        return response;
    }

    @Transactional
    public MessageResponse sendMessage(User currentUser, Long chatId, String text) {
        Chat chat = getChatForUser(currentUser, chatId);
        Message message = new Message();
        message.setChat(chat);
        message.setSender(currentUser);
        message.setText(text.trim());
        Message saved = messageRepository.save(message);
        return MessageMapper.toResponse(saved);
    }

    private Chat getChatForUser(User currentUser, Long chatId) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Chat not found"));
        boolean isParticipant = chat.getInitiator().getId().equals(currentUser.getId())
                || chat.getOwner().getId().equals(currentUser.getId());
        if (!isParticipant) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return chat;
    }
}
