package com.example.stage.service;

import com.example.stage.entity.Mission;
import com.example.stage.repository.MissionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MissionService {

    private final MissionRepository missionRepository;

    public MissionService(MissionRepository missionRepository) {
        this.missionRepository = missionRepository;
    }

    public List<Mission> getAllMissions() {
        return missionRepository.findAll();
    }

    public Mission getMission(Long id) {
        return missionRepository.findById(id).orElseThrow();
    }

    public Mission createMission(Mission mission) {
        return missionRepository.save(mission);
    }

    public Mission updateMission(Long id, Mission mission) {
        mission.setId(id);
        return missionRepository.save(mission);
    }

    public void deleteMission(Long id) {
        missionRepository.deleteById(id);
    }
}
