/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/
const express = require("express");
const bodyParser = require("body-parser");
const Stripe = require("stripe");
const twilio = require("twilio");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY || "");
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID || "", process.env.TWILIO_AUTH_TOKEN || "");

const app = express();
app.use(bodyParser.raw({ type: "application/json" }));

app.post("/webhook", (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    // Send SMS via Twilio
    if (!process.env.TWILIO_FROM_NUMBER || !process.env.TWILIO_ALERT_TO) {
      console.warn("Twilio numbers not configured; skipping SMS notification.");
    } else {
      twilioClient.messages
      .create({
        body: "A new payment was received on Elevate for Humanity!",
        from: process.env.TWILIO_FROM_NUMBER, // Your Twilio number
        to: process.env.TWILIO_ALERT_TO,   // Your personal phone number
      })
      .then(message => console.log("SMS sent:", message.sid))
      .catch(err => console.error("Twilio error:", err));
    }
  }

  res.json({ received: true });
});

app.listen(4242, () => console.log("Webhook server running on port 4242"));