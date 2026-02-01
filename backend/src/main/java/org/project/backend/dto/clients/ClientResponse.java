package org.project.backend.dto.clients;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.project.backend.enums.Role;
import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientResponse {

    private Integer idUser;
    private String nom;
    private String email;
    private Role role;
    private Date dateCreation;
    private String phone;
    private String address;
    private Date dateNaissance;
}
