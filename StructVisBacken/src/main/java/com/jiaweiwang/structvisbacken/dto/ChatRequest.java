package com.jiaweiwang.structvisbacken.dto;

import lombok.Data;

import java.util.List;

@Data
public class ChatRequest {
    private List<Object> messages;
    private String prompt;
    private String contextType;
}
