package com.example.stage.repository;

import com.example.stage.entity.Mission;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MissionRepository extends JpaRepository<Mission, Long> {
    long countByProjectId(Long projectId); // compteur de missions par projet
}
