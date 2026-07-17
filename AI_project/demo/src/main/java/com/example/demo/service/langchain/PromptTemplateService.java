package com.example.demo.service.langchain;

import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.input.Prompt;
import dev.langchain4j.model.input.PromptTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Prompt 模板示例。
 *
 * <p>在实际业务中，我们通常不会把用户输入直接发给模型，
 * 而是使用 PromptTemplate 预定义好“系统提示 + 用户输入插槽”，
 * 从而引导模型按指定格式、语气或角色进行回答。</p>
 */
@Service
public class PromptTemplateService {

    private final ChatLanguageModel chatLanguageModel;

    public PromptTemplateService(ChatLanguageModel chatLanguageModel) {
        this.chatLanguageModel = chatLanguageModel;
    }

    /**
     * 使用 PromptTemplate 把用户输入填充到预定义模板中，再交给模型生成。
     *
     * @param topic 用户想了解的 Java 主题，例如 "Lambda 表达式"
     * @return 模型按照模板要求生成的解释文本
     */
    public String explainJavaTopic(String topic) {
        // 定义一个模板，{{topic}} 是占位符，LangChain4j 会在运行时替换
        PromptTemplate promptTemplate = PromptTemplate.from("""
                你是一位资深的 Java 讲师，擅长用通俗易懂的语言给初学者讲解概念。
                请用中文解释下面的 Java 概念，要求：
                1. 先给出一句通俗的比喻；
                2. 再给出正式定义；
                3. 最后给出一个简单的代码示例。

                概念：{{topic}}
                """);

        // 用实际值填充模板变量
        Prompt prompt = promptTemplate.apply(Map.of("topic", topic));

        // 将 Prompt 对象发给模型
        return chatLanguageModel.generate(prompt.text());
    }

    /**
     * 另一种更工程化的做法：定义 AI 接口，LangChain4j 会自动实现它。
     * 这种方式适合把 Prompt 模板和 Java 方法签名绑定在一起。
     */
    public String summarize(String content, int maxWords) {
        PromptTemplate promptTemplate = PromptTemplate.from("""
                请用不超过 {{maxWords}} 个字概括下面这段内容，要求保留核心信息：

                {{content}}
                """);
        Prompt prompt = promptTemplate.apply(Map.of(
                "content", content,
                "maxWords", String.valueOf(maxWords)
        ));
        return chatLanguageModel.generate(prompt.text());
    }
}
