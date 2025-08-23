package com.example.stage.service;

import com.example.stage.entity.Project;
import com.example.stage.repository.ProjectRepository;
import com.example.stage.repository.MissionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final MissionRepository missionRepository;

    public ProjectService(ProjectRepository projectRepository, MissionRepository missionRepository) {
        this.projectRepository = projectRepository;
        this.missionRepository = missionRepository;
    }

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public Project getProject(Long id) {
        return projectRepository.findById(id).orElseThrow();
    }

    public Project createProject(Project project) {
        return projectRepository.save(project);
    }

    public Project updateProject(Long id, Project project) {
        project.setId(id);
        return projectRepository.save(project);
    }

    public void deleteProject(Long id) {
        projectRepository.deleteById(id);
    }

    public Map<Long, Long> countMissionsByProject() {
        return projectRepository.findAll().stream()
                .collect(Collectors.toMap(Project::getId,
                        p -> missionRepository.countByProjectId(p.getId())));
    }
}
