package de.sky.meal.ordering.mealordering.config;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Tags;
import io.micrometer.core.instrument.Timer;
import io.micrometer.core.instrument.binder.db.PostgreSQLDatabaseMetrics;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.ConnectionProvider;
import org.jooq.DSLContext;
import org.jooq.ExecuteContext;
import org.jooq.ExecuteListener;
import org.jooq.ExecuteListenerProvider;
import org.jooq.TransactionProvider;
import org.jooq.impl.DefaultConfiguration;
import org.jooq.impl.DefaultDSLContext;
import org.jooq.impl.DefaultExecuteListenerProvider;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.autoconfigure.jooq.DefaultConfigurationCustomizer;
import org.springframework.boot.autoconfigure.jooq.JooqAutoConfiguration;
import org.springframework.boot.autoconfigure.jooq.JooqProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Configuration
@RequiredArgsConstructor
@Slf4j
@EnableConfigurationProperties(JooqProperties.class)
public class JooqConfig {
    private final MeterRegistry meterRegistry;
    private final DataSource dataSource;

    @PostConstruct
    public void init() {
        log.info("Refined settings coming from {}", JooqAutoConfiguration.class.getName());

        var metrics = new PostgreSQLDatabaseMetrics(dataSource, "database.datasource", Tags.of("database", "datasource"));
        metrics.bindTo(meterRegistry);
    }

    @Bean
    public DefaultConfiguration jooqConfiguration(ConnectionProvider connectionProvider,
                                                  JooqProperties properties,
                                                  TransactionProvider transactionProvider,
                                                  ObjectProvider<ExecuteListenerProvider> executeListenerProviders,
                                                  ObjectProvider<DefaultConfigurationCustomizer> configurationCustomizers) {
        var config = new DefaultConfiguration();
        config.set(properties.determineSqlDialect(dataSource));
        config.set(connectionProvider);
        config.set(transactionProvider);

        config.set(executeListenerProviders.orderedStream().toArray(ExecuteListenerProvider[]::new));
        configurationCustomizers.orderedStream().forEach((customizer) -> customizer.customize(config));

        config.settings().withRenderSchema(false);

        return config;
    }

    @Bean
    public DSLContext dslContext(DefaultConfiguration config) {
        return new DefaultDSLContext(config);
    }

    @Bean
    public ExecuteListenerProvider metricsExecuteListener() {
        return new DefaultExecuteListenerProvider(new ExecuteListener() {
            private static final String TIMER_OVERALL = "overall.timer";
            private static final String TIMER_EXECUTE = "overall.timer";

            @Override
            public void executeStart(ExecuteContext ctx) {
                ctx.data(TIMER_EXECUTE, Timer.start(meterRegistry));
            }

            @Override
            public void executeEnd(ExecuteContext ctx) {
                if (!(ctx.data(TIMER_EXECUTE) instanceof Timer.Sample timer))
                    return;

                var query = getQuery(ctx);

                timer.stop(meterRegistry.timer("database.jooq.query.execution", Tags.of(
                        "type", ctx.type().name(),
                        "query", query
                )));
            }

            @Override
            public void start(ExecuteContext ctx) {
                ctx.data(TIMER_OVERALL, Timer.start(meterRegistry));
            }

            @Override
            public void end(ExecuteContext ctx) {
                if (!(ctx.data(TIMER_OVERALL) instanceof Timer.Sample timer))
                    return;

                var query = getQuery(ctx);

                timer.stop(meterRegistry.timer("database.jooq.query", Tags.of(
                        "type", ctx.type().name(),
                        "exception.runtime", Optional.ofNullable(ctx.exception()).map(Throwable::getMessage).orElse("none"),
                        "exception.sql", Optional.ofNullable(ctx.sqlException()).map(Throwable::getMessage).orElse("none"),
                        "query", query
                )));

                meterRegistry.gauge(
                        "database.jooq.query.updated",
                        Tags.of(
                                "query", query
                        ),
                        ctx.rows()
                );
            }

            private static String getQuery(ExecuteContext ctx) {
                return Stream.of(ctx.batchSQL())
                        .limit(10)
                        .collect(Collectors.joining("; "));
            }
        });
    }
}
