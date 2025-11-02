package com.automation.tests;

import com.automation.base.BaseTest;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.annotations.Test;
import java.time.Duration;

/**
 * Debug test to check what's actually on the page
 */
public class DebugTest extends BaseTest {
    
    @Test
    public void debugProductsPage() {
        // First, set user as logged in
        setLoggedInUser("testuser");
        
        // Navigate to products page
        driver.get("http://localhost:8080/products.html");
        
        // Wait for page to load using WebDriverWait
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.titleContains("Products"));
        
        // Print page source and current URL
        System.out.println("=== CURRENT URL ===");
        System.out.println(driver.getCurrentUrl());
        
        System.out.println("=== PAGE TITLE ===");
        System.out.println(driver.getTitle());
        
        // Try to find elements by different selectors
        System.out.println("=== LOOKING FOR ELEMENTS ===");
        try {
            var element = driver.findElement(org.openqa.selenium.By.id("page-title"));
            System.out.println("Found element with id='page-title': " + element.getText());
        } catch (Exception e) {
            System.out.println("Could not find element with id='page-title': " + e.getMessage());
        }
        
        try {
            var element = driver.findElement(org.openqa.selenium.By.tagName("h1"));
            System.out.println("Found h1 element: " + element.getText());
        } catch (Exception e) {
            System.out.println("Could not find h1 element: " + e.getMessage());
        }
    }
}