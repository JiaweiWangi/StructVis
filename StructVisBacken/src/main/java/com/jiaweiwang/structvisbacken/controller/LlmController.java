package com.jiaweiwang.structvisbacken.controller;

import com.jiaweiwang.structvisbacken.dto.ChatRequest;
import com.jiaweiwang.structvisbacken.dto.Result;
import com.jiaweiwang.structvisbacken.service.LlmService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/llm")
public class LlmController {

    @Autowired
    private LlmService llmService;

    @PostMapping("/chat")
    public Flux<String> chat(@RequestBody ChatRequest chatRequest) {
        return llmService.chat(chatRequest);
    }

}
