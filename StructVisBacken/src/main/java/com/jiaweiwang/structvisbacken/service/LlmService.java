package com.jiaweiwang.structvisbacken.service;

import com.jiaweiwang.structvisbacken.dto.ChatRequest;
import com.jiaweiwang.structvisbacken.dto.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
@Slf4j
public class LlmService {

    @Autowired
    ConsultantService consultantService;

    public Flux<String> chat(ChatRequest chatRequest) {
        log.info(chatRequest.toString());
        return consultantService.chat(chatRequest.toString());
    }
}