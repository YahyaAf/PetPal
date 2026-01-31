package org.project.backend;

import io.github.cdimascio.dotenv.Dotenv;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class TestConnection {

    public static void main(String[] args) {
        System.out.println("\n========================================");
        System.out.println("🔍 TEST DE CONNEXION À LA BASE DE DONNÉES");
        System.out.println("========================================\n");

        // Charger les variables du fichier .env
        Dotenv dotenv = null;
        try {
            dotenv = Dotenv.configure()
                    .ignoreIfMissing()
                    .load();
            System.out.println("✅ Fichier .env chargé avec succès !");
        } catch (Exception e) {
            System.err.println("⚠️  Impossible de charger le fichier .env: " + e.getMessage());
            System.err.println("⚠️  Utilisation des valeurs par défaut...\n");
        }

        // Récupérer les variables d'environnement
        String dbHost = dotenv != null ? dotenv.get("DB_HOST", "localhost") : "localhost";
        String dbPort = dotenv != null ? dotenv.get("DB_PORT", "5432") : "5432";
        String dbName = dotenv != null ? dotenv.get("DB_NAME", "petpal") : "petpal";
        String dbUser = dotenv != null ? dotenv.get("DB_USER", "petpal_user") : "petpal_user";
        String dbPassword = dotenv != null ? dotenv.get("DB_PASSWORD", "petpal_password") : "petpal_password";

        String jdbcUrl = "jdbc:postgresql://" + dbHost + ":" + dbPort + "/" + dbName;

        System.out.println("📋 Configuration de connexion :");
        System.out.println("   URL: " + jdbcUrl);
        System.out.println("   User: " + dbUser);
        System.out.println("   Password: " + "*".repeat(dbPassword.length()));
        System.out.println();

        // Tester la connexion
        Connection connection = null;
        try {
            System.out.println("🔄 Tentative de connexion...");
            connection = DriverManager.getConnection(jdbcUrl, dbUser, dbPassword);

            System.out.println("\n✅ CONNEXION RÉUSSIE !");
            System.out.println("========================================");
            System.out.println("📊 Informations de la base de données :");
            System.out.println("   URL: " + connection.getMetaData().getURL());
            System.out.println("   User: " + connection.getMetaData().getUserName());
            System.out.println("   Database: " + connection.getMetaData().getDatabaseProductName());
            System.out.println("   Version: " + connection.getMetaData().getDatabaseProductVersion());
            System.out.println("   Driver: " + connection.getMetaData().getDriverName());
            System.out.println("   Driver Version: " + connection.getMetaData().getDriverVersion());

            // Tester une requête
            System.out.println("\n🔄 Test d'une requête SQL...");
            try (Statement statement = connection.createStatement()) {
                ResultSet resultSet = statement.executeQuery("SELECT version(), current_database(), current_user");
                if (resultSet.next()) {
                    System.out.println("✅ Requête exécutée avec succès !");
                    System.out.println("   PostgreSQL Version: " + resultSet.getString(1).split(" ")[0] + " " + resultSet.getString(1).split(" ")[1]);
                    System.out.println("   Database actuelle: " + resultSet.getString(2));
                    System.out.println("   User actuel: " + resultSet.getString(3));
                }
            }

            // Compter les tables
            System.out.println("\n📊 Tables dans la base de données :");
            try (Statement statement = connection.createStatement()) {
                ResultSet resultSet = statement.executeQuery(
                    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'"
                );
                if (resultSet.next()) {
                    int tableCount = resultSet.getInt(1);
                    System.out.println("   Nombre de tables: " + tableCount);

                    if (tableCount > 0) {
                        System.out.println("\n📋 Liste des tables :");
                        try (Statement stmt = connection.createStatement()) {
                            ResultSet rs = stmt.executeQuery(
                                "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
                            );
                            while (rs.next()) {
                                System.out.println("   - " + rs.getString(1));
                            }
                        }
                    } else {
                        System.out.println("   (Aucune table pour le moment - base de données vide)");
                    }
                }
            }

            System.out.println("\n========================================");
            System.out.println("✅ TOUS LES TESTS SONT PASSÉS !");
            System.out.println("========================================\n");

        } catch (Exception e) {
            System.err.println("\n========================================");
            System.err.println("❌ ERREUR DE CONNEXION !");
            System.err.println("========================================");
            System.err.println("Type d'erreur: " + e.getClass().getSimpleName());
            System.err.println("Message: " + e.getMessage());
            System.err.println("\n💡 Vérifications à faire :");
            System.err.println("   1. Docker est-il lancé ? (docker ps)");
            System.err.println("   2. Les conteneurs sont-ils actifs ? (docker-compose up -d)");
            System.err.println("   3. PostgreSQL écoute-t-il sur le port " + dbPort + " ?");
            System.err.println("   4. Les credentials sont-ils corrects ?");
            System.err.println("========================================\n");
            e.printStackTrace();
            System.exit(1);

        } finally {
            if (connection != null) {
                try {
                    connection.close();
                    System.out.println("🔌 Connexion fermée proprement.");
                } catch (Exception e) {
                    System.err.println("⚠️  Erreur lors de la fermeture: " + e.getMessage());
                }
            }
        }
    }
}

