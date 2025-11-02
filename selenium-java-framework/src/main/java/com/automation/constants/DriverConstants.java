package com.automation.constants;

/**
 * Constants for WebDriver options and browser configurations
 */
public final class DriverConstants {
    
    // Chrome options
    public static final String NO_SANDBOX = "--no-sandbox";
    public static final String DISABLE_DEV_SHM_USAGE = "--disable-dev-shm-usage";
    public static final String HEADLESS = "--headless";
    public static final String DISABLE_GPU = "--disable-gpu";
    public static final String WINDOW_SIZE = "--window-size=1920,1080";
    public static final String DISABLE_EXTENSIONS = "--disable-extensions";
    
    // Page names
    public static final String LOGIN_PAGE = "Login Page";
    public static final String HOME_PAGE = "Home Page";
    public static final String PRODUCTS_PAGE = "Products Page";
    public static final String CONTACT_PAGE = "Contact Page";
    
    // Wait operations
    public static final String VISIBILITY = "visibility";
    public static final String CLICKABILITY = "clickability";
    public static final String PRESENCE = "presence";
    public static final String INVISIBILITY = "invisibility";
    public static final String WAIT_FOR_VISIBILITY = "wait for visibility";
    public static final String WAIT_FOR_CLICKABILITY = "wait for clickability";
    public static final String WAIT_FOR_PRESENCE = "wait for presence";
    
    // Actions
    public static final String CLICK_WITH_RETRY = "click with retry";
    public static final String SUBMIT_FORM = "submit form";
    public static final String DOUBLE_CLICK = "double click";
    public static final String RIGHT_CLICK = "right click";
    public static final String OPEN_IN_NEW_TAB = "open in new tab";
    
    // Checkbox actions
    public static final String CHECK = "check";
    public static final String UNCHECK = "uncheck";
    public static final String TOGGLE = "toggle";
    
    // TextBox actions
    public static final String CLEAR_TEXT = "clear text";
    public static final String PRESS_ENTER = "press Enter";
    public static final String PRESS_TAB = "press Tab";
    public static final String SELECT_ALL_TEXT = "select all text";
    
    // Dropdown actions
    public static final String DESELECT_ALL = "deselect all";
    
    private DriverConstants() {
        // Utility class - prevent instantiation
    }
}