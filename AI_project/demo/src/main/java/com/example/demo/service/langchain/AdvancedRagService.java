package com.example.demo.service.langchain;

import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.DocumentSplitter;
import dev.langchain4j.data.document.loader.FileSystemDocumentLoader;
import dev.langchain4j.data.document.parser.TextDocumentParser;
import dev.langchain4j.data.document.splitter.DocumentSplitters;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.rag.content.retriever.ContentRetriever;
import dev.langchain4j.rag.content.retriever.EmbeddingStoreContentRetriever;
import dev.langchain4j.service.AiServices;
import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.EmbeddingStoreIngestor;
import dev.langchain4j.store.embedding.inmemory.InMemoryEmbeddingStore;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.List;

/**
 * 工程化 RAG（检索增强生成）示例。
 *
 * <p>与简单示例不同，这里展示了完整的生产级 RAG 流程：</p>
 * <ol>
 *   <li><b>文档加载</b>：从 classpath 的 knowledge 目录读取文本文件；</li>
 *   <li><b>文档切分</b>：使用 {@link DocumentSplitters#recursive(int, int)} 做递归切分，
 *       控制每段长度和重叠长度，避免内容过长或语义断裂；</li>
 *   <li><b>向量化与存储</b>：使用 {@link EmbeddingStoreIngestor} 统一完成
 *       切分 → Embedding → 入库；</li>
 *   <li><b>检索与回答</b>：根据用户问题检索最相关的片段，并拼接进 Prompt 生成答案。</li>
 * </ol>
 *
 * <p>当前使用 {@link InMemoryEmbeddingStore} 便于本地跑通；
 * 生产环境只需把 EmbeddingStore 替换为 PGVector、Milvus、Chroma、Redis 等即可。</p>
 */
@Service
public class AdvancedRagService {

    private static final Logger log = LoggerFactory.getLogger(AdvancedRagService.class);

    private final ChatLanguageModel chatLanguageModel;
    private final EmbeddingModel embeddingModel;

    /**
     * 内存向量库，仅用于 Demo。生产环境可替换为持久化向量库。
     */
    private final EmbeddingStore<TextSegment> embeddingStore = new InMemoryEmbeddingStore<>();

    private CustomerSupportAssistant assistant;

    public AdvancedRagService(ChatLanguageModel chatLanguageModel, EmbeddingModel embeddingModel) {
        this.chatLanguageModel = chatLanguageModel;
        this.embeddingModel = embeddingModel;
    }

    /**
     * 应用启动后执行：加载知识文档、切分、向量化、入库。
     */
    @PostConstruct
    public void init() throws IOException {
        // 1. 从 classpath:knowledge/*.txt 加载文档
        List<Document> documents = loadDocumentsFromClasspath("knowledge/*.txt");
        log.info("[AdvancedRag] 成功加载 {} 篇知识文档", documents.size());

        // 2. 定义文档切分策略：每段最多 300 token，相邻段重叠 30 token
        //    这样可以保证上下文连贯，同时避免单段过长导致检索不精准
        DocumentSplitter splitter = DocumentSplitters.recursive(300, 30);

        // 3. 构建 EmbeddingStoreIngestor：统一完成 切分 -> Embedding -> 存储
        EmbeddingStoreIngestor ingestor = EmbeddingStoreIngestor.builder()
                .documentSplitter(splitter)
                .embeddingModel(embeddingModel)
                .embeddingStore(embeddingStore)
                .build();

        // 4. 执行摄入
        ingestor.ingest(documents);
        log.info("[AdvancedRag] 知识文档已切分并向量化入库");

        // 5. 构建检索器：根据问题检索最相关的 3 个片段
        ContentRetriever contentRetriever = EmbeddingStoreContentRetriever.builder()
                .embeddingStore(embeddingStore)
                .embeddingModel(embeddingModel)
                .maxResults(3)
                // minScore 可以过滤掉低相关度结果，0 ~ 1 之间，越大越严格
                // .minScore(0.7)
                .build();

        // 6. 组装 RAG 助手
        assistant = AiServices.builder(CustomerSupportAssistant.class)
                .chatLanguageModel(chatLanguageModel)
                .contentRetriever(contentRetriever)
                .build();
    }

    /**
     * 基于私有知识库回答用户问题。
     */
    public String ask(String question) {
        return assistant.answer(question);
    }

    /**
     * 从 classpath 指定路径加载文本文件为 Document。
     *
     * @param pattern 资源匹配模式，例如 "knowledge/*.txt"
     * @return 文档列表
     */
    private List<Document> loadDocumentsFromClasspath(String pattern) throws IOException {
        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        Resource[] resources = resolver.getResources("classpath:" + pattern);

        return Arrays.stream(resources)
                .map(resource -> {
                    try {
                        // 把资源复制到临时文件，再用 FileSystemDocumentLoader 加载
                        Path tempFile = java.nio.file.Files.createTempFile("knowledge-", ".txt");
                        java.nio.file.Files.copy(resource.getInputStream(), tempFile,
                                java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                        return FileSystemDocumentLoader.loadDocument(tempFile, new TextDocumentParser());
                    } catch (IOException e) {
                        throw new RuntimeException("加载知识文档失败: " + resource.getFilename(), e);
                    }
                })
                .toList();
    }

    /**
     * AI 客服助手接口。
     */
    public interface CustomerSupportAssistant {

        @SystemMessage("你是一位专业的公司客服助手。请严格根据下面提供的参考资料回答用户问题，"
                + "如果资料中没有相关信息，请直接回答‘根据现有资料无法回答’，不要编造。")
        String answer(String question);
    }
}
