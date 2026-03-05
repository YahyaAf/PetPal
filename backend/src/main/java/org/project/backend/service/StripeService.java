package org.project.backend.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
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
}
