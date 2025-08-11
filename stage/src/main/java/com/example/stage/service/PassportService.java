package com.example.stage.service;

import com.example.stage.entity.Passport;
import com.example.stage.repository.PassportRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PassportService {
    private final PassportRepository passportRepository;
    public PassportService(PassportRepository passportRepository) {
        this.passportRepository = passportRepository;
    }


    public List<Passport> getAll() {
        return passportRepository.findAll();
    }

    public Optional<Passport> getById(Long id) {
        return passportRepository.findById(id);
    }

    public Passport create(Passport passport) {
        return passportRepository.save(passport);
    }

    public Passport update(Long id, Passport passport) {
        passport.setId(id);
        return passportRepository.save(passport);
    }

    public void delete(Long id) {
        passportRepository.deleteById(id);
    }

}
