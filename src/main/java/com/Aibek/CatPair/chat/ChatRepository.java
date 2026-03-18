package com.Aibek.CatPair.chat;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatRepository extends JpaRepository<Chat, Long> {
    Optional<Chat> findByListingIdAndInitiatorId(Long listingId, Long initiatorId);
    List<Chat> findByInitiatorIdOrOwnerIdOrderByCreatedAtDesc(Long initiatorId, Long ownerId);
}
