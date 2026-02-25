package org.project.backend.service;

import lombok.RequiredArgsConstructor;
import org.project.backend.dto.trainings.TrainingTypeRequest;
import org.project.backend.dto.trainings.TrainingTypeResponse;
import org.project.backend.exception.DuplicateResourceException;
import org.project.backend.exception.ResourceNotFoundException;
import org.project.backend.mapper.TrainingTypeMapper;
import org.project.backend.model.TrainingType;
import org.project.backend.repository.TrainingTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrainingTypeService {

    private final TrainingTypeRepository trainingTypeRepository;
    private final TrainingTypeMapper trainingTypeMapper;

    @Transactional
    public TrainingTypeResponse create(TrainingTypeRequest request) {
        if (trainingTypeRepository.existsByNom(request.getNom())) {
            throw new DuplicateResourceException("TrainingType", "nom", request.getNom());
        }

        TrainingType trainingType = trainingTypeMapper.toEntity(request);
        TrainingType savedTrainingType = trainingTypeRepository.save(trainingType);
        return trainingTypeMapper.toResponse(savedTrainingType);
    }

    @Transactional
    public TrainingTypeResponse update(Integer id, TrainingTypeRequest request) {
        TrainingType trainingType = trainingTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TrainingType", "id", id));

        if (!trainingType.getNom().equals(request.getNom()) &&
                trainingTypeRepository.existsByNom(request.getNom())) {
            throw new DuplicateResourceException("TrainingType", "nom", request.getNom());
        }

        trainingTypeMapper.updateEntityFromRequest(trainingType, request);
        TrainingType updatedTrainingType = trainingTypeRepository.save(trainingType);
        return trainingTypeMapper.toResponse(updatedTrainingType);
    }

    @Transactional(readOnly = true)
    public List<TrainingTypeResponse> getAll() {
        return trainingTypeRepository.findAll()
                .stream()
                .map(trainingTypeMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TrainingTypeResponse getById(Integer id) {
        TrainingType trainingType = trainingTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TrainingType", "id", id));
        return trainingTypeMapper.toResponse(trainingType);
    }

    @Transactional
    public void delete(Integer id) {
        if (!trainingTypeRepository.existsById(id)) {
            throw new ResourceNotFoundException("TrainingType", "id", id);
        }
        trainingTypeRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public long count() {
        return trainingTypeRepository.count();
    }
}

