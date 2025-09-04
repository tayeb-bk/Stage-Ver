package com.example.stage.security;

import com.example.stage.service.UserSynchronizer;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class UserSyncFilter extends OncePerRequestFilter {

    private final UserSynchronizer userSynchronizer;

    public UserSyncFilter(UserSynchronizer userSynchronizer) {
        this.userSynchronizer = userSynchronizer;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            System.out.println("🔍 UserSyncFilter - JWT found for user: " + jwt.getSubject());
            System.out.println("🔍 Username: " + jwt.getClaimAsString("preferred_username"));
            System.out.println("🔍 Email: " + jwt.getClaimAsString("email"));
            System.out.println("🔍 Realm Access: " + jwt.getClaim("realm_access"));
            System.out.println("🔍 Resource Access: " + jwt.getClaim("resource_access"));
            System.out.println("🔍 All Claims: " + jwt.getClaims().keySet());

            try {
                // Synchroniser l'utilisateur
                var syncedUser = userSynchronizer.synchronizeUser(jwt);
                System.out.println("✅ User synchronized: " + syncedUser.getUsername() + " with role: " + syncedUser.getRole());
            } catch (Exception e) {
                System.err.println("❌ Error synchronizing user: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.out.println("❌ UserSyncFilter - No authenticated user found");
            if (auth != null) {
                System.out.println("❌ Auth principal type: " + auth.getPrincipal().getClass().getSimpleName());
            }
        }

        filterChain.doFilter(request, response);
    }
}