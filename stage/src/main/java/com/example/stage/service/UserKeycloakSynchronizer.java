package com.example.stage.service;

import com.example.stage.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserKeycloakSynchronizer {
    @Value("${keycloak.auth-server-url}")
    private String keycloakUrl;
    @Value("${keycloak.realm}")
    private String realm;
    @Value("${keycloak.admin-username}")
    private String adminUsername;
    @Value("${keycloak.admin-password}")
    private String adminPassword;
    @Value("${keycloak.resource}")
    private String clientId;

    private final RestTemplate restTemplate = new RestTemplate();

    // Récupère un token d'admin Keycloak
    private String getAdminToken() {
        String url = keycloakUrl + "/realms/master/protocol/openid-connect/token";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        String body = "grant_type=password&client_id=admin-cli&username=" + adminUsername + "&password=" + adminPassword;
        HttpEntity<String> entity = new HttpEntity<>(body, headers);
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
            url, HttpMethod.POST, entity, new ParameterizedTypeReference<Map<String, Object>>() {});
        return (String) response.getBody().get("access_token");
    }

    // Crée un utilisateur dans Keycloak
    public void createUserInKeycloak(User user) {
        String url = keycloakUrl + "/admin/realms/" + realm + "/users";
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(getAdminToken());
        headers.setContentType(MediaType.APPLICATION_JSON);
        String body = "{" +
                "\"username\":\"" + user.getUsername() + "\"," +
                "\"email\":\"" + user.getEmail() + "\"," +
                "\"enabled\":true," +
                "\"realmRoles\":[\"" + user.getRole().name() + "\"]" +
                "}";
        HttpEntity<String> entity = new HttpEntity<>(body, headers);
        restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
    }

    // Supprime un utilisateur dans Keycloak par username
    public void deleteUserInKeycloak(String username) {
        String url = keycloakUrl + "/admin/realms/" + realm + "/users?username=" + username;
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(getAdminToken());
        ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
            url, HttpMethod.GET, new HttpEntity<>(headers), new ParameterizedTypeReference<List<Map<String, Object>>>() {});
        if (response.getBody() != null && !response.getBody().isEmpty()) {
            Object first = response.getBody().get(0);
            if (first instanceof Map<?, ?> map) {
                Map<String, Object> userMap = map.entrySet().stream()
                    .collect(Collectors.toMap(
                        e -> e.getKey().toString(),
                        Map.Entry::getValue
                    ));
                String userId = String.valueOf(userMap.get("id"));
                String delUrl = keycloakUrl + "/admin/realms/" + realm + "/users/" + userId;
                restTemplate.exchange(delUrl, HttpMethod.DELETE, new HttpEntity<>(headers), String.class);
            }
        }
    }
} 