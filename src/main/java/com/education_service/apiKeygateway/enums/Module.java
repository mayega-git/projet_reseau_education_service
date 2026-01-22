package com.education_service.apiKeygateway.enums;

public enum Module {

    EDUCATION("EDUCATION"),
    REVIEW("REVIEW"),
    NEWSLETTER("NEWSLETTER");

    private  final String  value;

    Module(String value){
        this.value=value;    
    }

    public String getValue(){
        return this.value;
    }
    
}
