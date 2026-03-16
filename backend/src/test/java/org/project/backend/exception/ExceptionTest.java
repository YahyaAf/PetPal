package org.project.backend.exception;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Tests unitaires pour les Exceptions")
class ExceptionTest {

    @Test
    @DisplayName("Should create DuplicateResourceException with correct message")
    void testDuplicateResourceException() {
        // Arrange & Act
        DuplicateResourceException exception = new DuplicateResourceException(
                "Product",
                "email",
                "test@example.com"
        );

        // Assert
        assertNotNull(exception);
        assertTrue(exception.getMessage().contains("Product"));
        assertTrue(exception.getMessage().contains("email"));
        assertTrue(exception.getMessage().contains("test@example.com"));
    }

    @Test
    @DisplayName("Should create ResourceNotFoundException with correct message")
    void testResourceNotFoundException() {
        // Arrange & Act
        ResourceNotFoundException exception = new ResourceNotFoundException(
                "User",
                "id",
                123
        );

        // Assert
        assertNotNull(exception);
        assertTrue(exception.getMessage().contains("User"));
        assertTrue(exception.getMessage().contains("id"));
        assertTrue(exception.getMessage().contains("123"));
    }

    @Test
    @DisplayName("Should throw DuplicateResourceException when catching exception")
    void testThrowDuplicateResourceException() {
        // Act & Assert
        assertThrows(DuplicateResourceException.class, () -> {
            throw new DuplicateResourceException("Category", "nom", "Croquettes");
        });
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when catching exception")
    void testThrowResourceNotFoundException() {
        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            throw new ResourceNotFoundException("Product", "id", 1);
        });
    }

    @Test
    @DisplayName("DuplicateResourceException should be instance of RuntimeException")
    void testDuplicateResourceExceptionIsRuntime() {
        // Arrange
        DuplicateResourceException exception = new DuplicateResourceException(
                "User",
                "email",
                "user@test.com"
        );

        // Assert
        assertInstanceOf(RuntimeException.class, exception);
    }

    @Test
    @DisplayName("ResourceNotFoundException should be instance of RuntimeException")
    void testResourceNotFoundExceptionIsRuntime() {
        // Arrange
        ResourceNotFoundException exception = new ResourceNotFoundException(
                "Order",
                "id",
                999
        );

        // Assert
        assertInstanceOf(RuntimeException.class, exception);
    }
}

