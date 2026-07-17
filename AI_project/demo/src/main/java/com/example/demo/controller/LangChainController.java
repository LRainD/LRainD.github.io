package com.example.demo.controller;

import com.example.demo.common.Result;
import com.example.demo.service.langchain.*;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * LangChain4j 示例接口。
 *
 * <p>本 Controller 把多个 LangChain4j 示例能力暴露为 HTTP 接口，
 * 方便通过 Postman、cURL 或前端页面直接体验。</p>
 */
@RestController
@RequestMapping("/api/langchain")
public class LangChainController {

    private final SimpleChatService simpleChatService;
    private final PromptTemplateService promptTemplateService;
    private final ChatMemoryService chatMemoryService;
    private final RagService ragService;
    private final FunctionCallService functionCallService;
    private final AdvancedRagService advancedRagService;

    public LangChainController(SimpleChatService simpleChatService,
                               PromptTemplateService promptTemplateService,
                               ChatMemoryService chatMemoryService,
                               RagService ragService,
                               FunctionCallService functionCallService,
                               AdvancedRagService advancedRagService) {
        this.simpleChatService = simpleChatService;
        this.promptTemplateService = promptTemplateService;
        this.chatMemoryService = chatMemoryService;
        this.ragService = ragService;
        this.functionCallService = functionCallService;
        this.advancedRagService = advancedRagService;
    }

    /**
     * 1. 简单对话：把用户输入直接发送给大模型。
     *
     * 请求示例：
     * POST /api/langchain/chat
     * {"message":"请用一句话介绍 Spring Boot"}
     */
    @PostMapping("/chat")
    public Result<String> chat(@RequestBody Map<String, String> body) {
        String message = body.get("message");
        return Result.success(simpleChatService.chat(message));
    }

    /**
     * 2. Prompt 模板：让模型扮演 Java 讲师解释某个概念。
     *
     * 请求示例：
     * POST /api/langchain/prompt
     * {"topic":"Lambda 表达式"}
     */
    @PostMapping("/prompt")
    public Result<String> prompt(@RequestBody Map<String, String> body) {
        String topic = body.get("topic");
        return Result.success(promptTemplateService.explainJavaTopic(topic));
    }

    /**
     * 3. 文本摘要：按指定字数概括内容。
     *
     * 请求示例：
     * POST /api/langchain/summarize
     * {"content":"这里是长文本...","maxWords":50}
     */
    @PostMapping("/summarize")
    public Result<String> summarize(@RequestBody Map<String, Object> body) {
        String content = (String) body.get("content");
        int maxWords = (int) body.getOrDefault("maxWords", 50);
        return Result.success(promptTemplateService.summarize(content, maxWords));
    }

    /**
     * 4. 带记忆的对话：同一个 sessionId 的多轮对话会保留上下文。
     *
     * 请求示例：
     * POST /api/langchain/chat-memory
     * {"sessionId":"user-001","message":"我叫张三"}
     * 继续问：
     * {"sessionId":"user-001","message":"我刚才叫什么名字？"}
     */
    @PostMapping("/chat-memory")
    public Result<String> chatWithMemory(@RequestBody Map<String, String> body) {
        String sessionId = body.get("sessionId");
        String message = body.get("message");
        return Result.success(chatMemoryService.chat(sessionId, message));
    }

    /**
     * 清空指定会话的记忆。
     *
     * 请求示例：
     * POST /api/langchain/chat-memory/clear?sessionId=user-001
     */
    @PostMapping("/chat-memory/clear")
    public Result<String> clearMemory(@RequestParam String sessionId) {
        chatMemoryService.clear(sessionId);
        return Result.success("已清空会话记忆：" + sessionId);
    }

    /**
     * 5. RAG 问答：基于项目内置的私有知识库回答问题。
     *
     * 请求示例：
     * POST /api/langchain/rag
     * {"question":"小明的员工编号是多少？"}
     */
    @PostMapping("/rag")
    public Result<String> rag(@RequestBody Map<String, String> body) {
        String question = body.get("question");
        return Result.success(ragService.ask(question));
    }

    /**
     * 6. Function Call：模型自动调用天气工具回答问题。
     *
     * 请求示例：
     * POST /api/langchain/function-call
     * {"question":"上海今天天气怎么样？"}
     */
    @PostMapping("/function-call")
    public Result<String> functionCall(@RequestBody Map<String, String> body) {
        String question = body.get("question");
        return Result.success(functionCallService.ask(question));
    }

    /**
     * 7. 工程化 RAG：加载 classpath 知识文档、切分、向量化后回答。
     *
     * 请求示例：
     * POST /api/langchain/rag-advanced
     * {"question":"如何申请产品试用？"}
     */
    @PostMapping("/rag-advanced")
    public Result<String> ragAdvanced(@RequestBody Map<String, String> body) {
        String question = body.get("question");
        return Result.success(advancedRagService.ask(question));
    }
}
