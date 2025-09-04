package com.example.stage.repository;

import com.example.stage.entity.TravelRequest;
import com.example.stage.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TravelRequestRepository extends JpaRepository<TravelRequest, Long> {
    List<TravelRequest> findByRequester(User requester);

}
