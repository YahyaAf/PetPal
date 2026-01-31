package org.project.backend.dto.users;

import org.project.backend.enums.Role;
import java.util.Date;

public class UserResponse {

    private Integer idUser;
    private String nom;
    private String email;
    private Role role;
    private Date dateCreation;

    public UserResponse() {
    }

    public UserResponse(Integer idUser, String nom, String email, Role role, Date dateCreation) {
        this.idUser = idUser;
        this.nom = nom;
        this.email = email;
        this.role = role;
        this.dateCreation = dateCreation;
    }

    public Integer getIdUser() {
        return idUser;
    }

    public void setIdUser(Integer idUser) {
        this.idUser = idUser;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Date getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(Date dateCreation) {
        this.dateCreation = dateCreation;
    }

    @Override
    public String toString() {
        return "UserResponse{" +
                "idUser=" + idUser +
                ", nom='" + nom + '\'' +
                ", email='" + email + '\'' +
                ", role=" + role +
                ", dateCreation=" + dateCreation +
                '}';
    }
}