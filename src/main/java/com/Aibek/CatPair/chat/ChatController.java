package com.Aibek.CatPair.chat;

import com.Aibek.CatPair.chat.dto.ChatResponse;
import com.Aibek.CatPair.chat.dto.CreateChatRequest;
import com.Aibek.CatPair.chat.dto.MessageResponse;
import com.Aibek.CatPair.chat.dto.SendMessageRequest;
import com.Aibek.CatPair.user.User;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chats")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ChatResponse createChat(@AuthenticationPrincipal User currentUser,
                                   @Valid @RequestBody CreateChatRequest request) {
        return chatService.createChat(currentUser, request.getListingId());
    }

    @GetMapping
    public List<ChatResponse> getChats(@AuthenticationPrincipal User currentUser) {
        return chatService.getChats(currentUser);
    }

    @GetMapping("/{chatId}/messages")
    public List<MessageResponse> getMessages(@AuthenticationPrincipal User currentUser,
                                             @PathVariable Long chatId) {
        return chatService.getMessages(currentUser, chatId);
    }

    @PostMapping("/{chatId}/messages")
    public MessageResponse sendMessage(@AuthenticationPrincipal User currentUser,
                                       @PathVariable Long chatId,
                                       @Valid @RequestBody SendMessageRequest request) {
        return chatService.sendMessage(currentUser, chatId, request.getText());
    }
}
