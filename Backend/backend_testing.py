import requests 
import pytest
import json
from ast import literal_eval
BROWSER_URL = "http://localhost:5000"
jWT_TOKEN = "hello"
def test_add_user_new():
	endpoint = "/addUser"
	end_url = BROWSER_URL + endpoint
	user_data = {'username' : 'Bluefire88',
		 'first_name' : 'Michael',
		 'last_name' : 'Jones', 
		 'email' : 'mjj4@njit.edu',
		 'phone_number' : '2234767880',
		 'job' : 'Customer',	
		 'password' : 'hellothere2' 
		 }
	response = requests.post(end_url, json=user_data)
	assert response.status_code == 200
	text = literal_eval(response.text)  
	assert text["message"] == "User added successfully"
	
def test_add_user_email():
	#expecting rejection due to same email
	endpoint = "/addUser"
	end_url = BROWSER_URL + endpoint
	user_data = {'username' : 'Bluefire88',
		 'first_name' : 'Michael',
		 'last_name' : 'Jones', 
		 'email' : 'mjj4@njit.edu',
		 'phone_number' : '2234767880',
		 'job' : 'Custom	er',	
		 'password' : 'hellothere2' 
		 }
	response = requests.post(end_url, json=user_data)
	assert response.status_code == 200
	text = literal_eval(response.text)  
	assert text["message"] == "Email Already Exists"

def test_add_user_username():
	#expecting rejection due to same username
	endpoint = "/addUser"
	end_url = BROWSER_URL + endpoint
	user_data = {'username' : 'Bluefire88',
		 'first_name' : 'Michael',
		 'last_name' : 'Jones', 
		 'email' : 'mjj7@njit.edu',
		 'phone_number' : '2234767880',
		 'job' : 'Customer',	
		 'password' : 'hellothere2' 
		 }
	response = requests.post(end_url, json=user_data)
	assert response.status_code == 200
	text = literal_eval(response.text)  
	assert text["message"] == "Username Already Exists"
	
def test_add_user_phonenum():
	#expecting rejection due to same phonenumber
	endpoint = "/addUser"
	end_url = BROWSER_URL + endpoint
	user_data = {'username' : 'Bluefire928',
		 'first_name' : 'Michael',
		 'last_name' : 'Jones', 
		 'email' : 'mjj7@njit.edu',
		 'phone_number' : '2234767880',
		 'job' : 'Customer',	
		 'password' : 'hellothere2' 
		 }
	response = requests.post(end_url, json=user_data)
	assert response.status_code == 200
	text = literal_eval(response.text)  
	assert text["message"] == "Phone Number Already Exists"

def test_sign_in():
	endpoint = "/authenticate"
	end_url = BROWSER_URL + endpoint
	user_data = {'username' : 'Bluefire88',	
		 'password' : 'hellothere2' 
		 }
	response = requests.post(end_url, json=user_data)
	assert response.status_code == 200
	text = literal_eval(response.text)  
	assert text["message"] == "Authentication successful"

def test_log_out():
	endpoint = "/logout"
	end_url = BROWSER_URL + endpoint
	response = requests.post(end_url)
	assert response.status_code == 200 
	text = literal_eval(response.text)  
	assert text["msg"] == "logout successful"

def set_token():
	endpoint = "/authenticate"
	end_url = BROWSER_URL + endpoint
	user_data = {'username' : 'user1',	
		 'password' : '1211111111' 
		 }
	response = requests.post(end_url, json=user_data)
	x = response.json()
	global jWT_TOKEN
	token = x["access_token"]
	jWT_TOKEN = {
        'Authorization': 'Bearer {}'.format(token)
    }

set_token()

def test_inventory():
	endpoint = "/inventoryInStock"
	end_url = BROWSER_URL + endpoint
	response = requests.get(end_url)
	assert response.status_code == 200 

def test_car_details():
	endpoint = "/carDetails"
	end_url = BROWSER_URL + endpoint
	data = {	
		 'carID' : '100' 
		 }
	response = requests.post(end_url, json=data)
	assert response.status_code == 200
	x = response.json()
	assert any(x["carDetails"][0])
	data = {	
		 'carID' : '9000' 
		 }
	response = requests.post(end_url, json=data)
	assert response.status_code == 200
	x = response.json()
	assert not any(x["carDetails"])

def test_user_info():
	endpoint = "/userInfo"
	end_url = BROWSER_URL + endpoint
	user_data = {'userID' : 0 
		 }
	#print(jWT_TOKEN)
	response = requests.post(end_url, json=user_data,headers=jWT_TOKEN)
	assert response.status_code == 200
	text = literal_eval(response.text)  
	assert text["message"] == "Error retrieving customer"
	user_data = {'userID' : 1
		 }
	response = requests.post(end_url, json=user_data,headers=jWT_TOKEN)
	assert response.status_code == 200
	x = response.json()
	assert any(x["inStockInventory"])

def test_sign_in_fail_username():
	#a failed sign in due to an incorrect username
	endpoint = "/authenticate"
	end_url = BROWSER_URL + endpoint
	user_data = {'username' : 'Bluefire888',	
		 'password' : 'hellothere2' 
		 }
	response = requests.post(end_url, json=user_data)
	assert response.status_code == 200
	text = literal_eval(response.text)  
	assert text["message"] == "Incorrect username or password"
	
def test_sign_in_fail_password():
	#a failed sign in due to an incorrect password
	endpoint = "/authenticate"
	end_url = BROWSER_URL + endpoint
	user_data = {'username' : 'Bluefire88',	
		 'password' : ' ' 
		 }
	response = requests.post(end_url, json=user_data)
	assert response.status_code == 200
	text = literal_eval(response.text)  
	assert text["message"] == "Incorrect username or password"

def test_all_makes():
	endpoint = "/allmake"
	end_url = BROWSER_URL + endpoint
	response = requests.get(end_url,headers=jWT_TOKEN)
	x = response.json()
	assert any(x["makes"])

def test_make_to_model():
	endpoint = "/maketomodel"
	end_url = BROWSER_URL + endpoint
	data = {	
		 'make' : "Audi" 
		 }
	response = requests.post(end_url, json=data,headers=jWT_TOKEN)
	assert response.status_code == 200
	x = response.json()
	print(x)
	assert any(x["models"][0])
	data = {	
		 'make' : "Tesla" 
		 }
	response = requests.post(end_url, json=data,headers=jWT_TOKEN)
	assert response.status_code == 200
	x = response.json()
	assert not any(x["models"])

def test_model_to_year():
	endpoint = "/modeltoyear"
	end_url = BROWSER_URL + endpoint
	data = {	
		 'model' : "QX70" 
		 }
	response = requests.post(end_url, json=data,headers=jWT_TOKEN)
	assert response.status_code == 200
	x = response.json()
	print(x)
	assert any(x["years"][0])
	data = {	
		 'model' : "QX80" 
		 }
	response = requests.post(end_url, json=data,headers=jWT_TOKEN)
	assert response.status_code == 200
	x = response.json()
	assert not any(x["years"])

def test_add_garage():
	endpoint = "/myGarageAddCar"
	end_url = BROWSER_URL + endpoint
	user_data = {'custID' : '1',
		 'make' : 'Audi',
		 'model' : 'Q5', 
		 'year' : '2021',
		 'vin' : '5TFCW5F1XBX026351',
		}
	response = requests.post(end_url, json=user_data,headers=jWT_TOKEN)
	assert response.status_code == 200
	text = literal_eval(response.text)  
	assert text["message"] == "Car Added to My Garage"

def test_garage():
	endpoint = "/myGarageInv"
	end_url = BROWSER_URL + endpoint
	data = {	
		 'custID' : 1 
		 }
	response = requests.post(end_url, json=data,headers=jWT_TOKEN)
	assert response.status_code == 200
	x = response.json()
	print(x)
	assert any(x["myGarageInv"][0])
	data = {	
		 'carID' : 9000 
		 }
	response = requests.post(end_url, json=data,headers=jWT_TOKEN)
	assert response.status_code == 200
	x = response.json()
	assert not any(x["myGarageInv"])

def test_car_purchase_history():
	endpoint = "/carPurchaseHistory"
	end_url = BROWSER_URL + endpoint
	user_data = {'userID' : '1',
			}
	response = requests.post(end_url, json=user_data)
	assert response.status_code == 200
	x = response.json()
	assert any(x["carPurchaseHistory"])

def test_product_purchase_history():
	endpoint = "/productPurchaseHistory"
	end_url = BROWSER_URL + endpoint
	user_data = {'userID' : '1',
			}
	response = requests.post(end_url, json=user_data,headers=jWT_TOKEN)
	assert response.status_code == 200
	x = response.json()
	assert any(x["productPurchaseHistory"])

def test_update_user_info():
	endpoint = "/updateUserInfo"
	end_url = BROWSER_URL + endpoint
	user_data = {'userID' : '1',
		 'firstName' : 'Michael',
		 'lastName' : 'Jones', 
		 'email' : 'mjj4@njit.edu',
		 'phoneNumber' : '2234767889',
		 }
	response = requests.post(end_url, json=user_data,headers=jWT_TOKEN)
	assert response.status_code == 200
	text = literal_eval(response.text)  
	assert text["message"] == "Successfully updated Customer Information"

def test_add_favorite():
	endpoint = "/addFavorite"
	end_url = BROWSER_URL + endpoint
	user_data = {'custID' : '1',
		 'make' : 'Audi',
		 'model' : 'Q5', 
		 'year' : '2021',
		 'vin' : '5TFCW5F1XBX026351'
		 }
	response = requests.post(end_url, json=user_data,headers=jWT_TOKEN)
	assert response.status_code == 200
	text = literal_eval(response.text)  
	assert text["message"] == "Car added to Favorites"

def test_check_favorite_true():
	endpoint = "/checkFavorite"
	end_url = BROWSER_URL + endpoint
	user_data = {'custID' : '1',
		 'make' : 'Audi',
		 'model' : 'Q5', 
		 'year' : '2021',
		}
	response = requests.post(end_url, json=user_data,headers=jWT_TOKEN)
	assert response.status_code == 200
	x = response.json()
	assert x["isFavorited"]

def test_check_favorites():
	endpoint = "/favoriteCars"
	end_url = BROWSER_URL + endpoint
	user_data = {'userID' : '1'
		}
	response = requests.post(end_url, json=user_data,headers=jWT_TOKEN)
	assert response.status_code == 200
	x = response.json()
	assert any(x["favoriteCars"])

def test_delete_favorite():
	endpoint = "/delFavorite"
	end_url = BROWSER_URL + endpoint
	user_data = {'custID' : '1',
		 'make' : 'Audi',
		 'model' : 'Q5', 
		 'year' : '2021',
		 'vin' : '5TFCW5F1XBX026351'
		 }
	response = requests.post(end_url, json=user_data,headers=jWT_TOKEN)
	assert response.status_code == 200
	text = literal_eval(response.text)  
	assert text["message"] == "Car deleted from Favorites"

def test_check_favorite_false():
	endpoint = "/checkFavorite"
	end_url = BROWSER_URL + endpoint
	user_data = {'custID' : '1',
		 'make' : 'Audi',
		 'model' : 'Q5', 
		 'year' : '2021',
		}
	response = requests.post(end_url, json=user_data,headers=jWT_TOKEN)
	assert response.status_code == 200
	x = response.json()
	assert not (x["isFavorited"])

def test_check_car_inv():
	endpoint = "/checkCarInInv"
	end_url = BROWSER_URL + endpoint
	user_data = {'custID' : '1',
	}
	response = requests.post(end_url, json=user_data)
	assert response.status_code == 200
	text = literal_eval(response.text)
	print(text["message"])  
	assert text["message"]
	user_data = {'custID' : '0',
	}
	response = requests.post(end_url, json=user_data)
	assert response.status_code == 200
	text = literal_eval(response.text)
	print(text["message"])  
	assert text["message"]

def test_schedule_test_drive():
	endpoint = "/scheduleTestDriveAppt"
	end_url = BROWSER_URL + endpoint
	user_data = {'custID' : '1', 
			  'datetime' : '2022-01-17 14:57:39'
			}
	response = requests.post(end_url, json=user_data)
	assert response.status_code == 200
	text = literal_eval(response.text)  
	assert text["message"] == "Appointment Scheduled"
	user_data = {'custID' : '', 
			  'datetime' : '2022-01-17 14:57:39'
			}
	response = requests.post(end_url, json=user_data)
	assert response.status_code == 400
	text = literal_eval(response.text)  
	assert text["message"] == "Missing custID or datetime"
	user_data = {'custID' : '1', 
			  'datetime' : ''
			}
	response = requests.post(end_url, json=user_data)
	assert response.status_code == 400
	text = literal_eval(response.text)  
	assert text["message"] == "Missing custID or datetime"
	user_data = {'custID' : '1', 
			  'datetime' : '  '
			}
	response = requests.post(end_url, json=user_data)
	assert response.status_code == 500
	text = literal_eval(response.text)  
	assert text["message"] == "Database error occurred"

def test_reschedule_test_drive():
	endpoint = "/rescheduleTestDriveAppt"
	end_url = BROWSER_URL + endpoint
	user_data = {'apptID' : '1', 
			  'datetime' : '2022-01-17 17:57:39'
			}
	response = requests.post(end_url, json=user_data,headers=jWT_TOKEN)
	assert response.status_code == 200
	text = literal_eval(response.text)  
	assert text["message"] == "Appointment rescheduled"

def test_avalible_test_drives():
	endpoint = "/availableTestDriveTimes"
	end_url = BROWSER_URL + endpoint
	user_data = { 
			  'date' : '2024-06-17'
			}
	response = requests.post(end_url, json=user_data,headers=jWT_TOKEN)
	assert response.status_code == 200
	x = response.json()
	assert (x["availableTimes"])

def test_cancel_test_drive():
	endpoint = "/cancelTestDriveAppt"
	end_url = BROWSER_URL + endpoint
	user_data = {'apptID' : '1', 
			}
	response = requests.post(end_url, json=user_data,headers=jWT_TOKEN)
	assert response.status_code == 200
	text = literal_eval(response.text)  
	assert text["testDriveAppt"] == "Appointment canceled"

def test_schedule_service():
	endpoint = "/scheduleServiceAppt"
	end_url = BROWSER_URL + endpoint
	user_data = {'userID' : '1',
			   'vin' : '5TFCW5F1XBX026351',
			   'serviceOption' : 'Oil Change',
			   'serviceDate' : "2024-12-25 13:57:39"
			}
	response = requests.post(end_url, json=user_data,headers=jWT_TOKEN)
	assert response.status_code == 200
	text = literal_eval(response.text)  
	assert text["message"] == "Appt Scheduled"

def test_avalible_services():
	endpoint = "/availableServiceTimes"
	end_url = BROWSER_URL + endpoint
	user_data = { 
			  'date' : '2024-05-17'
			}
	response = requests.post(end_url, json=user_data,headers=jWT_TOKEN)
	assert response.status_code == 200
	x = response.json()
	assert (x["availableTimes"])

def test_add_card():
	endpoint = "/addCard"
	end_url = BROWSER_URL + endpoint
	user_data = {'custID' : '1',
		 'cardNum' : '3194947083538471',
		 'cardHolderName' : 'Michael', 
		 'cvc' : '459',
		 'expDate' : '2027-04-22',
		}
	response = requests.post(end_url, json=user_data,headers=jWT_TOKEN)
	assert response.status_code == 200
	text = literal_eval(response.text)  
	assert text["message"] == "Card Added"

def test_test_drive_appointments():
	endpoint = "/testDriveAppts"
	end_url = BROWSER_URL + endpoint
	response = requests.get(end_url,headers=jWT_TOKEN)
	x = response.json()
	assert any(x["testDriveAppts"])

def test_add_ssn():
	endpoint = "/verify_or_add_ssn"
	end_url = BROWSER_URL + endpoint
	user_data = { "user_id": 1,
		'ssn' : "874-20-9637"
		}
	response = requests.post(end_url,json=user_data,headers=jWT_TOKEN)
	x = response.json()
	assert response.status_code == 200

def test_check_credit_score():
	endpoint = "/proxy_check_credit_score"
	end_url = BROWSER_URL + endpoint
	user_data = {'ssn' : "874-20-9637"
		}
	response = requests.post(end_url,json=user_data,headers=jWT_TOKEN)
	x = response.json()
	print(x["error"])
	assert response.status_code == 200

def test_add_bank_account():
	endpoint = "/proxy_add_bank_account"
	end_url = BROWSER_URL + endpoint
	user_data = {'ssn' : "874-20-9637",
			'full_name': "Michael",
			'routing _number': 572184963,
			"account_number": 829547,
			'bank': "Bank of America"
		}
	response = requests.post(end_url,json=user_data,headers=jWT_TOKEN)
	x = response.json()
	print(x["error"])
	assert response.status_code == 200

def test_loan_and_payment():
	endpoint = "/proxy_create_loan_and_payment"
	end_url = BROWSER_URL + endpoint
	user_data = {'ssn' : "874-20-9637",
			'loan_amount': 30000,
			'monthly_amount': 379,
			"initial_payment_amount": 500
		}
	response = requests.post(end_url,json=user_data,headers=jWT_TOKEN)
	x = response.json()
	print(x["error"])
	assert response.status_code == 200
