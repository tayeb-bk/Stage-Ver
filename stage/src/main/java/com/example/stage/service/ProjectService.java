package com.example.stage.service;

import com.example.stage.entity.Project;
import com.example.stage.entity.Role;
import com.example.stage.entity.User;
import com.example.stage.repository.ProjectRepository;
import com.example.stage.repository.MissionRepository;
import com.example.stage.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final MissionRepository missionRepository;
    private final UserRepository userRepository;

    public ProjectService(ProjectRepository projectRepository, MissionRepository missionRepository, UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.missionRepository = missionRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            return userRepository.findById(jwt.getSubject())
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        }
        throw new RuntimeException("Non authentifié");
    }

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public Project getProject(Long id) {
        return projectRepository.findById(id).orElseThrow();
    }

    public Project createProject(Project project) {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != Role.ROLE_OFFICER) {
            throw new RuntimeException("Action interdite : seul un OFFICER peut créer un projet");
        }
        return projectRepository.save(project);
    }

    public Project updateProject(Long id, Project project) {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != Role.ROLE_OFFICER) {
            throw new RuntimeException("Action interdite : seul un OFFICER peut modifier un projet");
        }
        project.setId(id);
        return projectRepository.save(project);
    }

    public void deleteProject(Long id) {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != Role.ROLE_OFFICER) {
            throw new RuntimeException("Action interdite : seul un OFFICER peut supprimer un projet");
        }
        projectRepository.deleteById(id);
    }

    public Map<Long, Long> countMissionsByProject() {
        return projectRepository.findAll().stream()
                .collect(Collectors.toMap(Project::getId,
                        p -> missionRepository.countByProjectId(p.getId())));
    }
}
