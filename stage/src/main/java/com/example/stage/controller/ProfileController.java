package com.example.stage.controller;

import com.example.stage.entity.User;
import com.example.stage.service.UserSynchronizer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    @Autowired
    private UserSynchronizer userSynchronizer;

    @GetMapping
    public User getProfile(@AuthenticationPrincipal Jwt jwt) {
        return userSynchronizer.synchronizeUser(jwt);
    }
} 