package de.sky.meal.ordering.mealordering.config;

import com.google.common.base.Stopwatch;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.MDC;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;
import org.springframework.web.servlet.resource.ResourceResolverChain;

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Stream;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {
    public static final String CORRELATION_ID = "X-Correlation-ID";

    private final AppConfig config;

    @Component
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public static class CorrelationFilter extends OncePerRequestFilter {
        @Override
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
            var correlationId = Optional.ofNullable(request.getHeader(CORRELATION_ID))
                    .filter(StringUtils::isNotBlank)
                    .orElseGet(() -> UUID.randomUUID().toString());

            response.setHeader(CORRELATION_ID, correlationId);

            filterChain.doFilter(request, response);
        }
    }

    @Slf4j
    @Component
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public static class RequestLogger extends OncePerRequestFilter {
        @Override
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
            var correlationId = Stream.of(request.getHeader(CORRELATION_ID), response.getHeader(CORRELATION_ID))
                    .filter(StringUtils::isNotBlank)
                    .findFirst()
                    .orElseGet(() -> UUID.randomUUID().toString());

            try (var mdc = MDC.putCloseable(CORRELATION_ID, correlationId)) {
                var sw = Stopwatch.createStarted();

                log.debug(">>> [{}] Request {} \"{}\" starts ...", correlationId, request.getMethod(), request.getServletPath());

                try {
                    filterChain.doFilter(request, response);
                } finally {
                    log.info("<<< [{}] Request {} \"{}\" finished with Status {} in {}", correlationId, request.getMethod(), request.getServletPath(), response.getStatus(), sw.stop());
                }
            }
        }
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        Optional.ofNullable(config.technicalConfig())
                .map(s -> s.allowedOrigins())
                .map(s -> s.toArray(String[]::new))
                .ifPresent(origins -> {
                    log.info("Adding CORS mappings for origins {}", origins);
                    registry.addMapping("/api/*").allowedOrigins(origins);
                });
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .setCacheControl(CacheControl.maxAge(Duration.ZERO).mustRevalidate())
                .resourceChain(true)
                .addResolver(new IndexFallbackResourceResolver());
    }

    @Slf4j
    private static class IndexFallbackResourceResolver extends PathResourceResolver {
        @Override
        protected Resource resolveResourceInternal(HttpServletRequest request, String requestPath, List<? extends Resource> locations, ResourceResolverChain chain) {
            // Give PathResourceResolver a chance to resolve a resource on its own.
            Resource resource = super.resolveResourceInternal(request, requestPath, locations, chain);

            log.debug(">>> Resolve resource {} + {} => {}", request.getServletPath(), requestPath, resource);

            if (resource == null) {
                // If resource wasn't found, use index.html file.
                resource = super.resolveResourceInternal(request, "index.html", locations, chain);
            }
            return resource;
        }
    }
}
