// Test publishable API key 
console.log("Hello world!")
const stripe = Stripe("pk_test_51NOsCqEeRoQiuOz7aANTSxKQbAHrypQ0v8f2G4lO2x372iOfDim2LscJmItPF9kjJpCpxPpNo9zcpUZ4WMCRPuwI00FIG98imP");
// pk_test_51NOsCqEeRoQiuOz7aANTSxKQbAHrypQ0v8f2G4lO2x372iOfDim2LscJmItPF9kjJpCpxPpNo9zcpUZ4WMCRPuwI00FIG98imP
// sk_test_51NOsCqEeRoQiuOz72WmHuKPOfAdFbeb5N7ksmmf1R0Se5G6fnF6p82arb4IbxbO1sUJTRJhtiaGnYzyU8rvvZaG200eyTh5YtX

// The items the customer wants to buy 
const items = [{id: "xl-tshirt"}];

let elements;

initialize();
checkStatus();

let emailAddress = '';

document 
    .querySelector("#payment-form")
    .addEventListener("submit", handleSubmit);

// Fetch a payment intent and capture the client secret 
async function initialize() {
    const response = await fetch("create-payment-intent/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({items})
    });

    const { clientSecret } = await response.json(); 
    console.log("clientSecret: " , clientSecret)
    const appearance = {
        theme: 'stripe',
    };

    elements = stripe.elements({appearance, clientSecret});

    const LinkAuthenticationElement = elements.create("linkAuthentication");
    LinkAuthenticationElement.mount("#link-authentication-element");

    LinkAuthenticationElement.on('change', (event) => {
        emailAddress = event.value.email;
    })

    const paymentElementOptions = {
        layout: "tabs",
    }
    const paymentElement = elements.create("payment", paymentElementOptions);
    paymentElement.mount("#payment-element")
}

async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); 

    const { error } = await stripe.confirmPayment({
        elements, 
        confirmParams: {
            // TODO: change to my payment completion page 
            return_url: "http://127.0.0.1:8000/success/",
            receipt_email: emailAddress,
        }
    })
    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === "card_error" || error.type === "validation_error") {
        showMessage(error.message);
    } else {
        showMessage("An unexpected error occurred.");
    }
    setLoading(false)
}

// Fetch the payment intent status after payment submission 
async function checkStatus() {
    const clientSecret = new URLSearchParams(window.location.search).get(
        "payment_intent_client_secret"
    );
    if (!clientSecret) {
        return;
    }

    const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
    switch (paymentIntent.status) {
        case "succeeded":
            showMessage("Donation succeeded!");
            break;
        case "processing":
            showMessage("Your donation is being processed");
            break;
        case "requires_payment_method":
            showMessage("Donation was not successful, please try again.");
            break;
        default:
            showMessage("Something went wrong.");
            break;
    }
}

// -------- UI helpers ---------- 
function showMessage(messageText) {
    const messageContainer = document.querySelector("#payment-message");

    messageContainer.classList.remove("hidden");
    messageContainer.textContent = messageText; 

    setTimeout( function() {
        messageContainer.classList.add("hidden");
        messageContainer.textContent = ""
    }, 4000)
}
// show a spinner on payment submission 
function setLoading(isLoading) {
    if (isLoading) {
        // Disable the button and show a spinner 
        document.querySelector("#submit").disabled = true;
        document.querySelector("#spinner").classList.remove("hidden");
        document.querySelector("#button-text").classList.add("hidden");
    } else {
        document.querySelector("#submit").disabled = false;
        document.querySelector("#spinner").classList.add("hidden");
        document.querySelector("#button-text").classList.remove("hidden");
    }
}