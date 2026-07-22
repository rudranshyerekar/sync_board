package com.syncboard.board.service;

import com.syncboard.common.exception.BadRequestException;
import com.syncboard.common.exception.ResourceNotFoundException;
import com.syncboard.user.entity.User;
import com.syncboard.user.repository.UserRepository;
import com.syncboard.workspace.repository.WorkspaceMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import com.syncboard.board.entity.Board;
import com.syncboard.board.entity.BoardColumn;
import com.syncboard.board.repository.BoardColumnRepository;
import com.syncboard.board.repository.BoardRepository;
import com.syncboard.board.dto.ColumnRequest;
import com.syncboard.board.dto.ColumnResponse;


@Service
@RequiredArgsConstructor
public class BoardColumnService {

    private final BoardColumnRepository boardColumnRepository;
    private final BoardRepository boardRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;

    @Transactional
    public ColumnResponse createColumn(Long boardId, ColumnRequest request, String currentUserEmail) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResourceNotFoundException("Board not found"));
        User user = userRepository.findByEmail(currentUserEmail).orElseThrow();
        Long workspaceId = board.getWorkspace().getId();

        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, user.getId())) {
            throw new BadRequestException("Not a member of this workspace");
        }

        BoardColumn column = BoardColumn.builder()
                .board(board)
                .title(request.getTitle())
                .color(request.getColor())
                .description(request.getDescription())
                .position(request.getPosition() != null ? request.getPosition() : computeNextPosition(boardId))
                .build();

        return mapToResponse(boardColumnRepository.save(column));
    }

    public List<ColumnResponse> getColumns(Long boardId, String currentUserEmail) {
        Board board = boardRepository.findById(boardId).orElseThrow(() -> new ResourceNotFoundException("Board not found"));
        User user = userRepository.findByEmail(currentUserEmail).orElseThrow();
        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(board.getWorkspace().getId(), user.getId())) {
            throw new BadRequestException("Not a member of this workspace");
        }

        return boardColumnRepository.findByBoardIdOrderByPositionAsc(boardId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ColumnResponse updateColumn(Long columnId, ColumnRequest request, String currentUserEmail) {
        BoardColumn column = boardColumnRepository.findById(columnId)
                .orElseThrow(() -> new ResourceNotFoundException("Column not found"));
        Board board = column.getBoard();
        User user = userRepository.findByEmail(currentUserEmail).orElseThrow();
        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(board.getWorkspace().getId(), user.getId())) {
            throw new BadRequestException("Not a member of this workspace");
        }

        column.setTitle(request.getTitle());
        if (request.getPosition() != null) {
            column.setPosition(request.getPosition());
        }
        if (request.getColor() != null) {
            column.setColor(request.getColor());
        }
        if (request.getDescription() != null) {
            column.setDescription(request.getDescription());
        }

        return mapToResponse(boardColumnRepository.save(column));
    }

    @Transactional
    public void deleteColumn(Long columnId, String currentUserEmail) {
        BoardColumn column = boardColumnRepository.findById(columnId)
                .orElseThrow(() -> new ResourceNotFoundException("Column not found"));
        User user = userRepository.findByEmail(currentUserEmail).orElseThrow();
        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(column.getBoard().getWorkspace().getId(), user.getId())) {
            throw new BadRequestException("Not a member of this workspace");
        }

        boardColumnRepository.delete(column);
    }

    private Double computeNextPosition(Long boardId) {
        List<BoardColumn> columns = boardColumnRepository.findByBoardIdOrderByPositionAsc(boardId);
        if (columns.isEmpty()) return 1000.0;
        return columns.get(columns.size() - 1).getPosition() + 1000.0;
    }

    private ColumnResponse mapToResponse(BoardColumn column) {
        return ColumnResponse.builder()
                .id(column.getId())
                .boardId(column.getBoard().getId())
                .title(column.getTitle())
                .position(column.getPosition())
                .color(column.getColor())
                .description(column.getDescription())
                .createdAt(column.getCreatedAt())
                .updatedAt(column.getUpdatedAt())
                .build();
    }
}
