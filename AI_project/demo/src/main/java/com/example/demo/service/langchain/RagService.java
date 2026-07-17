package com.example.demo.service.langchain;

import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.rag.content.retriever.ContentRetriever;
import dev.langchain4j.rag.content.retriever.EmbeddingStoreContentRetriever;
import dev.langchain4j.service.AiServices;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.inmemory.InMemoryEmbeddingStore;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;

import java.util.List;

/**
 * RAG（Retrieval-Augmented Generation，检索增强生成）示例。
 *
 * <p>RAG 的核心思想：先在外部知识库中检索与用户问题最相关的片段，
 * 再把片段作为上下文拼接进 Prompt，让大模型基于这些上下文回答。
 * 这样可以有效减少模型“胡说八道”的问题。</p>
 */
@Service
public class RagService {

    private final ChatLanguageModel chatLanguageModel;
    private final EmbeddingModel embeddingModel;

    /**
     * 内存向量存储，仅用于 Demo。生产环境可以换成 PGVector、Redis、Milvus 等。
     */
    private final EmbeddingStore<TextSegment> embeddingStore = new InMemoryEmbeddingStore<>();

    /**
     * 带有 RAG 能力的 AI 助手代理，由 LangChain4j 在运行时自动生成实现。
     */
    private Assistant assistant;

    public RagService(ChatLanguageModel chatLanguageModel, EmbeddingModel embeddingModel) {
        this.chatLanguageModel = chatLanguageModel;
        this.embeddingModel = embeddingModel;
    }

    /**
     * 应用启动后，先把“知识文档”向量化并存入向量库。
     */
    @PostConstruct
    public void init() {
        // 1. 准备私有知识文档
        List<Document> documents = List.of(
                Document.from("小明的员工编号是 E1001，所属部门是技术研发部，擅长 Java 和 Spring Boot。"),
                Document.from("公司的年假政策：入职满 1 年享有 5 天年假，每多 1 年增加 1 天，上限 15 天。"),
                Document.from("公司办公地址在上海市浦东新区张江高科技园区，工作日时间为 9:30 - 18:30。")
        );

        // 2. 把文档切分成片段并生成 Embedding，存入内存向量库
        for (Document document : documents) {
            // 这里简单按整篇文档作为一个片段；实际中建议按段落或固定长度切分
            TextSegment segment = document.toTextSegment();
            embeddingStore.add(embeddingModel.embed(segment).content(), segment);
        }

        // 3. 构建 ContentRetriever：根据用户问题检索最相关的 1 个片段
        ContentRetriever contentRetriever = EmbeddingStoreContentRetriever.builder()
                .embeddingStore(embeddingStore)
                .embeddingModel(embeddingModel)
                .maxResults(1)
                .build();

        // 4. 用 AiServices 把大模型和检索器组装成一个具备 RAG 能力的助手
        assistant = AiServices.builder(Assistant.class)
                .chatLanguageModel(chatLanguageModel)
                .contentRetriever(contentRetriever)
                .build();
    }

    /**
     * 基于私有知识库回答问题。
     *
     * @param question 用户问题
     * @return 模型结合检索结果生成的答案
     */
    public String ask(String question) {
        return assistant.answer(question);
    }

    /**
     * AI 助手接口定义。
     * LangChain4j 会自动实现该接口，并在调用时自动完成检索和拼接上下文。
     */
    public interface Assistant {
        String answer(String question);
    }
}
