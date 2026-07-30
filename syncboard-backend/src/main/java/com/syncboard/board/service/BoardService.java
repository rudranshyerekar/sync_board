package com.syncboard.board.service;

import com.syncboard.common.exception.BadRequestException;
import com.syncboard.common.exception.ResourceNotFoundException;
import com.syncboard.user.entity.User;
import com.syncboard.user.repository.UserRepository;
import com.syncboard.workspace.entity.Workspace;
import com.syncboard.workspace.repository.WorkspaceMemberRepository;
import com.syncboard.workspace.repository.WorkspaceRepository;
import com.syncboard.activity.service.ActivityService;
import com.syncboard.board.entity.BoardPrivacy;
import com.syncboard.board.entity.BoardMember;
import com.syncboard.board.repository.BoardMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import com.syncboard.board.entity.Board;
import com.syncboard.board.repository.BoardRepository;
import com.syncboard.board.dto.BoardRequest;
import com.syncboard.board.dto.BoardResponse;
import com.syncboard.board.entity.BoardColumn;
import com.syncboard.board.repository.BoardColumnRepository;
import com.syncboard.board.dto.ColumnWithCardsResponse;
import com.syncboard.board.dto.FullBoardResponse;
import com.syncboard.card.dto.CardResponse;
import com.syncboard.card.entity.Card;
import com.syncboard.card.repository.CardRepository;
import com.syncboard.user.dto.UserResponse;


@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository boardRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final BoardMemberRepository boardMemberRepository;
    private final UserRepository userRepository;
    private final BoardColumnRepository boardColumnRepository;
    private final CardRepository cardRepository;
    private final ActivityService activityService;

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
                .description(request.getDescription())
                .privacy(request.getPrivacy() != null ? request.getPrivacy() : BoardPrivacy.WORKSPACE)
                .position(request.getPosition() != null ? request.getPosition() : computeNextPosition(workspaceId))
                .build();

        Board savedBoard = boardRepository.save(board);

        if (savedBoard.getPrivacy() == BoardPrivacy.PRIVATE) {
            boardMemberRepository.save(BoardMember.builder().board(savedBoard).user(user).build());
            if (request.getInviteeIds() != null) {
                for (Long inviteeId : request.getInviteeIds()) {
                    if (!inviteeId.equals(user.getId())) {
                        userRepository.findById(inviteeId).ifPresent(invitee -> {
                            boardMemberRepository.save(BoardMember.builder().board(savedBoard).user(invitee).build());
                        });
                    }
                }
            }
        }

        List<BoardColumn> columnsToSave = new java.util.ArrayList<>();
        if (request.getInitialColumns() != null && !request.getInitialColumns().isEmpty()) {
            double pos = 1000.0;
            String[] colors = {"gray", "yellow", "blue", "green", "purple", "pink", "orange"};
            int colorIdx = 0;
            for (BoardRequest.InitialColumnRequest colReq : request.getInitialColumns()) {
                columnsToSave.add(BoardColumn.builder()
                        .board(savedBoard)
                        .title(colReq.getTitle())
                        .position(pos)
                        .color(colReq.getColor() != null && !colReq.getColor().isBlank() ? colReq.getColor() : colors[colorIdx % colors.length])
                        .build());
                pos += 1000.0;
                colorIdx++;
            }
        } else {
            // Default columns
            columnsToSave.add(BoardColumn.builder().board(savedBoard).title("To Do").position(1000.0).color("gray").build());
            columnsToSave.add(BoardColumn.builder().board(savedBoard).title("In Progress").position(2000.0).color("yellow").build());
            columnsToSave.add(BoardColumn.builder().board(savedBoard).title("Review").position(3000.0).color("blue").build());
            columnsToSave.add(BoardColumn.builder().board(savedBoard).title("Done").position(4000.0).color("green").build());
        }
        
        boardColumnRepository.saveAll(columnsToSave);

        activityService.logActivity(workspace, user, "Created board", "Created board \"" + savedBoard.getTitle() + "\"");

        return mapToResponse(savedBoard);
    }

    public List<BoardResponse> getBoards(Long workspaceId, String currentUserEmail) {
        User user = userRepository.findByEmail(currentUserEmail).orElseThrow();
        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, user.getId())) {
            throw new BadRequestException("Not a member of this workspace");
        }

        return boardRepository.findByWorkspaceIdOrderByPositionAsc(workspaceId)
                .stream()
                .filter(b -> b.getPrivacy() == BoardPrivacy.WORKSPACE || boardMemberRepository.existsByBoardIdAndUserId(b.getId(), user.getId()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public BoardResponse getBoard(Long boardId, String currentUserEmail) {
        Board board = boardRepository.findById(boardId)
            .orElseThrow(() -> new ResourceNotFoundException("Board not found"));
            
        User user = userRepository.findByEmail(currentUserEmail).orElseThrow();
        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(board.getWorkspace().getId(), user.getId())) {
            throw new BadRequestException("Not a member of this workspace");
        }
        if (board.getPrivacy() == BoardPrivacy.PRIVATE && !boardMemberRepository.existsByBoardIdAndUserId(board.getId(), user.getId())) {
            throw new BadRequestException("Not a member of this private board");
        }
        return mapToResponse(board);
    }

    public FullBoardResponse getFullBoard(Long boardId, String currentUserEmail) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResourceNotFoundException("Board not found"));

        User user = userRepository.findByEmail(currentUserEmail).orElseThrow();
        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(board.getWorkspace().getId(), user.getId())) {
            throw new BadRequestException("Not a member of this workspace");
        }
        if (board.getPrivacy() == BoardPrivacy.PRIVATE && !boardMemberRepository.existsByBoardIdAndUserId(board.getId(), user.getId())) {
            throw new BadRequestException("Not a member of this private board");
        }

        List<BoardColumn> columns = boardColumnRepository.findByBoardIdOrderByPositionAsc(boardId);
        List<ColumnWithCardsResponse> columnResponses = columns.stream().map(column -> {
            List<Card> cards = cardRepository.findByColumnIdOrderByPositionAsc(column.getId());
            List<CardResponse> cardResponses = cards.stream().map(this::mapCardToResponse).collect(Collectors.toList());

            return ColumnWithCardsResponse.builder()
                    .id(column.getId())
                    .boardId(column.getBoard().getId())
                    .title(column.getTitle())
                    .position(column.getPosition())
                    .color(column.getColor())
                    .description(column.getDescription())
                    .cards(cardResponses)
                    .createdAt(column.getCreatedAt())
                    .updatedAt(column.getUpdatedAt())
                    .build();
        }).collect(Collectors.toList());

        return FullBoardResponse.builder()
                .id(board.getId())
                .workspaceId(board.getWorkspace().getId())
                .title(board.getTitle())
                .description(board.getDescription())
                .privacy(board.getPrivacy())
                .position(board.getPosition())
                .columns(columnResponses)
                .createdAt(board.getCreatedAt())
                .updatedAt(board.getUpdatedAt())
                .build();
    }

    private CardResponse mapCardToResponse(Card card) {
        UserResponse assigneeResponse = null;
        if (card.getAssignee() != null) {
            assigneeResponse = UserResponse.builder()
                    .id(card.getAssignee().getId())
                    .name(card.getAssignee().getName())
                    .email(card.getAssignee().getEmail())
                    .avatarUrl(card.getAssignee().getAvatarUrl())
                    .presenceStatus(card.getAssignee().getPresenceStatus())
                    .build();
        }

        return CardResponse.builder()
                .id(card.getId())
                .columnId(card.getColumn().getId())
                .title(card.getTitle())
                .description(card.getDescription())
                .priority(card.getPriority())
                .assigneeId(card.getAssignee() != null ? card.getAssignee().getId() : null)
                .assignee(assigneeResponse)
                .deadline(card.getDeadline())
                .position(card.getPosition())
                .version(card.getVersion())
                .commentCount(card.getCommentCount() != null ? card.getCommentCount() : 0)
                .createdAt(card.getCreatedAt())
                .updatedAt(card.getUpdatedAt())
                .build();
    }
    
    @Transactional
    public BoardResponse updateBoard(Long boardId, BoardRequest request, String currentUserEmail) {
        Board board = boardRepository.findById(boardId)
            .orElseThrow(() -> new ResourceNotFoundException("Board not found"));
            
        User user = userRepository.findByEmail(currentUserEmail).orElseThrow();
        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(board.getWorkspace().getId(), user.getId())) {
            throw new BadRequestException("Not a member of this workspace");
        }
        if (board.getPrivacy() == BoardPrivacy.PRIVATE && !boardMemberRepository.existsByBoardIdAndUserId(board.getId(), user.getId())) {
            throw new BadRequestException("Not a member of this private board");
        }
        
        board.setTitle(request.getTitle());
        if (request.getPosition() != null) {
            board.setPosition(request.getPosition());
        }
        
        board = boardRepository.save(board);
        activityService.logActivity(board.getWorkspace(), user, "Updated board", "Updated details for board \"" + board.getTitle() + "\"");
        
        return mapToResponse(board);
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
        if (board.getPrivacy() == BoardPrivacy.PRIVATE && !boardMemberRepository.existsByBoardIdAndUserId(board.getId(), user.getId())) {
            throw new BadRequestException("Not a member of this private board");
        }
        
        activityService.logActivity(board.getWorkspace(), user, "Deleted board", "Deleted board \"" + board.getTitle() + "\"");
        boardRepository.delete(board);
    }

    public List<UserResponse> getBoardMembers(Long boardId, String currentUserEmail) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResourceNotFoundException("Board not found"));
        User user = userRepository.findByEmail(currentUserEmail).orElseThrow();
        
        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(board.getWorkspace().getId(), user.getId())) {
            throw new BadRequestException("Not a member of this workspace");
        }
        if (board.getPrivacy() == BoardPrivacy.PRIVATE && !boardMemberRepository.existsByBoardIdAndUserId(board.getId(), user.getId())) {
            throw new BadRequestException("Not a member of this private board");
        }
        
        return boardMemberRepository.findByBoardId(boardId)
                .stream()
                .map(m -> UserResponse.builder()
                        .id(m.getUser().getId())
                        .name(m.getUser().getName())
                        .email(m.getUser().getEmail())
                        .avatarUrl(m.getUser().getAvatarUrl())
                        .presenceStatus(m.getUser().getPresenceStatus())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void addBoardMember(Long boardId, Long userId, String currentUserEmail) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResourceNotFoundException("Board not found"));
        User currentUser = userRepository.findByEmail(currentUserEmail).orElseThrow();
        
        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(board.getWorkspace().getId(), currentUser.getId())) {
            throw new BadRequestException("Not a member of this workspace");
        }
        if (board.getPrivacy() == BoardPrivacy.PRIVATE && !boardMemberRepository.existsByBoardIdAndUserId(board.getId(), currentUser.getId())) {
            throw new BadRequestException("Not a member of this private board");
        }
        
        User invitee = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(board.getWorkspace().getId(), invitee.getId())) {
            throw new BadRequestException("Invitee is not a member of this workspace");
        }
        
        if (!boardMemberRepository.existsByBoardIdAndUserId(board.getId(), invitee.getId())) {
            BoardMember boardMember = BoardMember.builder()
                    .board(board)
                    .user(invitee)
                    .build();
            boardMemberRepository.save(boardMember);
            activityService.logActivity(board.getWorkspace(), currentUser, "Added board member", "Added " + invitee.getName() + " to board \"" + board.getTitle() + "\"");
        }
    }

    @Transactional
    public void removeBoardMember(Long boardId, Long userId, String currentUserEmail) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResourceNotFoundException("Board not found"));
        User currentUser = userRepository.findByEmail(currentUserEmail).orElseThrow();
        
        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(board.getWorkspace().getId(), currentUser.getId())) {
            throw new BadRequestException("Not a member of this workspace");
        }
        if (board.getPrivacy() == BoardPrivacy.PRIVATE && !boardMemberRepository.existsByBoardIdAndUserId(board.getId(), currentUser.getId())) {
            throw new BadRequestException("Not a member of this private board");
        }
        
        BoardMember member = boardMemberRepository.findByBoardIdAndUserId(board.getId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("User is not a member of this board"));
        boardMemberRepository.delete(member);
        activityService.logActivity(board.getWorkspace(), currentUser, "Removed board member", "Removed " + member.getUser().getName() + " from board \"" + board.getTitle() + "\"");
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
                .description(board.getDescription())
                .privacy(board.getPrivacy())
                .position(board.getPosition())
                .createdAt(board.getCreatedAt())
                .updatedAt(board.getUpdatedAt())
                .build();
    }
}
