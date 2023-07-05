from django.shortcuts import render, redirect
from django.urls import reverse
from django.http import JsonResponse
import stripe
import json 


stripe.api_key = "sk_test_51NOsCqEeRoQiuOz72WmHuKPOfAdFbeb5N7ksmmf1R0Se5G6fnF6p82arb4IbxbO1sUJTRJhtiaGnYzyU8rvvZaG200eyTh5YtX"

def index(request):
	return render(request, 'base/index.html')

def calculate_order_amount(items):
    # Replace this constant with a calculation of the order's amount
    # Calculate the order total on the server to prevent
    # people from directly manipulating the amount on the client
    return 1400

def create_payment(request):
    try:
        data = json.loads(request.body)
        print("data:", data)
        # create a paymentIntent with the order amount and currency 
        intent = stripe.PaymentIntent.create(
			# amount = calculate_order_amount(data['items']), 
			amount = 200,
			currency='gbp',
			automatic_payment_methods={
				'enabled': True,
			}
		)
        print(intent)
        return JsonResponse({
			'clientSecret': intent['client_secret']
		})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=403)

def charge(request):
	amount = 5
	if request.method == 'POST':
		print('Data:', request.POST)

	return redirect(reverse('success', args=[amount]))


def successMsg(request, args):
	amount = args
	return render(request, 'base/success.html', {'amount':amount})