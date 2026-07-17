package com.example.demo.service.langchain.hook;

import dev.langchain4j.data.message.*;
import dev.langchain4j.model.chat.listener.ChatModelErrorContext;
import dev.langchain4j.model.chat.listener.ChatModelListener;
import dev.langchain4j.model.chat.listener.ChatModelRequestContext;
import dev.langchain4j.model.chat.listener.ChatModelResponseContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * ChatModelListener Hook 示例：监听大模型请求的完整生命周期。
 *
 * <p>LangChain4j 会在调用大模型前后自动触发该 Listener。常见用途包括：</p>
 * <ul>
 *   <li>记录请求/响应日志，用于问题排查；</li>
 *   <li>统计 Token 消耗、计算调用成本；</li>
 *   <li>对请求参数做统一修改（如追加系统提示）；</li>
 *   <li>在异常时做熔断、重试或告警。</li>
 * </ul>
 *
 * <p>只要把它声明为 Spring Bean，LangChain4j Spring Boot Starter 就会自动注册。</p>
 */
@Component
public class LoggingChatModelListener implements ChatModelListener {

    private static final Logger log = LoggerFactory.getLogger(LoggingChatModelListener.class);

    /**
     * 请求发送前触发。
     *
     * @param requestContext 包含模型名称、温度、消息列表等请求信息
     */
    @Override
    public void onRequest(ChatModelRequestContext requestContext) {
        log.info("[ChatModelListener] 准备调用模型：{}，温度：{}，消息数：{}",
                requestContext.request().model(),
                requestContext.request().temperature(),
                requestContext.request().messages().size());

        // 可以在这里打印完整消息内容，方便调试
        for (ChatMessage message : requestContext.request().messages()) {
            log.info("[ChatModelListener] 消息 [{}]: {}", message.type(), extractText(message));
        }
    }

    /**
     * 根据消息具体类型提取文本内容。
     * ChatMessage 接口的 text() 方法已标记为过时，因此需要按具体子类处理。
     */
    private String extractText(ChatMessage message) {
        if (message instanceof UserMessage) {
            return ((UserMessage) message).singleText();
        } else if (message instanceof AiMessage) {
            return ((AiMessage) message).text();
        } else if (message instanceof SystemMessage) {
            return ((SystemMessage) message).text();
        } else if (message instanceof ToolExecutionResultMessage) {
            return ((ToolExecutionResultMessage) message).text();
        }
        return message.toString();
    }

    /**
     * 模型返回响应后触发。
     *
     * @param responseContext 包含模型生成的回复、Token 使用量等
     */
    @Override
    public void onResponse(ChatModelResponseContext responseContext) {
        log.info("[ChatModelListener] 模型响应完成，回复内容：{}",
                responseContext.response().aiMessage().text());

        // tokenUsage() 可能为 null，取决于模型提供商是否返回用量信息
        if (responseContext.response().tokenUsage() != null) {
            log.info("[ChatModelListener] Token 使用量：input={}, output={}",
                    responseContext.response().tokenUsage().inputTokenCount(),
                    responseContext.response().tokenUsage().outputTokenCount());
        }
    }

    /**
     * 调用过程中发生异常时触发。
     *
     * @param errorContext 包含异常对象和原始请求信息
     */
    @Override
    public void onError(ChatModelErrorContext errorContext) {
        log.error("[ChatModelListener] 模型调用异常：{}", errorContext.error().getMessage(), errorContext.error());
    }
}
