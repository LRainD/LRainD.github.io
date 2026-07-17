package com.example.demo.service.langchain;

import dev.langchain4j.model.chat.ChatLanguageModel;
import org.springframework.stereotype.Service;

/**
 * 简单对话示例。
 *
 * <p>LangChain4j 会自动读取 application.properties 中的 OpenAI 配置，
 * 并注入一个 {@link ChatLanguageModel} 实例。我们只需要调用
 * {@link ChatLanguageModel#generate(String)} 即可与 LLM 交互。</p>
 */
@Service
public class SimpleChatService {

    /**
     * 注入由 LangChain4j Spring Boot Starter 自动装配的聊天模型。
     * 底层实现由 langchain4j-open-ai-spring-boot-starter 提供。
     */
    private final ChatLanguageModel chatLanguageModel;

    public SimpleChatService(ChatLanguageModel chatLanguageModel) {
        this.chatLanguageModel = chatLanguageModel;
    }

    /**
     * 向大模型发送一条用户消息，并返回模型回复。
     *
     * @param userMessage 用户输入的文本
     * @return 大模型生成的回复文本
     */
    public String chat(String userMessage) {
        return chatLanguageModel.generate(userMessage);
    }
}
