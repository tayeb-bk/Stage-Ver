package com.example.stage.security;

import com.example.stage.service.UserSynchronizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.core.convert.converter.Converter;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true) // ✅ Ajouté pour @PreAuthorize
public class SecurityConfig {

    private final UserSynchronizer userSynchronizer;

    public SecurityConfig(UserSynchronizer userSynchronizer) {
        this.userSynchronizer = userSynchronizer;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(req -> req
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/public/**", // ✅ Endpoints publics
                                "/v2/api-docs",
                                "/v3/api-docs",
                                "/v3/api-docs/**",
                                "/swagger-resources",
                                "/swagger-resources/**",
                                "/configuration/ui",
                                "/configuration/security",
                                "/swagger-ui/**",
                                "/webjars/**",
                                "/swagger-ui.html"
                        ).permitAll()

                        // ✅ Configuration des permissions par rôle
                        .requestMatchers("/api/tmanager/**").hasRole("TMANAGER")
                        .requestMatchers("/api/officer/**").hasAnyRole("OFFICER", "TMANAGER")
                        .requestMatchers("/api/pmanager/**").hasAnyRole("PMANAGER", "OFFICER", "TMANAGER")
                        .requestMatchers("/api/member/**").hasAnyRole("MEMBER", "PMANAGER", "OFFICER", "TMANAGER")

                        // ✅ TEMPORAIRE : Pour débugger, permettre tout
                        .anyRequest().permitAll() // À changer plus tard vers .authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .oauth2ResourceServer(auth -> auth.jwt(jwt -> jwt.jwtAuthenticationConverter(keycloakJwtAuthenticationConverter())));

        // Important : ajouter le filtre **après** l'authentification JWT
        http.addFilterAfter(new UserSyncFilter(userSynchronizer),
                org.springframework.security.oauth2.server.resource.web.BearerTokenAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        final UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        final CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOrigins(Collections.singletonList("http://localhost:4200"));
        config.setAllowedHeaders(Arrays.asList(
                HttpHeaders.ORIGIN,
                HttpHeaders.CONTENT_TYPE,
                HttpHeaders.ACCEPT,
                HttpHeaders.AUTHORIZATION
        ));
        config.setAllowedMethods(Arrays.asList(
                "GET", "POST", "DELETE", "PUT", "PATCH"
        ));
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public Converter<Jwt, AbstractAuthenticationToken> keycloakJwtAuthenticationConverter() {
        return jwt -> {
            Collection<GrantedAuthority> authorities = Stream.concat(
                    new JwtGrantedAuthoritiesConverter().convert(jwt).stream(),
                    extractResourceRoles(jwt).stream()
            ).collect(Collectors.toSet());

            // ✅ Debug pour voir les authorities extraites
            System.out.println("JWT Authorities for user " + jwt.getSubject() + ": " +
                    authorities.stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList()));

            return new JwtAuthenticationToken(jwt, authorities);
        };
    }

    private Collection<? extends GrantedAuthority> extractResourceRoles(Jwt jwt) {
        Set<GrantedAuthority> roles = new HashSet<>();

        // ✅ 1. Extraire les rôles du realm (realm_access)
        Map<String, Object> realmAccess = jwt.getClaim("realm_access");
        if (realmAccess != null && realmAccess.get("roles") instanceof List<?> realmRoles) {
            for (Object role : realmRoles) {
                String roleStr = role.toString();
                // ✅ Ajouter le préfixe ROLE_
                if (!roleStr.startsWith("ROLE_")) {
                    roleStr = "ROLE_" + roleStr;
                }
                roles.add(new SimpleGrantedAuthority(roleStr));
                System.out.println("Added realm role: " + roleStr);
            }
        }

        // ✅ 2. Extraire les rôles des clients (resource_access)
        Map<String, Object> resourceAccess = jwt.getClaim("resource_access");
        if (resourceAccess != null) {
            for (Object clientAccess : resourceAccess.values()) {
                if (clientAccess instanceof Map<?, ?> clientMap) {
                    Object rolesObj = clientMap.get("roles");
                    if (rolesObj instanceof List<?> roleList) {
                        for (Object role : roleList) {
                            String roleStr = role.toString();
                            if (!roleStr.startsWith("ROLE_")) {
                                roleStr = "ROLE_" + roleStr;
                            }
                            roles.add(new SimpleGrantedAuthority(roleStr));
                            System.out.println("Added client role: " + roleStr);
                        }
                    }
                }
            }
        }

        // ✅ Si aucun rôle trouvé, assigner MEMBER par défaut
        if (roles.isEmpty()) {
            roles.add(new SimpleGrantedAuthority("ROLE_MEMBER"));
            System.out.println("No roles found, defaulting to ROLE_MEMBER");
        }

        return roles;
    }
}