package de.sky.meal.ordering.mealordering.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

@Slf4j
@ControllerAdvice
public class ExceptionMapper {
    @ExceptionHandler(Throwable.class)
    public ResponseEntity<String> handleCustomException(Throwable ex, WebRequest request) {
        log.error("Critical Error in {}", request, ex);

        return ResponseEntity.internalServerError()
                .build();
    }
}
