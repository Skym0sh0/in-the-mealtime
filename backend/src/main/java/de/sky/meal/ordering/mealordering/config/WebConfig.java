package de.sky.meal.ordering.mealordering.config;

import com.google.common.base.Stopwatch;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Stream;

public class WebConfig {
    private static final String CORRELATION_ID = "X-Correlation-ID";

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

                log.info(">>> [{}] Request {} \"{}\" starts ...", correlationId, request.getMethod(), request.getServletPath());

                try {
                    filterChain.doFilter(request, response);
                } finally {
                    log.info("<<< [{}] Request {} \"{}\" finished with Status {} in {}", correlationId, request.getMethod(), request.getServletPath(), response.getStatus(), sw.stop());
                }
            }
        }
    }
}
