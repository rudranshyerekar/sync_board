package com.syncboard.card.service;

import com.syncboard.activity.service.ActivityService;
import com.syncboard.board.entity.Board;
import com.syncboard.board.entity.BoardColumn;
import com.syncboard.board.repository.BoardColumnRepository;
import com.syncboard.card.dto.CardRequest;
import com.syncboard.card.entity.Card;
import com.syncboard.card.repository.CardRepository;
import com.syncboard.notification.service.NotificationService;
import com.syncboard.user.entity.User;
import com.syncboard.user.repository.UserRepository;
import com.syncboard.workspace.entity.Workspace;
import com.syncboard.workspace.repository.WorkspaceMemberRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.orm.ObjectOptimisticLockingFailureException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OptimisticLockingTest {

    @Mock
    private CardRepository cardRepository;
    @Mock
    private BoardColumnRepository boardColumnRepository;
    @Mock
    private WorkspaceMemberRepository workspaceMemberRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ActivityService activityService;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private CardService cardService;

    private Card sampleCard;
    private User testUser;
    private Workspace testWorkspace;
    private Board testBoard;
    private BoardColumn testColumn;

    @BeforeEach
    void setUp() {
        testUser = User.builder().id(1L).email("user@example.com").name("Test User").build();
        testWorkspace = Workspace.builder().id(10L).name("Test WS").build();
        testBoard = Board.builder().id(100L).workspace(testWorkspace).build();
        testColumn = BoardColumn.builder().id(1000L).board(testBoard).title("TODO").build();

        sampleCard = Card.builder()
                .id(500L)
                .title("Original Title")
                .column(testColumn)
                .version(2L) // Current version in DB is 2
                .build();
    }

    @Test
    void testOptimisticLockingFailure_WhenVersionMismatch() {
        CardRequest updateRequest = new CardRequest();
        updateRequest.setTitle("New Title");
        updateRequest.setVersion(1L); // Stale version from client!

        when(cardRepository.findById(500L)).thenReturn(Optional.of(sampleCard));
        when(cardRepository.findWorkspaceIdByCardId(500L)).thenReturn(Optional.of(10L));
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(testUser));
        when(workspaceMemberRepository.existsByWorkspaceIdAndUserId(10L, 1L)).thenReturn(true);

        // Expect exception thrown due to version conflict
        assertThrows(ObjectOptimisticLockingFailureException.class, () -> {
            cardService.updateCard(500L, updateRequest, "user@example.com");
        });

        // Ensure save is never invoked on version conflict
        verify(cardRepository, never()).save(any(Card.class));
    }

    @Test
    void testUpdateSuccess_WhenVersionMatches() {
        CardRequest updateRequest = new CardRequest();
        updateRequest.setTitle("Updated Title");
        updateRequest.setVersion(2L); // Matching current version

        when(cardRepository.findById(500L)).thenReturn(Optional.of(sampleCard));
        when(cardRepository.findWorkspaceIdByCardId(500L)).thenReturn(Optional.of(10L));
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(testUser));
        when(workspaceMemberRepository.existsByWorkspaceIdAndUserId(10L, 1L)).thenReturn(true);
        when(cardRepository.save(any(Card.class))).thenReturn(sampleCard);

        cardService.updateCard(500L, updateRequest, "user@example.com");

        // Verify save and activity logging were called
        verify(cardRepository, times(1)).save(sampleCard);
        verify(activityService, times(1)).logActivity(eq(testWorkspace), eq(testUser), eq("Updated card"), anyString());
    }
}
