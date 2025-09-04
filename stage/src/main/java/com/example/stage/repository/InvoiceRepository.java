package com.example.stage.repository;

import com.example.stage.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByTravelRequestId(Long travelRequestId);
}
