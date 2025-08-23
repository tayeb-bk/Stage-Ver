package com.example.stage.controller;

import com.example.stage.entity.Mission;
import com.example.stage.service.MissionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/missions")
@CrossOrigin(origins = "*")
public class MissionController {

    private final MissionService missionService;

    public MissionController(MissionService missionService) {
        this.missionService = missionService;
    }

    @GetMapping("/all")
    public List<Mission> getAllMissions() {
        return missionService.getAllMissions();
    }

    @GetMapping("/{id}")
    public Mission getMission(@PathVariable Long id) {
        return missionService.getMission(id);
    }

    @PostMapping("/create")
    public Mission createMission(@RequestBody Mission mission) {
        return missionService.createMission(mission);
    }

    @PutMapping("/update/{id}")
    public Mission updateMission(@PathVariable Long id, @RequestBody Mission mission) {
        return missionService.updateMission(id, mission);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteMission(@PathVariable Long id) {
        missionService.deleteMission(id);
    }
}
