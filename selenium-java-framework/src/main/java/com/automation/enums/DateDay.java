package com.automation.enums;

/**
 * DateDay - enum for day-related operations in date handling
 * 
 * This enum provides standardized day values for:
 * - Date picker interactions
 * - Calendar operations
 * - Test data generation
 * - Date validation
 */
public enum DateDay {
    MONDAY("Monday", "Mon", 1),
    TUESDAY("Tuesday", "Tue", 2),
    WEDNESDAY("Wednesday", "Wed", 3),
    THURSDAY("Thursday", "Thu", 4),
    FRIDAY("Friday", "Fri", 5),
    SATURDAY("Saturday", "Sat", 6),
    SUNDAY("Sunday", "Sun", 7);

    private final String fullName;
    private final String shortName;
    private final int dayNumber;

    DateDay(String fullName, String shortName, int dayNumber) {
        this.fullName = fullName;
        this.shortName = shortName;
        this.dayNumber = dayNumber;
    }

    /**
     * Gets the full day name
     * @return full day name (e.g., "Monday")
     */
    public String getFullName() {
        return fullName;
    }

    /**
     * Gets the short day name
     * @return short day name (e.g., "Mon")
     */
    public String getShortName() {
        return shortName;
    }

    /**
     * Gets the day number (1-7, Monday = 1)
     * @return day number
     */
    public int getDayNumber() {
        return dayNumber;
    }

    /**
     * Gets DateDay by day number
     * @param dayNumber the day number (1-7)
     * @return corresponding DateDay
     * @throws IllegalArgumentException if day number is invalid
     */
    public static DateDay fromDayNumber(int dayNumber) {
        for (DateDay day : values()) {
            if (day.dayNumber == dayNumber) {
                return day;
            }
        }
        throw new IllegalArgumentException("Invalid day number: " + dayNumber + ". Must be 1-7.");
    }

    /**
     * Gets DateDay by full name (case-insensitive)
     * @param fullName the full day name
     * @return corresponding DateDay
     * @throws IllegalArgumentException if day name is invalid
     */
    public static DateDay fromFullName(String fullName) {
        for (DateDay day : values()) {
            if (day.fullName.equalsIgnoreCase(fullName)) {
                return day;
            }
        }
        throw new IllegalArgumentException("Invalid day name: " + fullName);
    }

    /**
     * Gets DateDay by short name (case-insensitive)
     * @param shortName the short day name
     * @return corresponding DateDay
     * @throws IllegalArgumentException if day name is invalid
     */
    public static DateDay fromShortName(String shortName) {
        for (DateDay day : values()) {
            if (day.shortName.equalsIgnoreCase(shortName)) {
                return day;
            }
        }
        throw new IllegalArgumentException("Invalid short day name: " + shortName);
    }

    @Override
    public String toString() {
        return fullName;
    }
}