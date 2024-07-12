package de.sky.meal.ordering.mealordering.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.jooq.JooqAutoConfiguration;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class JooqConfig {
    private final org.jooq.Configuration config;

    @PostConstruct
    public void init() {
        log.info("Refined settings coming from {}", JooqAutoConfiguration.class.getName());

        config.settings()
                .withRenderSchema(false);
    }
}
