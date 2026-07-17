package com.example.demo.service.langchain;

import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.memory.ChatMemory;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.model.chat.ChatLanguageModel;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 对话记忆（ChatMemory）示例。
 *
 * <p>默认情况下，每次调用 {@link ChatLanguageModel#generate(String)} 都是独立的，
 * 模型不会记得上一轮说了什么。为了让模型具备“上下文记忆”，
 * 需要把历史消息保存到 {@link ChatMemory} 中，并在每次请求时一起发送。</p>
 */
@Service
public class ChatMemoryService {

    private final ChatLanguageModel chatLanguageModel;

    /**
     * 用 ConcurrentHashMap 模拟按会话 ID 隔离的内存存储。
     * 生产环境可以替换为 Redis、数据库等外部存储。
     */
    private final Map<String, ChatMemory> memoryStore = new ConcurrentHashMap<>();

    public ChatMemoryService(ChatLanguageModel chatLanguageModel) {
        this.chatLanguageModel = chatLanguageModel;
    }

    /**
     * 在指定会话中发送一条消息，并把模型回复也加入记忆。
     *
     * @param sessionId  会话唯一标识，例如用户 ID 或前端生成的 UUID
     * @param userMessage 用户当前输入
     * @return 模型回复
     */
    public String chat(String sessionId, String userMessage) {
        // 每个 session 维护自己的消息窗口，最多保留最近 10 条消息
        ChatMemory chatMemory = memoryStore.computeIfAbsent(
                sessionId,
                id -> MessageWindowChatMemory.withMaxMessages(10)
        );

        // 1. 把用户消息加入记忆
        chatMemory.add(new UserMessage(userMessage));

        // 2. 把包含历史记录的完整上下文发给模型
        AiMessage aiMessage = chatLanguageModel.generate(chatMemory.messages()).content();

        // 3. 把模型回复也加入记忆，供下一轮使用
        chatMemory.add(aiMessage);

        return aiMessage.text();
    }

    /**
     * 清空某个会话的记忆。
     *
     * @param sessionId 会话 ID
     */
    public void clear(String sessionId) {
        memoryStore.remove(sessionId);
    }
}
