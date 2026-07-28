package com.syncboard.board.service;

import com.syncboard.activity.service.ActivityService;
import com.syncboard.board.dto.ColumnRequest;
import com.syncboard.board.dto.ColumnResponse;
import com.syncboard.board.entity.Board;
import com.syncboard.board.entity.BoardColumn;
import com.syncboard.board.repository.BoardColumnRepository;
import com.syncboard.board.repository.BoardRepository;
import com.syncboard.user.entity.User;
import com.syncboard.user.repository.UserRepository;
import com.syncboard.workspace.entity.Workspace;
import com.syncboard.workspace.repository.WorkspaceMemberRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PositionRecalculationTest {

    @Mock
    private BoardColumnRepository boardColumnRepository;
    @Mock
    private BoardRepository boardRepository;
    @Mock
    private WorkspaceMemberRepository workspaceMemberRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ActivityService activityService;

    @InjectMocks
    private BoardColumnService boardColumnService;

    @Test
    void testComputeNextPosition_WhenNoColumnsExist() {
        User user = User.builder().id(1L).email("dev@example.com").build();
        Workspace workspace = Workspace.builder().id(5L).build();
        Board board = Board.builder().id(20L).workspace(workspace).title("Test Board").build();

        ColumnRequest req = new ColumnRequest();
        req.setTitle("First Column");
        // Position not specified in request, should default to 1000.0 when empty

        when(boardRepository.findById(20L)).thenReturn(Optional.of(board));
        when(userRepository.findByEmail("dev@example.com")).thenReturn(Optional.of(user));
        when(workspaceMemberRepository.existsByWorkspaceIdAndUserId(5L, 1L)).thenReturn(true);
        when(boardColumnRepository.findByBoardIdOrderByPositionAsc(20L)).thenReturn(Collections.emptyList());

        when(boardColumnRepository.save(any(BoardColumn.class))).thenAnswer(invocation -> {
            BoardColumn col = invocation.getArgument(0);
            col.setId(100L);
            return col;
        });

        ColumnResponse res = boardColumnService.createColumn(20L, req, "dev@example.com");

        assertEquals(1000.0, res.getPosition(), "First column must have default position 1000.0");
        verify(activityService, times(1)).logActivity(any(), any(), eq("Created column"), anyString());
    }

    @Test
    void testComputeNextPosition_WhenColumnsExist() {
        User user = User.builder().id(1L).email("dev@example.com").build();
        Workspace workspace = Workspace.builder().id(5L).build();
        Board board = Board.builder().id(20L).workspace(workspace).title("Test Board").build();

        BoardColumn col1 = BoardColumn.builder().id(101L).board(board).title("Col 1").position(1000.0).build();
        BoardColumn col2 = BoardColumn.builder().id(102L).board(board).title("Col 2").position(2500.0).build();

        ColumnRequest req = new ColumnRequest();
        req.setTitle("Third Column");

        when(boardRepository.findById(20L)).thenReturn(Optional.of(board));
        when(userRepository.findByEmail("dev@example.com")).thenReturn(Optional.of(user));
        when(workspaceMemberRepository.existsByWorkspaceIdAndUserId(5L, 1L)).thenReturn(true);
        when(boardColumnRepository.findByBoardIdOrderByPositionAsc(20L)).thenReturn(List.of(col1, col2));

        when(boardColumnRepository.save(any(BoardColumn.class))).thenAnswer(invocation -> {
            BoardColumn col = invocation.getArgument(0);
            col.setId(103L);
            return col;
        });

        ColumnResponse res = boardColumnService.createColumn(20L, req, "dev@example.com");

        assertEquals(3500.0, res.getPosition(), "Next position must be last column position + 1000.0");
    }
}
