package com.automation.utils;

/**
 * Action - central enum for element/action names used in logging and retries
 */
public enum Action {
    CLICK("click"),
    GET_ELEMENT("get element"),
    CHECK_IF_DISPLAYED("check if displayed"),
    CHECK_IF_ENABLED("check if enabled"),
    GET_TEXT("get text"),
    GET_ATTRIBUTE("get attribute"),
    GET_CSS_PROPERTY("get CSS property"),
    SCROLL_INTO_VIEW("scroll into view"),
    HIGHLIGHT("highlight"),

    SELECT("select"),
    CHECK_IF_SELECTED("check if selected"),
    SELECT_BY_VALUE("select by value"),
    GET_SELECTED_VALUE_FROM_GROUP("get selected value from group"),
    GET_VALUE("get value"),
    GET_GROUP_NAME("get group name"),
    IS_REQUIRED("is required");

    private final String label;

    Action(String label) { this.label = label; }

    @Override
    public String toString() { return label; }
}
