package org.project.backend.service;

import lombok.RequiredArgsConstructor;
import org.project.backend.dto.vetappointments.VetAppointmentRequest;
import org.project.backend.dto.vetappointments.VetAppointmentResponse;
import org.project.backend.enums.VetAppointmentStatus;
import org.project.backend.exception.DuplicateResourceException;
import org.project.backend.exception.InvalidRequestException;
import org.project.backend.exception.ResourceNotFoundException;
import org.project.backend.mapper.VetAppointmentMapper;
import org.project.backend.model.User;
import org.project.backend.model.VetAppointment;
import org.project.backend.repository.UserRepository;
import org.project.backend.repository.VetAppointmentRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VetAppointmentService {

    private final VetAppointmentRepository vetAppointmentRepository;
    private final VetAppointmentMapper vetAppointmentMapper;
    private final UserRepository userRepository;

    /**
     * Crée un rendez-vous vétérinaire.
     * Validations :
     *  - dateHeure ne peut pas être dans le passé
     *  - minutes doivent être à 0 (heure pleine uniquement)
     *  - samedi et dimanche sont interdits
     *  - un seul rendez-vous par créneau d'1h (si créneau déjà pris => erreur)
     */
    @Transactional
    public VetAppointmentResponse create(VetAppointmentRequest request, Authentication authentication) {
        String userEmail = authentication.getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        LocalDateTime dateHeure = parseAndValidateDateHeure(request.getDateHeure());

        // Durée fixe : 1 heure
        LocalDateTime dateHeureFin = dateHeure.plusHours(1);

        // Vérifier chevauchement de créneaux
        long overlapping = vetAppointmentRepository.countOverlapping(dateHeure, dateHeureFin);
        if (overlapping > 0) {
            throw new DuplicateResourceException(
                    "Ce créneau est déjà réservé le "
                    + dateHeure.toLocalDate() + " à " + dateHeure.getHour() + "h00. "
                    + "Veuillez choisir un autre horaire."
            );
        }

        VetAppointment appointment = VetAppointment.builder()
                .user(user)
                .service(request.getService())
                .dateHeure(dateHeure)
                .dateHeureFin(dateHeureFin)
                .status(VetAppointmentStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        VetAppointment saved = vetAppointmentRepository.save(appointment);
        return vetAppointmentMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<VetAppointmentResponse> getAll() {
        return vetAppointmentRepository.findAll()
                .stream()
                .map(vetAppointmentMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VetAppointmentResponse getById(Integer id) {
        VetAppointment appointment = vetAppointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("VetAppointment", "id", id));
        return vetAppointmentMapper.toResponse(appointment);
    }

    @Transactional(readOnly = true)
    public List<VetAppointmentResponse> getMyAppointments(Authentication authentication) {
        String userEmail = authentication.getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));
        return vetAppointmentRepository.findByUser(user)
                .stream()
                .map(vetAppointmentMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public VetAppointmentResponse updateStatus(Integer id, VetAppointmentStatus newStatus) {
        VetAppointment appointment = vetAppointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("VetAppointment", "id", id));
        appointment.setStatus(newStatus);
        VetAppointment saved = vetAppointmentRepository.save(appointment);
        return vetAppointmentMapper.toResponse(saved);
    }

    @Transactional
    public void delete(Integer id) {
        if (!vetAppointmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("VetAppointment", "id", id);
        }
        vetAppointmentRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public long count() {
        return vetAppointmentRepository.count();
    }

    // -------------------------------------------------------------------------
    // Méthodes de validation privées
    // -------------------------------------------------------------------------

    private LocalDateTime parseAndValidateDateHeure(String dateHeureStr) {
        LocalDateTime dateHeure;
        try {
            dateHeure = LocalDateTime.parse(dateHeureStr, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        } catch (DateTimeParseException e) {
            throw new InvalidRequestException(
                    "Format de date invalide. Utilisez le format ISO : 2026-03-10T09:00:00"
            );
        }

        // 1. Pas dans le passé
        if (dateHeure.isBefore(LocalDateTime.now())) {
            throw new InvalidRequestException("La date du rendez-vous ne peut pas être dans le passé.");
        }

        // 2. Minutes doivent être à 0 (pas de 14h30 par exemple)
        if (dateHeure.getMinute() != 0 || dateHeure.getSecond() != 0) {
            throw new InvalidRequestException(
                    "Seules les heures pleines sont acceptées (ex: 09:00, 10:00). "
                    + "Vous ne pouvez pas choisir les minutes."
            );
        }

        // 3. Pas de week-end
        DayOfWeek day = dateHeure.getDayOfWeek();
        if (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) {
            throw new InvalidRequestException(
                    "Les rendez-vous ne sont pas disponibles le week-end (samedi et dimanche)."
            );
        }

        return dateHeure;
    }
}

