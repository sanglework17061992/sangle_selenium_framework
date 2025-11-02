package com.automation.enums;

/**
 * Action - central enum for element/action names used in logging and retries
 * 
 * This enum provides standardized action names for:
 * - Logging purposes in test reports
 * - Retry mechanism identification
 * - Error message standardization
 * - Test step documentation
 */
public enum Action {
    // Basic element interactions
    CLICK("click"),
    DOUBLE_CLICK("double click"),
    RIGHT_CLICK("right click"),
    HOVER("hover"),
    
    // Element retrieval and validation
    GET_ELEMENT("get element"),
    CHECK_IF_DISPLAYED("check if displayed"),
    CHECK_IF_ENABLED("check if enabled"),
    CHECK_IF_PRESENT("check if present"),
    
    // Text and attribute operations
    GET_TEXT("get text"),
    GET_ATTRIBUTE("get attribute"),
    GET_CSS_PROPERTY("get CSS property"),
    TYPE("type"),
    CLEAR("clear"),
    CLEAR_AND_TYPE("clear and type"),
    
    // Visual operations
    SCROLL_INTO_VIEW("scroll into view"),
    HIGHLIGHT("highlight"),
    TAKE_SCREENSHOT("take screenshot"),
    
    // Select/dropdown operations
    SELECT("select"),
    SELECT_BY_INDEX("select by index"),
    SELECT_BY_VALUE("select by value"),
    SELECT_BY_TEXT("select by text"),
    CHECK_IF_SELECTED("check if selected"),
    GET_SELECTED_VALUE("get selected value"),
    GET_SELECTED_TEXT("get selected text"),
    GET_SELECTED_VALUE_FROM_GROUP("get selected value from group"),
    
    // Form operations
    GET_VALUE("get value"),
    SET_VALUE("set value"),
    SUBMIT("submit"),
    
    // Radio button and checkbox operations
    GET_GROUP_NAME("get group name"),
    IS_REQUIRED("is required"),
    CHECK("check"),
    UNCHECK("uncheck"),
    
    // Navigation operations
    NAVIGATE_TO("navigate to"),
    REFRESH("refresh"),
    GO_BACK("go back"),
    GO_FORWARD("go forward"),
    
    // Wait operations
    WAIT_FOR_VISIBILITY("wait for visibility"),
    WAIT_FOR_CLICKABILITY("wait for clickability"),
    WAIT_FOR_PRESENCE("wait for presence"),
    WAIT_FOR_INVISIBILITY("wait for invisibility");

    private final String label;

    Action(String label) {
        this.label = label;
    }

    /**
     * Returns the human-readable label for the action
     * @return action label for logging and reporting
     */
    @Override
    public String toString() {
        return label;
    }

    /**
     * Gets the action label
     * @return the label string
     */
    public String getLabel() {
        return label;
    }
}