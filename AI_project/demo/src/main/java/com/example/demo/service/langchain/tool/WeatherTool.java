package com.example.demo.service.langchain.tool;

import dev.langchain4j.agent.tool.Tool;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * Function Call（工具）示例：模拟天气查询工具。
 *
 * <p>在 LangChain4j 中，只要给 Spring Bean 的方法加上 {@link Tool} 注解，
 * 再通过 AiServices 把该 Bean 注册为 tools，大模型就会在需要时自动调用它。</p>
 *
 * <p>实际生产中可以替换为真实的气象 API，例如和风天气、OpenWeatherMap 等。</p>
 */
@Component
public class WeatherTool {

    /**
     * 模拟城市天气数据库。
     */
    private static final Map<String, String> MOCK_WEATHER = new HashMap<>();

    static {
        MOCK_WEATHER.put("上海", "多云，25°C，东南风 2 级");
        MOCK_WEATHER.put("北京", "晴，30°C，北风 3 级");
        MOCK_WEATHER.put("深圳", "雷阵雨，28°C，南风 2 级");
        MOCK_WEATHER.put("杭州", "小雨，22°C，东风 2 级");
    }

    /**
     * 查询指定城市的天气。
     *
     * <p>@Tool 注解会让 LangChain4j 自动提取方法签名生成 JSON Schema，
     * 并告诉大模型：当你需要天气信息时，可以调用这个方法。</p>
     *
     * @param city 城市名称，例如 "上海"
     * @return 该城市的天气描述
     */
    @Tool("查询指定城市的实时天气")
    public String queryWeather(String city) {
        // 模拟远程 API 调用
        return MOCK_WEATHER.getOrDefault(city, "暂时无法获取 " + city + " 的天气，请稍后再试。");
    }
}
