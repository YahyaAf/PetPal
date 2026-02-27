package org.project.backend.exception;

public class InsufficientStockException extends RuntimeException {

    public InsufficientStockException(String productName, int available, int requested) {
        super("Stock insuffisant pour le produit '" + productName + "'. " +
              "Stock disponible: " + available + ", quantité demandée: " + requested + ".");
    }
}

