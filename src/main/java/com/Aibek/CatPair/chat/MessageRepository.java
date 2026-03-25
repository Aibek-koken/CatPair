package com.Aibek.CatPair.chat;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByChatIdOrderByCreatedAtAsc(Long chatId);

    Optional<Message> findTopByChatIdOrderByCreatedAtDesc(Long chatId);
}
