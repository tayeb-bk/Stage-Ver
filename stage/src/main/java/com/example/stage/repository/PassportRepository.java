package com.example.stage.repository;

import com.example.stage.entity.Passport;
import com.example.stage.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PassportRepository extends JpaRepository<Passport, Long> {
    List<Passport> findByOwner(User owner);

}