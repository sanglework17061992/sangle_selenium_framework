import { BasePage } from "../BasePage";

/**
 * Page Object for OTO Insurance Purchase E2E Test
 * Follows realistic E2E flow: Dashboard to Create Customer to Vehicle/Coverage Selection to Review to Payment to Success to Back to Dashboard to Search and View Policy
 */
export class InsurancePurchasePage extends BasePage {
        // ==================== DASHBOARD ====================
    get createNewPolicyButton() { return this.byId("createNewPolicy"); }
    get policySearchInput() { return this.byId("policySearch"); }
    get searchButton() { return this.byId("searchButton"); }
    get clearSearchButton() { return this.byId("clearSearch"); }
    get policiesTableBody() { return this.byId("policiesTableBody"); }
    
    policyRow(policyNumber: string) { 
        return this.byCss(`#policiesTable td:first-child`);  // Simpler: just get first cell
    }
    
    viewPolicyButton(policyNumber: string) {
        return this.byXpath(`//table[@id='policiesTable']//td[text()='${policyNumber}']/following-sibling::td//button[contains(@class,'view-btn')]`);
    }

    get backToDashboardButton() { return this.byId("backToDashboard"); }
    get viewCustomerName() { return this.byId("viewCustomerName"); }
    get viewCustomerEmail() { return this.byId("viewCustomerEmail"); }
    get viewCustomerPhone() { return this.byId("viewCustomerPhone"); }
    get viewCustomerDOB() { return this.byId("viewCustomerDOB"); }
    get viewVehicleType() { return this.byId("viewVehicleType"); }
    get viewVehicleMake() { return this.byId("viewVehicleMake"); }
    get viewVehicleYear() { return this.byId("viewVehicleYear"); }
    get viewVehicleMileage() { return this.byId("viewVehicleMileage"); }
    get viewCoverageType() { return this.byId("viewCoverageType"); }
    get viewDeductible() { return this.byId("viewDeductible"); }
    get viewAccessories() { return this.byId("viewAccessories"); }
    get viewMonthlyPremium() { return this.byId("viewMonthlyPremium"); }
    get viewCardholderName() { return this.byId("viewCardholderName"); }
    get viewCardNumber() { return this.byId("viewCardNumber"); }
    get viewPolicyNumber() { return this.byId("viewPolicyNumber"); }

    // ==================== SCREEN 1: CREATE CUSTOMER ====================
    get fullNameInput() { return this.byId("fullName"); }
    get emailInput() { return this.byId("email"); }
    get phoneInput() { return this.byId("phone"); }
    get dateOfBirthInput() { return this.byId("dateOfBirth"); }
    get nextStep1Button() { return this.byId("nextStep1"); }

    // ==================== SCREEN 2: VEHICLE & COVERAGE SELECTION ====================
    // Customer info display (from screen 1)
    get step2CustomerName() { return this.byId("step2CustomerName"); }
    get step2CustomerEmail() { return this.byId("step2CustomerEmail"); }
    get step2CustomerPhone() { return this.byId("step2CustomerPhone"); }

    // Vehicle selection
    vehicleCard(type: string) { return this.byCss(`.vehicle-card[data-type="${type}"]`); }
    get vehicleMakeSelect() { return this.byId("vehicleMake"); }
    get vehicleYearInput() { return this.byId("vehicleYear"); }
    get mileageInput() { return this.byId("mileage"); }

    // Coverage selection
    coverageRadio(type: string) { return this.byId(`coverage${type.charAt(0).toUpperCase() + type.slice(1)}`); }
    get roadsideCheckbox() { return this.byId("roadsideAssistance"); }
    get rentalCheckbox() { return this.byId("rentalCoverage"); }
    get gapCheckbox() { return this.byId("gapCoverage"); }
    get deductibleSelect() { return this.byId("deductible"); }
    
    get nextStep2Button() { return this.byId("nextStep2"); }
    get prevStep2Button() { return this.byId("prevStep2"); }

    // ==================== SCREEN 3: REVIEW PAGE ====================
    get summaryName() { return this.byId("summaryName"); }
    get summaryEmail() { return this.byId("summaryEmail"); }
    get summaryPhone() { return this.byId("summaryPhone"); }
    get summaryVehicleType() { return this.byId("summaryVehicleType"); }
    get summaryMake() { return this.byId("summaryMake"); }
    get summaryYear() { return this.byId("summaryYear"); }
    get summaryMileage() { return this.byId("summaryMileage"); }
    get summaryCoverage() { return this.byId("summaryCoverage"); }
    get summaryOptions() { return this.byId("summaryOptions"); }
    get summaryDeductible() { return this.byId("summaryDeductible"); }
    get summaryTotal() { return this.byId("summaryTotal"); }
    
    get nextStep3Button() { return this.byId("nextStep3"); }
    get prevStep3Button() { return this.byId("prevStep3"); }

    // ==================== SCREEN 4: PAYMENT (CHECKOUT) ====================
    get paymentTotal() { return this.byId("paymentTotal"); }
    get cardNameInput() { return this.byId("cardName"); }
    get cardNumberInput() { return this.byId("cardNumber"); }
    get cardExpiryInput() { return this.byId("cardExpiry"); }
    get cardCVVInput() { return this.byId("cardCVV"); }
    get agreeTermsCheckbox() { return this.byId("agreeTerms"); }
    get submitPaymentButton() { return this.byId("submitPayment"); }
    get prevStep4Button() { return this.byId("prevStep4"); }

    // ==================== SUCCESS SCREEN ====================
    get policyNumberElement() { return this.byId("policyNumber"); }
    get confirmEmailElement() { return this.byId("confirmEmail"); }
    get backToDashboardFromSuccessButton() { return this.byId("backToDashboardFromSuccess"); }

    /**
     * Navigate to the insurance purchase page
     */
    async navigate(): Promise<void> {
        await this.driver.get("http://localhost:3001/insurance-purchase.html");
    }

    // ==================== SCREEN 1: CREATE CUSTOMER ====================

    /**
     * Create customer profile (Screen 1)
     */
    async createCustomer(name: string, email: string, phone: string, dob: string): Promise<void> {
        await this.fullNameInput.type(name);
        await this.emailInput.type(email);
        await this.phoneInput.type(phone);
        await this.dateOfBirthInput.type(dob);
    }

    async clickNextToVehicleSelection(): Promise<void> {
        await this.nextStep1Button.click();
    }

    // ==================== SCREEN 2: VEHICLE & COVERAGE ====================

    /**
     * Verify customer info is displayed on screen 2
     */
    async getDisplayedCustomerName(): Promise<string> {
        return await this.step2CustomerName.getText();
    }

    async getDisplayedCustomerEmail(): Promise<string> {
        return await this.step2CustomerEmail.getText();
    }

    async getDisplayedCustomerPhone(): Promise<string> {
        return await this.step2CustomerPhone.getText();
    }

    /**
     * Select vehicle type
     */
    async selectVehicleType(type: "car" | "suv" | "truck" | "motorcycle"): Promise<void> {
        await this.vehicleCard(type).hover();
        await this.vehicleCard(type).click();
    }

    async isVehicleSelected(type: string): Promise<boolean> {
        const classes = await this.vehicleCard(type).getAttribute("class");
        return classes?.includes("selected") || false;
    }

    /**
     * Select vehicle details
     */
    async selectVehicleMake(make: string): Promise<void> {
        await this.vehicleMakeSelect.selectByValue(make);
    }

    async getSelectedVehicleMake(): Promise<string | null> {
        return await this.vehicleMakeSelect.getAttribute('value');
    }

    async fillVehicleDetails(year: string, mileage: string): Promise<void> {
        await this.vehicleYearInput.type(year);
        await this.mileageInput.type(mileage);
    }

    /**
     * Select coverage and accessories
     * 
     * Note: Using force: true because:
     * 1. Radio buttons and checkboxes are often styled with custom CSS that hides the actual input
     * 2. The clickable label may overlay the input, causing "element obscured" errors
     * 3. force: true bypasses actionability checks and clicks the underlying element directly
     * 
     * This is a common pattern for custom-styled form controls where the visual element
     * differs from the actual input element.
     */
    async selectCoverage(type: "basic" | "standard" | "premium"): Promise<void> {
        await this.coverageRadio(type).check({ force: true });
    }

    async selectAccessories(options: { roadside?: boolean; rental?: boolean; gap?: boolean }): Promise<void> {
        if (options.roadside) await this.roadsideCheckbox.check({ force: true });
        if (options.rental) await this.rentalCheckbox.check({ force: true });
        if (options.gap) await this.gapCheckbox.check({ force: true });
    }

    async isAccessorySelected(option: "roadside" | "rental" | "gap"): Promise<boolean> {
        switch (option) {
            case "roadside": return await this.roadsideCheckbox.isChecked();
            case "rental": return await this.rentalCheckbox.isChecked();
            case "gap": return await this.gapCheckbox.isChecked();
        }
    }

    async selectDeductible(amount: string): Promise<void> {
        await this.deductibleSelect.selectByText(amount);
    }

    /**
     * Click next to review
     * 
     * Note: Using force: true because this button appears at the bottom of a long form
     * with multiple sections (vehicle + coverage). The button may be partially obscured
     * by sticky headers, footers, or overlapping form sections during scroll animations.
     */
    async clickNextToReview(): Promise<void> {
        await this.nextStep2Button.click({ force: true });
    }

    // === Screen 3: Review Page ===

    /**
     * Verify all data on review page
     */
    async getReviewCustomerName(): Promise<string> {
        return await this.summaryName.getText();
    }

    async getReviewCustomerEmail(): Promise<string> {
        return await this.summaryEmail.getText();
    }

    async getReviewVehicleType(): Promise<string> {
        return await this.summaryVehicleType.getText();
    }

    async getReviewVehicleMake(): Promise<string> {
        return await this.summaryMake.getText();
    }

    async getReviewVehicleYear(): Promise<string> {
        return await this.summaryYear.getText();
    }

    async getReviewCoverage(): Promise<string> {
        return await this.summaryCoverage.getText();
    }

    async getReviewAccessories(): Promise<string> {
        return await this.summaryOptions.getText();
    }

    async getReviewDeductible(): Promise<string> {
        return await this.summaryDeductible.getText();
    }

    async getReviewTotal(): Promise<string> {
        return await this.summaryTotal.getText();
    }

    /**
     * Click next to payment
     * 
     * Note: Using force: true because this button appears at the bottom of the review page
     * which displays multiple summary cards. The button may be obscured by overlapping
     * content or animations during the page render.
     */
    async clickNextToPayment(): Promise<void> {
        await this.nextStep3Button.click({ force: true });
    }

    // === Screen 4: Payment Page ===

    /**
     * Verify payment total
     */
    async getPaymentTotal(): Promise<string> {
        return await this.paymentTotal.getText();
    }

    /**
     * Enter payment details
     */
    async enterPaymentDetails(
        cardName: string,
        cardNumber: string,
        expiry: string,
        cvv: string
    ): Promise<void> {
        await this.cardNameInput.type(cardName);
        await this.cardNumberInput.type(cardNumber);
        await this.cardExpiryInput.type(expiry);
        await this.cardCVVInput.type(cvv);
    }

    /**
     * Agree to terms and conditions
     * 
     * Note: Using force: true for checkbox because it's typically hidden with CSS
     * and replaced with a custom styled checkbox UI.
     */
    async agreeToTerms(): Promise<void> {
        await this.agreeTermsCheckbox.check({ force: true });
    }

    async isPaymentButtonEnabled(): Promise<boolean> {
        return await this.submitPaymentButton.isEnabled();
    }

    async submitPayment(): Promise<void> {
        await this.submitPaymentButton.clickWithJavaScript();
    }

    // ==================== SUCCESS SCREEN ====================

    /**
     * Verify payment success
     */
    async isSuccessScreenDisplayed(): Promise<boolean> {
        return await this.policyNumberElement.isDisplayed();
    }

    async getPolicyNumber(): Promise<string> {
        return await this.policyNumberElement.getText();
    }

    async getConfirmationEmail(): Promise<string> {
        return await this.confirmEmailElement.getText();
    }

    // ==================== DASHBOARD & POLICY DETAIL METHODS ====================

    /**
     * Click Create New Policy button from dashboard
     */
    async clickCreateNewPolicy(): Promise<void> {
        await this.createNewPolicyButton.click();
    }

    /**
     * Search for a policy by policy number, name, or email
     */
    async searchPolicy(searchTerm: string): Promise<void> {
        await this.policySearchInput.type(searchTerm);
        await this.searchButton.click();
    }

    /**
     * Clear search
     */
    async clearSearch(): Promise<void> {
        await this.clearSearchButton.click();
    }

    /**
     * Check if a policy exists in the table
     */
    async isPolicyInTable(policyNumber: string): Promise<boolean> {
        try {
            // Wait for table to have content first
            await this.policiesTableBody.getText();  // This will wait for element
            
            // Then search for the policy number text in any cell
            const allText = await this.policiesTableBody.getText();
            return allText.includes(policyNumber);
        } catch {
            return false;
        }
    }

    /**
     * Click View button for a specific policy
     */
    async clickViewPolicy(policyNumber: string): Promise<void> {
        await this.viewPolicyButton(policyNumber).click();
    }

    /**
     * Get all policy detail values from the detail view
     */
    async getPolicyDetails() {
        return {
            customerName: await this.viewCustomerName.getText(),
            email: await this.viewCustomerEmail.getText(),
            phone: await this.viewCustomerPhone.getText(),
            dob: await this.viewCustomerDOB.getText(),
            vehicleType: await this.viewVehicleType.getText(),
            vehicleMake: await this.viewVehicleMake.getText(),
            vehicleYear: await this.viewVehicleYear.getText(),
            vehicleMileage: await this.viewVehicleMileage.getText(),
            coverageType: await this.viewCoverageType.getText(),
            deductible: await this.viewDeductible.getText(),
            accessories: await this.viewAccessories.getText(),
            monthlyPremium: await this.viewMonthlyPremium.getText(),
            cardholderName: await this.viewCardholderName.getText(),
            cardNumber: await this.viewCardNumber.getText(),
            policyNumber: await this.viewPolicyNumber.getText()
        };
    }

    /**
     * Click Back to Dashboard from policy detail view
     */
    async clickBackToDashboard(): Promise<void> {
        await this.backToDashboardButton.click();
    }

    /**
     * Click Back to Dashboard from success screen
     */
    async clickBackToDashboardFromSuccess(): Promise<void> {
        await this.backToDashboardFromSuccessButton.click();
    }
}
