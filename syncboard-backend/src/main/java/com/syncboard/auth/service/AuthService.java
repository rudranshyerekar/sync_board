package com.syncboard.auth.service;

import com.syncboard.common.exception.BadRequestException;
import com.syncboard.security.JwtTokenProvider;
import com.syncboard.user.entity.PresenceStatus;
import com.syncboard.user.entity.User;
import com.syncboard.user.repository.UserRepository;
import com.syncboard.user.dto.UserResponse;
import com.syncboard.workspace.service.WorkspaceService;
import com.syncboard.workspace.dto.WorkspaceRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.syncboard.auth.dto.JwtAuthenticationResponse;
import com.syncboard.auth.dto.LoginRequest;
import com.syncboard.auth.dto.RegisterRequest;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final WorkspaceService workspaceService;

    @Transactional
    public JwtAuthenticationResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email Address already in use!");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .presenceStatus(PresenceStatus.OFFLINE)
                .build();

        User result = userRepository.save(user);

        // Auto login after registration
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String accessToken = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);

        // Create default workspace for new user
        WorkspaceRequest wsRequest = new WorkspaceRequest();
        wsRequest.setName(request.getName() + "'s Workspace");
        workspaceService.createWorkspace(wsRequest, request.getEmail());

        return JwtAuthenticationResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(mapToResponse(result))
                .build();
    }

    public JwtAuthenticationResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String accessToken = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        return JwtAuthenticationResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(mapToResponse(user))
                .build();
    }
    
    // Refresh token can be validated without db if encoded right.
    public JwtAuthenticationResponse refresh(String refreshToken) {
        if(tokenProvider.validateToken(refreshToken)) {
            String email = tokenProvider.getUsernameFromJWT(refreshToken);
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
            String accessToken = tokenProvider.generateTokenFromUsername(email);
            // Re-use refresh token or generate new one
            String newRefreshToken = tokenProvider.generateTokenFromUsername(email); // Typically issue new or keep old
            return JwtAuthenticationResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(newRefreshToken) // Let's keep it simple and just generate new one
                    .user(mapToResponse(user))
                    .build();
        } else {
            throw new BadRequestException("Invalid refresh token");
        }
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .presenceStatus(user.getPresenceStatus())
                .build();
    }
}
