package com.example.stage.repository;

import com.example.stage.entity.Passport;
import com.example.stage.entity.VisaRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VisaRequestRepository extends JpaRepository<VisaRequest, Long> {

    // Trouver toutes les demandes de visa par numéro de passeport
    List<VisaRequest> findByPassport_Id(Long passportId);

    // Trouver toutes les demandes de visa par pays émetteur
    List<VisaRequest> findByCountryIssuingVisa(String countryIssuingVisa);

    // Exemple : rechercher par statut
    List<VisaRequest> findByStatus(String status);

    List<VisaRequest> findByPassportIn(List<Passport> passports);


     /*   @Query("SELECT DISTINCT v FROM VisaRequest v " +
                "LEFT JOIN FETCH v.passport p " +
                "LEFT JOIN FETCH p.owner")
        List<VisaRequest> findAllWithDetails();*/



}
