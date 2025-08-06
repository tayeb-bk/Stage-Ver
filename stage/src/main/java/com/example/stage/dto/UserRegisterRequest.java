package com.example.stage.dto;

import com.example.stage.entity.Role;

public class UserRegisterRequest {
    private String username;
    private String email;
    private Role role;

    // Getters et setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
} 