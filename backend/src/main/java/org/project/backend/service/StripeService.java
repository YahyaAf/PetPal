package org.project.backend.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.checkout.Session;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class StripeService {

    @Value("${stripe.secret.key}")
    private String secretKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = secretKey;
        log.info("Stripe API initialisée avec succès");
    }

    public String createPaymentIntent(Float montant, String currency) throws StripeException {
        PaymentIntent paymentIntent = createPaymentIntentWithDetails(montant, currency);
        log.info("PaymentIntent créé avec succès: {}", paymentIntent.getId());
        return paymentIntent.getId();
    }

    public PaymentIntent createPaymentIntentWithDetails(Float montant, String currency) throws StripeException {
        Long amountInCents = (long) (montant * 100);

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency(currency.toLowerCase())
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .build()
                )
                .build();

        return PaymentIntent.create(params);
    }

    public PaymentIntent retrievePaymentIntent(String paymentIntentId) throws StripeException {
        PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
        log.info("PaymentIntent récupéré: {} - Status: {}", paymentIntent.getId(), paymentIntent.getStatus());
        return paymentIntent;
    }

    public PaymentIntent cancelPaymentIntent(String paymentIntentId) throws StripeException {
        PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
        PaymentIntent canceledIntent = paymentIntent.cancel();

        log.info("PaymentIntent annulé: {}", canceledIntent.getId());
        return canceledIntent;
    }

    public boolean isPaymentSuccessful(String paymentIntentId) throws StripeException {
        PaymentIntent paymentIntent = retrievePaymentIntent(paymentIntentId);
        return "succeeded".equals(paymentIntent.getStatus());
    }

    public String createCheckoutSession(Float montant, String currency, Integer reservationId, Integer paymentId) throws StripeException {
        Long amountInCents = (long) (montant * 100);

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl("http://localhost:8080/api/payments/checkout/success?session_id={CHECKOUT_SESSION_ID}&payment_id=" + paymentId)
                .setCancelUrl("http://localhost:8080/api/payments/checkout/cancel?payment_id=" + paymentId)
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency(currency.toLowerCase())
                                                .setUnitAmount(amountInCents)
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName("Réservation Hotel #" + reservationId)
                                                                .setDescription("Paiement pour la réservation d'hôtel")
                                                                .build()
                                                )
                                                .build()
                                )
                                .setQuantity(1L)
                                .build()
                )
                .putMetadata("reservation_id", reservationId.toString())
                .putMetadata("payment_id", paymentId.toString())
                .build();

        Session session = Session.create(params);
        log.info("Checkout Session créée avec succès: {}", session.getId());
        log.info("URL de paiement: {}", session.getUrl());

        return session.getUrl();
    }

    public String createCheckoutSessionForTraining(Float montant, String currency, Integer trainingReservationId, Integer paymentId) throws StripeException {
        Long amountInCents = (long) (montant * 100);

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl("http://localhost:8080/api/payments/checkout/success?session_id={CHECKOUT_SESSION_ID}&payment_id=" + paymentId)
                .setCancelUrl("http://localhost:8080/api/payments/checkout/cancel?payment_id=" + paymentId)
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency(currency.toLowerCase())
                                                .setUnitAmount(amountInCents)
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName("Réservation Formation #" + trainingReservationId)
                                                                .setDescription("Paiement pour la réservation de formation")
                                                                .build()
                                                )
                                                .build()
                                )
                                .setQuantity(1L)
                                .build()
                )
                .putMetadata("training_reservation_id", trainingReservationId.toString())
                .putMetadata("payment_id", paymentId.toString())
                .build();

        Session session = Session.create(params);
        log.info("Checkout Session créée avec succès pour formation: {}", session.getId());
        log.info("URL de paiement: {}", session.getUrl());

        return session.getUrl();
    }

    public String createCheckoutSessionForOrder(Float montant, String currency, Integer orderId, Integer paymentId) throws StripeException {
        Long amountInCents = (long) (montant * 100);

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl("http://localhost:8080/api/payments/checkout/success?session_id={CHECKOUT_SESSION_ID}&payment_id=" + paymentId)
                .setCancelUrl("http://localhost:8080/api/payments/checkout/cancel?payment_id=" + paymentId)
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency(currency.toLowerCase())
                                                .setUnitAmount(amountInCents)
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName("Commande PetPal #" + orderId)
                                                                .setDescription("Paiement de votre commande")
                                                                .build()
                                                )
                                                .build()
                                )
                                .setQuantity(1L)
                                .build()
                )
                .putMetadata("order_id", orderId.toString())
                .putMetadata("payment_id", paymentId.toString())
                .build();

        Session session = Session.create(params);
        log.info("Checkout Session Order créée: {} - URL: {}", session.getId(), session.getUrl());
        return session.getUrl();
    }

    public Session retrieveCheckoutSession(String sessionId) throws StripeException {
        Session session = Session.retrieve(sessionId);
        log.info("Checkout Session récupérée: {} - Status: {}", session.getId(), session.getPaymentStatus());
        return session;
    }
}
