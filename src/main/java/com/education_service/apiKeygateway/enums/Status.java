package com.education_service.apiKeygateway.enums;

public enum Status {

    ACTIVE("ACTIVE"),
    INACTIVE("INACTIVE"),
    PENDING("PENDING"),
    AUTHORIZE("AUTHORIZE"),
    REJECTED("REJECTED");

    private final String value;

    Status(String value) {
        this.value = value;
    }

    public String getValue() {
        return this.value;
    }
}
