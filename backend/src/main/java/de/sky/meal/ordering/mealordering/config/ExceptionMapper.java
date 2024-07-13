package de.sky.meal.ordering.mealordering.config;

import generated.sky.meal.ordering.rest.model.ErrorObject;
import jakarta.ws.rs.ClientErrorException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

@Slf4j
@ControllerAdvice
public class ExceptionMapper {
    @ExceptionHandler(Throwable.class)
    public ResponseEntity<ErrorObject> handleCustomException(Throwable ex, WebRequest request) {
        log.error("Critical Error in {}", request, ex);

        return ResponseEntity.internalServerError()
                .body(
                        ErrorObject.builder()
                                .message(ex.getMessage())
                                .build()
                );
    }

    @ExceptionHandler(ClientErrorException.class)
    public ResponseEntity<ErrorObject> handleCustomException(ClientErrorException ex, WebRequest request) {
        log.error("Client Error in {}", request, ex);

        return ResponseEntity.status(ex.getResponse().getStatus())
                .body(
                        ErrorObject.builder()
                                .message(ex.getMessage())
                                .build()
                );
    }

}
