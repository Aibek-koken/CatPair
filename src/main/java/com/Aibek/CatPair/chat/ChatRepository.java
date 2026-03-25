package com.Aibek.CatPair.chat;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ChatRepository extends JpaRepository<Chat, Long> {
    Optional<Chat> findByListingIdAndInitiatorId(Long listingId, Long initiatorId);
    List<Chat> findByInitiatorIdOrOwnerIdOrderByCreatedAtDesc(Long initiatorId, Long ownerId);

    @Query("SELECT c FROM Chat c WHERE "
         + "(c.initiator.id = :u1 AND c.owner.id = :u2) OR "
         + "(c.initiator.id = :u2 AND c.owner.id = :u1) "
         + "ORDER BY c.createdAt ASC")
    List<Chat> findByParticipants(@Param("u1") Long u1, @Param("u2") Long u2);
}
