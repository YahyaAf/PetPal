package org.project.backend.dto.hotels;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelRequest {

    @NotBlank(message = "Le nom de l'hôtel est obligatoire")
    private String nom;

    @NotBlank(message = "L'adresse est obligatoire")
    private String adresse;

    private String description;

    @NotNull(message = "Le prix par jour est obligatoire")
    @Min(value = 0, message = "Le prix doit être positif")
    private Float prixParJour;

    @NotNull(message = "La disponibilité est obligatoire")
    private Boolean disponibilite;

    @NotNull(message = "Le nombre de places est obligatoire")
    @Min(value = 1, message = "Le nombre de places doit être au moins 1")
    private Integer countOfPlace;

    @NotNull(message = "L'ID de la ville est obligatoire")
    private Integer cityId;
}
