package org.project.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.Date;

@Entity
@Table(name = "clients")
@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Client extends User {

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String address;

    @Temporal(TemporalType.DATE)
    @Column(nullable = false)
    private Date dateNaissance;
}
