import { describe, it, before, after, beforeEach, afterEach } from 'mocha';
import { InsurancePurchasePage } from '../../src/pages/InsurancePurchasePage';
import { expect } from '../../src/assertion/SanAssertion';
import { BaseTest as GenericBaseTest } from '../../src/base';
import { createReporter } from '../../src/reporters';
import { ThenableWebDriver } from 'selenium-webdriver';

/**
 * InsurancePurchasePage test class
 */
class InsurancePurchaseTest extends GenericBaseTest<InsurancePurchasePage> {
  protected createPage(driver: ThenableWebDriver): InsurancePurchasePage {
    return new InsurancePurchasePage(driver);
  }

  async setupTest(): Promise<void> {
    await super.setupTest('http://localhost:3001/insurance-purchase.html');
  }
}

describe('OTO Insurance Purchase - Complete E2E Journey', () => {
  const test = new InsurancePurchaseTest(createReporter());

  before(async () => {
    await test.setupDriver();
  });

  after(async () => {
    await test.teardownDriver();
  });

  beforeEach(async () => {
    await test.setupTest();
  });

  afterEach(async function() {
    await test.teardownTest(this);
  });

  it('should complete full insurance purchase from customer creation to payment success', async () => {
    // ==================== DASHBOARD: VERIFY INITIAL STATE ====================
    console.log('📝 Starting E2E Test: OTO Insurance Purchase');
    console.log('📊 Step 1: Verifying Dashboard with Seed Data');

        // Debug: Wait a moment for JavaScript to initialize
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Debug: Check what's in the table
    const tableText = await test.page.policiesTableBody.getText();
    console.log(`Debug: Table body text: "${tableText}"`);
    console.log(`Debug: Table text length: ${tableText.length}`);

    // Verify seed policies exist in dashboard
    const seedPolicy1 = await test.page.isPolicyInTable('OTO-2024-00001');
    console.log(`Debug: Policy 1 found: ${seedPolicy1}`);
    const seedPolicy2 = await test.page.isPolicyInTable('OTO-2024-00002');
    console.log(`Debug: Policy 2 found: ${seedPolicy2}`);
    const seedPolicy3 = await test.page.isPolicyInTable('OTO-2024-00003');
    console.log(`Debug: Policy 3 found: ${seedPolicy3}`);
    
    expect(seedPolicy1).toBe(true);
    expect(seedPolicy2).toBe(true);
    expect(seedPolicy3).toBe(true);
    console.log('✅ Dashboard displays 3 seed policies');

    // Test search functionality with existing policy
    await test.page.searchPolicy('OTO-2024-00002');
    const searchedPolicy = await test.page.isPolicyInTable('OTO-2024-00002');
    expect(searchedPolicy).toBe(true);
    console.log('✅ Search functionality works');


    // Clear search and click Create New Policy
    await test.page.clearSearch();
    await test.page.clickCreateNewPolicy();
    console.log('✅ Clicked Create New Policy - Navigating to Customer Creation Form');

    // ==================== SCREEN 1: CREATE CUSTOMER ====================
    console.log('📝 Step 2: Creating New Customer Profile');

    // Fill customer information
    const customerData = {
      name: 'John Michael Doe',
      email: 'john.doe@example.com',
      phone: '555-123-4567',
      dob: '01/15/1985'
    };

    await test.page.createCustomer(
      customerData.name,
      customerData.email,
      customerData.phone,
      customerData.dob
    );
    console.log('✅ Screen 1: Customer information entered');

    // Navigate to vehicle selectionThe test seems to be stuck. Let me check if the test is still running:



    await test.page.clickNextToVehicleSelection();
    console.log('✅ Transitioned to Screen 2: Vehicle Selection');

    // ==================== SCREEN 2: VEHICLE & COVERAGE SELECTION ====================
    console.log('📝 Step 3: Selecting Vehicle and Coverage');

    // Verify customer info is displayed on screen 2
    const displayedName = await test.page.getDisplayedCustomerName();
    const displayedEmail = await test.page.getDisplayedCustomerEmail();
    const displayedPhone = await test.page.getDisplayedCustomerPhone();

    expect(displayedName).toBe(customerData.name);
    expect(displayedEmail).toBe(customerData.email);
    expect(displayedPhone).toBe(customerData.phone);
    console.log('✅ Screen 2: Customer info correctly displayed from Screen 1');

    // Select vehicle type - using hover() and click()
    await test.page.selectVehicleType('suv');
    const isSUVSelected = await test.page.isVehicleSelected('suv');
    expect(isSUVSelected).toBe(true);
    console.log('✅ Vehicle type selected: SUV (hover + click tested)');

    // Select vehicle details using selectByValue()
    await test.page.selectVehicleMake('toyota');
    const selectedMake = await test.page.getSelectedVehicleMake();
    expect(selectedMake).toBe('toyota');
    console.log('✅ Vehicle make selected: Toyota (selectByValue tested)');

    // Fill vehicle year and mileage using type()
    await test.page.fillVehicleDetails('2022', '15000');
    console.log('✅ Vehicle details filled: 2022, 15k miles (type tested)');

    // Select coverage using check() on radio buttons
    await test.page.selectCoverage('premium');
    console.log('✅ Coverage selected: Premium (radio check tested)');

    // Select accessories using check() on checkboxes
    await test.page.selectAccessories({
      roadside: true,
      rental: true,
      gap: false
    });

    // Verify accessories using isChecked()
    const hasRoadside = await test.page.isAccessorySelected('roadside');
    const hasRental = await test.page.isAccessorySelected('rental');
    const hasGap = await test.page.isAccessorySelected('gap');

    expect(hasRoadside).toBe(true);
    expect(hasRental).toBe(true);
    expect(hasGap).toBe(false);
    console.log('✅ Accessories selected: Roadside + Rental (checkbox check/isChecked tested)');

    // Select deductible using selectByText()
    await test.page.selectDeductible('$500');
    console.log('✅ Deductible selected: $500 (selectByText tested)');

    // Navigate to review
    await test.page.clickNextToReview();
    console.log('✅ Transitioned to Screen 3: Review Page');

    // ==================== SCREEN 3: REVIEW PAGE ====================

    // Verify all customer data using getText()
    const reviewName = await test.page.getReviewCustomerName();
    const reviewEmail = await test.page.getReviewCustomerEmail();

    expect(reviewName).toBe(customerData.name);
    expect(reviewEmail).toBe(customerData.email);
    console.log('✅ Review: Customer data verified (getText tested)');

    // Verify vehicle data
    const reviewVehicleType = await test.page.getReviewVehicleType();
    const reviewMake = await test.page.getReviewVehicleMake();
    const reviewYear = await test.page.getReviewVehicleYear();

    expect(reviewVehicleType.toLowerCase()).toInclude('suv');
    expect(reviewMake.toLowerCase()).toInclude('toyota');
    expect(reviewYear).toInclude('2022');
    console.log('✅ Review: Vehicle details verified');

    // Verify coverage and accessories
    const reviewCoverage = await test.page.getReviewCoverage();
    const reviewAccessories = await test.page.getReviewAccessories();
    const reviewDeductible = await test.page.getReviewDeductible();

    expect(reviewCoverage.toLowerCase()).toInclude('premium');
    expect(reviewAccessories.toLowerCase()).toInclude('roadside');
    expect(reviewAccessories.toLowerCase()).toInclude('rental');
    expect(reviewDeductible).toInclude('$500');
    console.log('✅ Review: Coverage and accessories verified');

    // Get total for payment verification
    const reviewTotal = await test.page.getReviewTotal();
    console.log(`✅ Review: Total calculated: ${reviewTotal}`);

    // Navigate to payment
    await test.page.clickNextToPayment();
    console.log('✅ Transitioned to Screen 4: Payment (Checkout)');

    // ==================== SCREEN 4: PAYMENT (CHECKOUT) ====================

    // Verify payment total matches review total using getText()
    const paymentTotal = await test.page.getPaymentTotal();
    expect(paymentTotal).toBe(reviewTotal);
    console.log(`✅ Payment: Total verified: ${paymentTotal} (getText tested)`);

    // Enter payment details using type()
    await test.page.enterPaymentDetails(
      'John M Doe',
      '4532123456789012',
      '12/25',
      '123'
    );
    console.log('✅ Payment: Card details entered (type tested)');

    // Agree to terms using check()
    await test.page.agreeToTerms();
    console.log('✅ Payment: Terms agreed (checkbox check tested)');

    // Verify payment button is enabled using isEnabled()
    const isButtonEnabled = await test.page.isPaymentButtonEnabled();
    expect(isButtonEnabled).toBe(true);
    console.log('✅ Payment: Submit button enabled (isEnabled tested)');

    // Submit payment using clickWithJavaScript()
    await test.page.submitPayment();
    console.log('✅ Payment: Submitted (clickWithJavaScript tested)');

    // ==================== SUCCESS SCREEN ====================

    // Wait for loading overlay to disappear and success screen to appear
    console.log('⏳ Waiting for success screen...');
    // Wait for policy number element to be visible (waits for setTimeout to complete)
    await test.page.policyNumberElement.waitUntilVisible(5000);
    
    // Verify success screen is displayed using isDisplayed()
    const isSuccessDisplayed = await test.page.isSuccessScreenDisplayed();
    console.log(`Debug: Success screen displayed = ${isSuccessDisplayed}`);
    expect(isSuccessDisplayed).toBe(true);
    console.log('✅ Success: Payment confirmed screen displayed (isDisplayed tested)');

    // Verify policy number is generated using getText()
    const policyNumber = await test.page.getPolicyNumber();
    // Policy number format: OTO-2024-XXXXXXXXX
    expect(policyNumber).toInclude('OTO-2024-');
    expect(policyNumber.length).toBeGreaterThan(10);
    console.log(`✅ Success: Policy number generated: ${policyNumber}`);

    // Verify confirmation email using getText()
    const confirmEmail = await test.page.getConfirmationEmail();
    expect(confirmEmail).toBe(customerData.email);
    console.log(`✅ Success: Confirmation email verified: ${confirmEmail}`);

    // ==================== RETURN TO DASHBOARD ====================
    console.log('\n📊 Step 6: Returning to Dashboard');
    
    await test.page.clickBackToDashboardFromSuccess();
    console.log('✅ Clicked Back to Dashboard from Success screen');

    // ==================== SEARCH FOR NEWLY CREATED POLICY ====================
    console.log('\n🔍 Step 7: Searching for Newly Created Policy');
    
    // Search by policy number
    await test.page.searchPolicy(policyNumber);
    const newPolicyExists = await test.page.isPolicyInTable(policyNumber);
    expect(newPolicyExists).toBe(true);
    console.log(`✅ Found newly created policy in dashboard: ${policyNumber}`);

    // Clear search to see all policies (should now have 4 total)
    await test.page.clearSearch();
    console.log('✅ Search cleared - Dashboard shows all policies');

    // ==================== VIEW POLICY DETAILS ====================
    console.log('\n👁️  Step 8: Viewing Policy Details');
    
    await test.page.clickViewPolicy(policyNumber);
    console.log('✅ Opened policy detail view');

    // Get all policy details
    const policyDetails = await test.page.getPolicyDetails();
    
    // Verify customer information matches
    expect(policyDetails.customerName).toBe(customerData.name);
    expect(policyDetails.email).toBe(customerData.email);
    expect(policyDetails.phone).toBe(customerData.phone);
    expect(policyDetails.dob).toBe(customerData.dob);
    console.log('✅ Policy Detail: Customer information verified');

    // Verify vehicle information matches
    expect(policyDetails.vehicleType).toBe('SUV');
    expect(policyDetails.vehicleMake).toBe('Toyota');
    expect(policyDetails.vehicleYear).toBe('2022');
    expect(policyDetails.vehicleMileage).toBe('15000');
    console.log('✅ Policy Detail: Vehicle information verified');

    // Verify coverage information matches
    expect(policyDetails.coverageType).toBe('Premium');
    expect(policyDetails.deductible).toBe('$500');
    expect(policyDetails.accessories).toInclude('Roadside');
    expect(policyDetails.accessories).toInclude('Rental');
    expect(policyDetails.monthlyPremium).toBe('$1325/month');
    console.log('✅ Policy Detail: Coverage and pricing verified');

    // Verify payment information
    expect(policyDetails.cardholderName).toBe('John M Doe');
    expect(policyDetails.cardNumber).toInclude('9012'); // Last 4 digits of 4532123456789012
    expect(policyDetails.policyNumber).toBe(policyNumber);
  });
});
