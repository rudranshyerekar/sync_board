package com.syncboard.board.service;

import com.syncboard.common.exception.BadRequestException;
import com.syncboard.common.exception.ResourceNotFoundException;
import com.syncboard.user.entity.User;
import com.syncboard.user.repository.UserRepository;
import com.syncboard.workspace.entity.Workspace;
import com.syncboard.workspace.repository.WorkspaceMemberRepository;
import com.syncboard.workspace.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import com.syncboard.board.entity.Board;
import com.syncboard.board.repository.BoardRepository;
import com.syncboard.board.dto.BoardRequest;
import com.syncboard.board.dto.BoardResponse;


@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository boardRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;

    @Transactional
    public BoardResponse createBoard(Long workspaceId, BoardRequest request, String currentUserEmail) {
        User user = userRepository.findByEmail(currentUserEmail).orElseThrow();
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));

        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, user.getId())) {
            throw new BadRequestException("Not a member of this workspace");
        }

        Board board = Board.builder()
                .workspace(workspace)
                .title(request.getTitle())
                .position(request.getPosition() != null ? request.getPosition() : computeNextPosition(workspaceId))
                .build();

        return mapToResponse(boardRepository.save(board));
    }

    public List<BoardResponse> getBoards(Long workspaceId, String currentUserEmail) {
        User user = userRepository.findByEmail(currentUserEmail).orElseThrow();
        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, user.getId())) {
            throw new BadRequestException("Not a member of this workspace");
        }

        return boardRepository.findByWorkspaceIdOrderByPositionAsc(workspaceId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public BoardResponse updateBoard(Long boardId, BoardRequest request, String currentUserEmail) {
        Board board = boardRepository.findById(boardId)
            .orElseThrow(() -> new ResourceNotFoundException("Board not found"));
            
        User user = userRepository.findByEmail(currentUserEmail).orElseThrow();
        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(board.getWorkspace().getId(), user.getId())) {
            throw new BadRequestException("Not a member of this workspace");
        }
        
        board.setTitle(request.getTitle());
        if (request.getPosition() != null) {
            board.setPosition(request.getPosition());
        }
        
        return mapToResponse(boardRepository.save(board));
    }

    @Transactional
    public void deleteBoard(Long boardId, String currentUserEmail) {
        Board board = boardRepository.findById(boardId)
            .orElseThrow(() -> new ResourceNotFoundException("Board not found"));
            
        User user = userRepository.findByEmail(currentUserEmail).orElseThrow();
        // Typically only Admin/Owner can delete, enforcing member for now
        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(board.getWorkspace().getId(), user.getId())) {
            throw new BadRequestException("Not a member of this workspace");
        }
        
        boardRepository.delete(board);
    }

    private Double computeNextPosition(Long workspaceId) {
        List<Board> boards = boardRepository.findByWorkspaceIdOrderByPositionAsc(workspaceId);
        if (boards.isEmpty()) return 1000.0;
        return boards.get(boards.size() - 1).getPosition() + 1000.0;
    }

    private BoardResponse mapToResponse(Board board) {
        return BoardResponse.builder()
                .id(board.getId())
                .workspaceId(board.getWorkspace().getId())
                .title(board.getTitle())
                .position(board.getPosition())
                .createdAt(board.getCreatedAt())
                .updatedAt(board.getUpdatedAt())
                .build();
    }
}
