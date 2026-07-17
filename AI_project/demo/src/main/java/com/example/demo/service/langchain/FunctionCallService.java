package com.example.demo.service.langchain;

import com.example.demo.service.langchain.tool.WeatherTool;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.service.AiServices;
import dev.langchain4j.service.SystemMessage;
import org.springframework.stereotype.Service;

/**
 * Function Call（函数调用）示例。
 *
 * <p>通过 {@link AiServices} 把 {@link ChatLanguageModel} 和工具（Tool）组装起来，
 * 大模型会根据用户输入判断是否需要调用工具，并自动把工具返回值再喂给模型，
 * 最终生成自然语言回答。</p>
 */
@Service
public class FunctionCallService {

    private final WeatherAssistant weatherAssistant;

    public FunctionCallService(ChatLanguageModel chatLanguageModel, WeatherTool weatherTool) {
        // 把模型和天气工具绑定在一起，生成一个 WeatherAssistant 代理实现
        this.weatherAssistant = AiServices.builder(WeatherAssistant.class)
                .chatLanguageModel(chatLanguageModel)
                .tools(weatherTool)
                .build();
    }

    /**
     * 询问与天气相关的问题，模型会自动调用天气工具。
     *
     * @param question 用户问题，例如 "上海今天天气怎么样？"
     * @return 模型结合工具返回信息后生成的回答
     */
    public String ask(String question) {
        return weatherAssistant.chat(question);
    }

    /**
     * AI 助手接口定义。
     *
     * <p>{@link SystemMessage} 用来设置系统提示，告诉模型它的角色和能力。</p>
     */
    public interface WeatherAssistant {

        @SystemMessage("你是一个贴心的天气助手。当用户询问天气时，你必须调用 queryWeather 工具获取实时天气，"
                + "然后用自然语言友好地回答。如果用户没有指定城市，请礼貌地询问。")
        String chat(String userMessage);
    }
}
