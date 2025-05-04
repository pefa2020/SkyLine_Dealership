from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.alert import Alert
from selenium.webdriver.support.select import Select
import time

def wait(sec):
	time.sleep(sec)


def scroll_page(browser, pixels, speed):
    current_scroll_position = 0
    while current_scroll_position < pixels:
        browser.execute_script("window.scrollBy(0, " + str(speed) + ");")
        current_scroll_position += speed
        time.sleep(0.1)

def scroll_page_up(browser, pixels, speed):
    current_scroll_position = 0
    while current_scroll_position < pixels:
        browser.execute_script("window.scrollBy(0, -" + str(speed) + ");")
        current_scroll_position += speed
        time.sleep(0.1)



def login(username, password):
    loginButtonNavbar = browser.find_element(by='id', value='NavbarLoginButton')
    loginButtonNavbar.click()
    wait(1)
    username_field = browser.find_element(by='id', value='usernameInputLogin')
    username_field.send_keys(username)
    wait(1)
    password_field = browser.find_element(by='id', value='passwordInputLogin')
    password_field.send_keys(password)
    wait(1)
    loginPageButton = browser.find_element(by='id', value='LoginPageButton')
    loginPageButton.click()



def viewInv():
    carNameFilter = browser.find_element(by='id', value='CarNameFilter')
    carNameFilter.send_keys('Audi')
    wait(2)
    filterBarSearchButton = browser.find_element(by='id', value='filterBarSearchButton')
    filterBarSearchButton.click()
    wait(2)
    carNameFilter.clear()
    carNameFilter.send_keys(' ')
    filterBarSearchButton.click()
    carNameFilter.clear()




def viewVehicleDetails():
    browser.get('http://localhost:3000/vehicleDetails/WAULD64B03N739082/34')
    wait(2)
    scroll_page(browser, 1500, 50)
    wait(2)
    scroll_page_up(browser, 1500, 50)



def TestDrive():
    testDriveButton = browser.find_element(by='id', value='VehicleDetailsTestDriveButton')
    testDriveButton.click()
    wait(2)
    date_input = browser.find_element(by='id', value='TestDrivePopupDate')
    date_input.send_keys('06262024')
    wait(2)
    time_input = browser.find_element(by='id', value='TestDrivePopupTime')
    time_input.send_keys('100000')
    wait(2)
    scheduleTestDrive = browser.find_element(by='id', value='testDriveButton')
    scheduleTestDrive.click()



def scheduleService():
    sideBarNavButton = browser.find_element(by='id', value='DealershipLoggedSideBarOpen')
    sideBarNavButton.click()
    wait(2)
    myGarageButton = browser.find_element(by='id', value='My Garage')
    myGarageButton.click()
    wait(2)
    carMake = browser.find_element(by='id', value='GarageCarMake')
    select = Select(carMake)
    select.select_by_value('BMW')
    wait(.5)
    carModel = browser.find_element(by='id', value='GarageCarModel')
    select = Select(carModel)
    select.select_by_value('X5')
    wait(.5)
    carYear = browser.find_element(by='id', value='GarageCarYear')
    select = Select(carYear)
    select.select_by_value('2020')
    wait(.5)
    vin = browser.find_element(by='id', value='GarageCarVin')
    vin.clear()
    vin.send_keys('JN8AF5MRXCT940100')
    wait(.5)
    submitButton = browser.find_element(by='id', value='GarageAddCarButton')
    submitButton.click()
    wait(3)
    serviceButton = browser.find_element(by='id', value='JN8AF5MRXCT940100serviceButton')
    serviceButton.click()
    wait(3)
    carWashScheduleButton = browser.find_element(by='id', value='serviceButton')
    carWashScheduleButton.click()
    wait(2)
    cardholderName = browser.find_element(by='id', value='cardholderName')
    cardholderName.send_keys('John')
    wait(2)
    cardNum = browser.find_element(by='id', value='cardNum')
    cardNum.send_keys('1234123412341234')
    wait(2)
    expDate = browser.find_element(by='id', value='expDate')
    expDate.send_keys('09002025')
    wait(2)
    cvc = browser.find_element(by='id', value='cvc')
    cvc.send_keys('123')
    wait(2)
    carWashDatePicker = browser.find_element(by='id', value='date')
    carWashDatePicker.send_keys('09052024')
    wait(2)
    carWashTimePicker = browser.find_element(by='id', value='time')
    carWashTimePicker.send_keys('12:00:00')

    wait(2)
    carWashScheduleDateButton = browser.find_element(by='id', value='button')
    carWashScheduleDateButton.click()
    wait(3)
    scroll_page_up(browser, 1000, 50)



def logout():
    loginButtonNavbar = browser.find_element(by='id', value='DealershipLoggedLogoutButton')
    loginButtonNavbar.click()


def managerSearchCarSale(saleNum):
    text = browser.find_element(by='id', value='managerPageSearchSaleText')
    text.send_keys(saleNum)
    wait(1)
    searchButton = browser.find_element(by='id', value='managerPageSearchButton')
    searchButton.click()
    wait(.5)
    scroll_page(browser, 500, 50)
    wait(2)


def inventoryManagement():
    sideBar = browser.find_element(by='id', value='ManagerLoggedSideBarOpen')
    sideBar.click()
    wait(2)
    inventoryButton = browser.find_element(by='id', value='Inventory')
    inventoryButton.click()
    wait(2)

    # Add Car
    addCarButton = browser.find_element(by='id', value='managerInventoryAddCar')
    addCarButton.click()
    wait(1)
    make = browser.find_element(by='id', value='managerAddCarMake')
    make.send_keys('Audi')
    wait(.5)
    model = browser.find_element(by='id', value='managerAddCarModel')
    model.send_keys('Q10')
    wait(.5)
    year = browser.find_element(by='id', value='managerAddCarYear')
    year.send_keys('2024')
    wait(1)
    addCarSubmitButton = browser.find_element(by='id', value='managerAddCarSubmitButton')
    addCarSubmitButton.click()
    wait(3)

    browser.back()
    wait(1)

    # Add Individual Car
    addIndCarButton = browser.find_element(by='id', value='managerInventoryAddIndivCar')
    addIndCarButton.click()
    wait(1)
    vin = browser.find_element(by='id', value='managerAddIndivCarVin')
    vin.send_keys('JN8AF5MRXTT940234')
    wait(.5)
    make = browser.find_element(by='id', value='managerAddIndivCarMake')
    make.send_keys('Audi')
    wait(.5)
    model = browser.find_element(by='id', value='managerAddIndivCarModel')
    model.send_keys('Q10')
    wait(.5)
    year = browser.find_element(by='id', value='managerAddIndivCarYear')
    year.send_keys('2024')
    wait(1)
    addCarSubmitButton = browser.find_element(by='id', value='managerAddIndivCarSubmitButton')
    addCarSubmitButton.click()
    wait(2)
    managerDealershipLoggedLogoutButton = browser.find_element(by='id', value='ManagerDealershipLoggedLogoutButton')
    managerDealershipLoggedLogoutButton.click()
    wait(2)
    carNameFilter = browser.find_element(by='id', value='CarNameFilter')
    carNameFilter.send_keys('Q10')
    wait(2)
    filterBarSearchButton = browser.find_element(by='id', value='filterBarSearchButton')
    filterBarSearchButton.click()
    wait(2)
    carNameFilter.clear()
    carNameFilter.send_keys(' ')
    filterBarSearchButton.click()
    carNameFilter.clear()

    

def adminCreateAccount():
    jobTitle = browser.find_element(by='id', value='adminPageJobDropdown')
    jobTitle.click()
    wait(1)
    manager = browser.find_element(by='id', value='adminJobTitleTech')
    manager.click()
    wait(1)
    phoneNum = browser.find_element(by='id', value='adminPagePhone')
    phoneNum.send_keys('1112223334')
    wait(1)
    firstName = browser.find_element(by='id', value='adminPageFirstName')
    firstName.send_keys('John')
    wait(1)
    lastName = browser.find_element(by='id', value='adminPageLastName')
    lastName.send_keys('Doe')
    wait(1)
    username = browser.find_element(by='id', value='adminPageUsername')
    username.send_keys('johndoe1234')
    wait(1)
    email = browser.find_element(by='id', value='adminPageEmail')
    email.send_keys('john.doe1234@gmail.com')
    wait(1)
    password = browser.find_element(by='id', value='adminPagePassword')
    password.send_keys('password')
    wait(1)
    scroll_page(browser, 300, 50)
    createButton = browser.find_element(by='id', value='adminPageCreateAccountButton')
    createButton.click()
    wait(2)
    scroll_page_up(browser, 1000, 50)


def adminManageUsers():
    sideBar = browser.find_element(by='id', value='AdminLoggedSideBarOpen')
    sideBar.click()
    wait(1)
    manageButton = browser.find_element(by='id', value='Manage Accounts')
    manageButton.click()
    wait(1)
    scroll_page(browser, 2000, 100)
    wait(2)
    editButton = browser.find_element(by='id', value='johndoe1234edit')
    editButton.click()
    wait(3)
    closeButton = browser.find_element(by='id', value='adminEditCloseButton')
    closeButton.click()
    wait(2)
    deleteButton = browser.find_element(by='id', value='johndoe1234delete')
    deleteButton.click()
    wait(3)
    scroll_page_up(browser, 2500, 100)


def adminViewReports():
    sideBar = browser.find_element(by='id', value='AdminLoggedSideBarOpen')
    sideBar.click()
    wait(2)
    reportsButton = browser.find_element(by='id', value='View Reports')
    reportsButton.click()
    wait(2)
    selectYearButton = browser.find_element(by='id', value='reportSelectYearButton')
    selectYearButton.click()
    wait(1)
    year = browser.find_element(by='id', value='2021report')
    year.click()
    wait(1)
    selectMonthButton = browser.find_element(by='id', value='reportSelectMonthButton')
    selectMonthButton.click()
    wait(1)
    month = browser.find_element(by='id', value='aprilReport')
    month.click()
    wait(1)
    fetchMonthlySalesButton = browser.find_element(by='id', value='fetchMonthlySales')
    fetchMonthlySalesButton.click()
    wait(3)
    
    selectYearButton = browser.find_element(by='id', value='reportSelectYearButton')
    selectYearButton.click()
    wait(1)
    year = browser.find_element(by='id', value='2023report')
    year.click()
    wait(1)
    selectMonthButton = browser.find_element(by='id', value='reportSelectMonthButton')
    selectMonthButton.click()
    wait(1)
    month = browser.find_element(by='id', value='marchReport')
    month.click()
    wait(1)
    fetchMonthlyPaymentsButton = browser.find_element(by='id', value='fetchMonthlyPayments')
    fetchMonthlyPaymentsButton.click()
    wait(2)
    


def technicianTicket():
    ticketButton = browser.find_element(by='id', value='JN8AF5MRXCT940100ticket')
    ticketButton.click()
    wait(1)
    ticketButton.click()
    wait(2)
    sideBar = browser.find_element(by='id', value='DealershipLoggedSideBarOpen')
    sideBar.click()
    wait(2)
    myTicketsButton = browser.find_element(by='id', value='My Tickets')
    myTicketsButton.click()
    wait(2)
    ticketStatusButton = browser.find_element(by='id', value='JN8AF5MRXCT940100openTicketStatus')
    ticketStatusButton.click()
    wait(2)
    ticketProgress = browser.find_element(by='id', value='JN8AF5MRXCT940100openTicketStatusProgress')
    ticketProgress.click()
    wait(1)
    ticketUpdate = browser.find_element(by='id', value='JN8AF5MRXCT940100openTicketUpdate')
    ticketUpdate.click()
    wait(3)
    ticketVoid = browser.find_element(by='id', value='JN8AF5MRXCT940100openTicketVoid')
    ticketVoid.click()
    wait(2)
    ticketTextArea = browser.find_element(by='id', value='ticketTextArea')
    ticketTextArea.send_keys("Service complete")
    wait(2)
    confirmTicketVoid = browser.find_element(by='id', value='YesCutTicket')
    confirmTicketVoid.click()
    wait(4)
    browser.refresh()
    wait(3)

    # Ticket History
    sideBar = browser.find_element(by='id', value='DealershipLoggedSideBarOpen')
    sideBar.click()
    wait(2)
    myTicketsButton = browser.find_element(by='id', value='My History')
    myTicketsButton.click()

    
def adminlogout():
    loginButtonNavbar = browser.find_element(by='id', value='AdminLogOut')
    loginButtonNavbar.click()



def purchaseProcess():
    purchaseButton = browser.find_element(by='id', value='VehicleDetailsPurchaseButton')
    purchaseButton.click()
    wait(2)
    purchasePurchaseButton = browser.find_element(by='id', value='purchasePagePurchaseButton')
    purchasePurchaseButton.click()
    wait(4)
    browser.back()
    wait(2)
    purchasePurchaseButton = browser.find_element(by='id', value='purchasePageNegotiateButton')
    purchasePurchaseButton.click()
    wait(2)
    managerSelectButton = browser.find_element(by='id', value='negotiationManagerSelect5')
    managerSelectButton.click()
    wait(2)
    negotiateTextBox = browser.find_element(by='id', value='negotiateTextBox')
    negotiateTextBox.send_keys("Hey I'd like to propose a price!")
    wait(2)
    negotiateSendMessageButton = browser.find_element(by='id', value='negotiateSendMessageButton')
    negotiateSendMessageButton.click()
    wait(2)
    negotiatePropsePriceInput = browser.find_element(by='id', value='negotiatePropsePriceInput')
    negotiatePropsePriceInput.send_keys("40000")
    wait(2)
    negotiateProposePriceButton = browser.find_element(by='id', value='negotiateProposePriceButton')
    negotiateProposePriceButton.click()
    wait(2)

    # Purchase car
    browser.back()
    wait(2)
    purchasePurchaseButton = browser.find_element(by='id', value='purchasePagePurchaseButton')
    purchasePurchaseButton.click()
    wait(2)
    inputFullName = browser.find_element(by='id', value='inputFullName')
    inputFullName.send_keys("John Davis")
    wait(1)
    inputRoutingNumber = browser.find_element(by='id', value='inputRoutingNumber')
    inputRoutingNumber.send_keys("111222333")
    wait(1)
    inputAccountNumber = browser.find_element(by='id', value='inputAccountNumber')
    inputAccountNumber.send_keys("100100")
    wait(1)
    inputSSN = browser.find_element(by='id', value='inputSSN')
    inputSSN.send_keys("123456789")
    wait(1)
    selectBank = browser.find_element(by='id', value='selectBank')
    select = Select(selectBank)
    select.select_by_value('Citi Group')
    wait(1)
    continueButton = browser.find_element(by='id', value='continueButton')
    continueButton.click()
    wait(4)
    cashPaymentOption = browser.find_element(by='id', value='cashPaymentOption')
    cashPaymentOption.click()
    wait(2)
    continueButton = browser.find_element(by='id', value='continueButton')
    continueButton.click()
    wait(4)
    addWarranty = browser.find_element(by='id', value='addWarranty-1')
    addWarranty.click()
    wait(2)
    scroll_page(browser, 2000, 100)
    wait(2)
    continueWarrentyButton = browser.find_element(by='id', value='continueWarrentyButton')
    continueWarrentyButton.click()
    wait(4)
    inputDriverLicense = browser.find_element(by='id', value='inputDriverLicense')
    inputDriverLicense.send_keys("F12341234512345")
    wait(2)
    continueLicenseCheckButton = browser.find_element(by='id', value='continueLicenseCheckButton')
    continueLicenseCheckButton.click()
    wait(4)
    scroll_page(browser, 2000, 100)
    digitalSignatureInput = browser.find_element(by='id', value='digitalSignatureInput')
    digitalSignatureInput.send_keys("John Davis")
    wait(2)
    confirmContinueButton = browser.find_element(by='id', value='confirmContinueButton')
    confirmContinueButton.click()
    


def managerSignContract():
    sideBar = browser.find_element(by='id', value='ManagerLoggedSideBarOpen')
    sideBar.click()
    wait(2)
    contracts = browser.find_element(by='id', value='Loans and Contracts')
    contracts.click()
    wait(4)

    contract1 = browser.find_element(by='id', value='Contract-1')
    contract1.click()
    wait(4)
    signContract = browser.find_element(by='id', value='signContract')
    signContract.click()


    



browser = webdriver.Chrome()
browser.maximize_window()
# View inventory NOT LOGGED IN
browser.get('http://localhost:3000/')
wait(4)
browser.get('http://localhost:3000/skyline')
wait(4)

# Login
login('user34', '1199111111')
wait(3)

#View inventory, search/filter
viewInv()
wait(2)

# Click on vehicle details
viewVehicleDetails()
wait(2)

# Schedule Test Drive
TestDrive()
wait(3)

# Purchase Process (Can buy now, or negotiate)
purchaseProcess()
wait(3)

# Schedule Service
scheduleService()
wait(2)


# Log out
logout()
wait(2)

# Log in as manager
login('user5', '1611111111')
wait(3)

# Sign Contract
managerSignContract()
wait(3)
sideBar = browser.find_element(by='id', value='ManagerLoggedSideBarOpen')
sideBar.click()
wait(2)
home = browser.find_element(by='id', value='Home')
home.click()
wait(4)
# Search car sale
scroll_page(browser, 2000, 50)
wait(1)
managerSearchCarSale(1)
wait(1)
scroll_page_up(browser, 2000, 50)
wait(1)

# Inventory management
inventoryManagement()
wait(3)


# Log in as admin
login('admin', 'admin')
wait(3)

# Admin Create Account
adminCreateAccount()
wait(2)

# Admin Manage Accounts
adminManageUsers()
wait(2)

# Admin View Reports
adminViewReports()
wait(2)

adminlogout()
wait(3)

# Login as Tech
login('user3', '1411111111')
wait(4)

# Start ticket, change status, and void it
technicianTicket()
wait(4)
logout()
wait(3)





browser.quit()
