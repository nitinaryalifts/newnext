import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_SANDBOXKEY);


async function getProductByName(name) {
  const products = await stripe.products.list({
    limit: 100, // Adjust the limit as needed 
  });

  // Find a product with the matching name
  const existingProduct = products.data.find(product => product.name === name);
  return existingProduct;
}

async function getInstallmentAmount(totalAmount, installments) {
  // Ensure totalAmount is in cents
  const totalAmountInCents = totalAmount * 100; // Convert dollars to cents
  const amountPerInstallment = Math.floor(totalAmountInCents / installments); // Calculate per installment
  return amountPerInstallment; // Return the amount per installment in cents
}
export async function POST(request) {
  try {
    const { amount,quantity, name, email, productName, paymentType,frequency, paymentMethodId,currency} = await request.json();
	
	// Create a customer
    const customer = await stripe.customers.create({
      name,
      email,
      metadata: { productName, quantity },
    });
	
	 // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethodId, { customer: customer.id });

    // Set the default payment method for the customer
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

	 if (paymentType === 'monthly') {
		//create a product
	   const existingProduct = await getProductByName(name);

	   let interval = parseInt(frequency);
	   let productId;
	   if (existingProduct) {
		// If the product exists, use its ID
			productId = existingProduct.id;
		} else {
		  // If the product doesn't exist, create a new one
		  const description = "1 dose for $500";
		  const product = await stripe.products.create({
			name,
			description,
		  });
		  productId = product.id;
		}
		
		const installmentMonths = parseInt(frequency);
		const amountPerInstallment = await getInstallmentAmount(amount, installmentMonths);
		//Create a price
		const unitamountpay = amountPerInstallment * 100;
		 const price = await stripe.prices.create({
		 unit_amount:unitamountpay , 
		 currency: currency,
		 recurring: { interval: 'month' }, // Billing interval
		 product: productId,
	   });

     if (installmentMonths < 1 || installmentMonths > 12) {
      throw new Error('installmentMonths must be between 1 and 12');
    }
    const schedules = [];
    
    // Create the first schedule with up to 10 phases
    const firstSchedulePhases = [];
    const firstScheduleLength = Math.min(installmentMonths, 10);
    for (let i = 0; i < firstScheduleLength; i++) {
      firstSchedulePhases.push({
        items: [{ price: price.id,  quantity: 1  }],
           iterations: 1,
      });
    }
    const firstSchedule = await stripe.subscriptionSchedules.create({
      customer: customer.id,
      start_date: 'now', // Start immediately
      phases: firstSchedulePhases,
    });
    
    schedules.push(firstSchedule);
    
    if (installmentMonths > 10) {
      const secondSchedulePhases = [];
      
      for (let i = 10; i < installmentMonths; i++) {
        secondSchedulePhases.push({
          items: [{ price: price.id,  quantity: 1  }],
           iterations: 1,
        });
      }
      const secondSchedule = await stripe.subscriptionSchedules.create({
        customer:customer.id,
        start_date: 'now', // Start immediately
        phases: secondSchedulePhases,
      });
    
      schedules.push(secondSchedule);
      return new Response(JSON.stringify({ 
        subscriptionId: secondSchedule.id ,
         clientSecret: null,
        }), {
            headers: { 'Content-Type': 'application/json' },
          });
    }
    return new Response(JSON.stringify({ 
      subscriptionId: firstSchedule.id ,
       clientSecret: null,
      }), {
          headers: { 'Content-Type': 'application/json' },
        });
	  
    }else{
		 // Create a PaymentIntent for one-time payments
	 const amountpay = amount * 100;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountpay,
        currency: currency,
        customer: customer.id,
        payment_method: paymentMethodId,
        metadata: { productName, quantity, name },
        receipt_email: email,
		automatic_payment_methods: {
			enabled: true,
			allow_redirects: 'never', // Disable redirects
		  }	
      });
	
      return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }), {
        headers: { 'Content-Type': 'application/json' },
      });
	}

  } catch (error) {
   console.error('Error creating payment intent:', error);

    // Handle specific error types from Stripe
    let errorMessage = 'An unexpected error occurred.';
    if (error.type === 'StripeCardError') {
      errorMessage = 'Your card was declined. Please check your card details or try a different card.';
    } else if (error.type === 'StripeInvalidRequestError') {
      errorMessage = error.message; // More specific error message
    } else if (error.type === 'StripeAPIError') {
      errorMessage = 'An error occurred with the Stripe API. Please try again.';
    }
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
}