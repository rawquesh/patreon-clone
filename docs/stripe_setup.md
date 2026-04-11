# Stripe Webhook Secrets Guide

I have found the usages of `STRIPE_WEBHOOK_SECRET` and `STRIPE_WEBHOOK_CONNECT_SECRET` in your backend:

1. They are defined in the `app-backend/.env` file.
2. They are used in `app-backend/src/webhooks/stripe-webhooks.controller.ts` and `app-backend/src/server-status/server-status.service.ts`.
3. Specifically, in `stripe-webhooks.controller.ts`, the backend determines which secret to use to verify the Stripe webhook event. If the incoming event is from a connected account, it uses `STRIPE_WEBHOOK_CONNECT_SECRET`; otherwise, it uses the standard `STRIPE_WEBHOOK_SECRET`.

To make webhooks work on your server, you need to configure these secrets from your Stripe Dashboard and update your `.env` file. 

Here is a step-by-step guide to generating them using the Stripe Dashboard for production, and how to test them locally using the Stripe CLI.

> [!WARNING]
> **Testing Locally:** Stripe servers **cannot** send webhooks to `http://localhost` because localhost is not a public internet address. If you are developing locally, configuring localhost in the Stripe Dashboard will silently fail. You MUST use the Stripe CLI to forward events to your local machine. See the "Local Development setup" section below.

## 1. Retrieve `STRIPE_WEBHOOK_SECRET` (Standard Webhooks)

This secret is used for standard events that occur directly on your main platform Stripe account, such as subscriptions and customer payments.

### Stripe Dashboard Setup
1. Go to the [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks).
2. Click **Add an endpoint**.
3. In the **Endpoint URL** field, enter your webhook URL (e.g., `https://your-domain.com/webhooks/stripe` or your testing tunnel URL).
4. Click on **Select events** and add **exactly** the following events which are handled by your backend:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `checkout.session.completed` *(Note: The backend currently logs this but the handling logic is commented out in code)*
5. Click **Add endpoint**.
6. On the endpoint details page, locate the **Signing secret** section and click **Reveal**.
7. Copy the secret (begins with `whsec_`) and set it as `STRIPE_WEBHOOK_SECRET` in your server's `.env` file.

---

## 2. Retrieve `STRIPE_WEBHOOK_CONNECT_SECRET` (Connect Webhooks)

This secret is used for events occurring on your creators' connected Stripe accounts. Connect webhooks require a separate endpoint configuration.

### Stripe Dashboard Setup
1. Go to the [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks).
2. Click **Add an endpoint**.
3. **IMPORTANT:** Scroll down to the bottom and ensure you select **Listen to events on Connected accounts** instead of standard account events.
4. Set the **Endpoint URL** to your webhook URL (e.g., `https://your-domain.com/webhooks/stripe` or your testing tunnel URL).
5. Click on **Select events** and add **exactly** the following event:
   - `account.updated`
6. Click **Add endpoint**.
7. On the newly created Connect endpoint details page, reveal the **Signing secret**.
8. Copy the secret (begins with `whsec_`) and set it as `STRIPE_WEBHOOK_CONNECT_SECRET` in your server's `.env` file.

## Expected .env Configuration

Once you've retrieved both secrets from their respective endpoints, your `app-backend/.env` should look like this:

```env
STRIPE_WEBHOOK_SECRET="whsec_your_standard_secret_here"
STRIPE_WEBHOOK_CONNECT_SECRET="whsec_your_connect_secret_here"
```

After updating these values, restart your backend server to load the new environment variables. Your application will then successfully verify and process all incoming webhook events from Stripe.

---

## 3. Local Development Setup (IMPORTANT)

If you are running the backend on your computer (`http://localhost:8080`), webhooks from the Stripe Dashboard will **never** reach your app because Stripe cannot access your local network.

To fix this, you must use the Stripe CLI to forward events from Stripe directly to your local server.

1. **Install Stripe CLI**
   See the official guide here: https://docs.stripe.com/stripe-cli

2. **Login to Stripe CLI**
   ```bash
   stripe login
   ```

3. **Start forwarding Webhooks**
   Run the following command to forward all events and Connect events:
   ```bash
   stripe listen --forward-to localhost:8080/webhooks/stripe --forward-connect-to localhost:8080/webhooks/stripe
   ```
4. **Update your Local `.env`**
   When you run the `stripe listen` command, the terminal will output a webhook secret that looks like this:
   `Ready! Your webhook signing secret is whsec_... (^C to quit)`

   Copy that `whsec_` key and use it for **BOTH** `STRIPE_WEBHOOK_SECRET` and `STRIPE_WEBHOOK_CONNECT_SECRET` in your local `app-backend/.env` file. Do not use the secrets from the Stripe Dashboard when testing locally!

5. Restart your backend server and the `account.updated` webhook will successfully hit your localhost!
