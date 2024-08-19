package de.sky.meal.ordering.mealordering.config;

import com.google.common.base.Throwables;
import de.sky.meal.ordering.mealordering.model.exceptions.ConcurrentUpdateException;
import de.sky.meal.ordering.mealordering.model.exceptions.MealtimeException;
import de.sky.meal.ordering.mealordering.model.exceptions.RecordNotFoundException;
import generated.sky.meal.ordering.rest.model.ErrorObject;
import jakarta.ws.rs.WebApplicationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.time.OffsetDateTime;
import java.util.stream.Collectors;

@Slf4j
@ControllerAdvice
@RequiredArgsConstructor
public class ExceptionMapper {

    private final AppConfig appConfig;

    @ExceptionHandler(Throwable.class)
    public ResponseEntity<ErrorObject> handle(Throwable ex, WebRequest request) {
        log.error("Critical Error in {}", request, ex);

        return ResponseEntity.internalServerError()
                .body(
                        ErrorObject.builder()
                                .timestamp(OffsetDateTime.now())
                                .correlationId(request.getHeader(WebConfig.CORRELATION_ID))
                                .message(ex.getMessage())
                                .detailMessage(
                                        Throwables.getCausalChain(ex)
                                                .stream()
                                                .map(Throwable::getMessage)
                                                .collect(Collectors.joining(". "))
                                )
                                .stacktrace(getStracktrace(ex))
                                .build()
                );
    }

    @ExceptionHandler(WebApplicationException.class)
    public ResponseEntity<ErrorObject> handle(WebApplicationException ex, WebRequest request) {
        log.error("Client Error in {}", request, ex);

        return ResponseEntity.status(ex.getResponse().getStatus())
                .body(
                        ErrorObject.builder()
                                .timestamp(OffsetDateTime.now())
                                .correlationId(request.getHeader(WebConfig.CORRELATION_ID))
                                .message(ex.getMessage())
                                .detailMessage(null)
                                .stacktrace(getStracktrace(ex))
                                .build()
                );
    }

    @ExceptionHandler(MealtimeException.class)
    public ResponseEntity<ErrorObject> handleException(MealtimeException ex, WebRequest request) {
        return handleException(HttpStatus.BAD_REQUEST, ex, request);
    }

    @ExceptionHandler(ConcurrentUpdateException.class)
    public ResponseEntity<ErrorObject> handleException(ConcurrentUpdateException ex, WebRequest request) {
        return handleException(HttpStatus.CONFLICT, ex, request);
    }

    @ExceptionHandler(RecordNotFoundException.class)
    public ResponseEntity<ErrorObject> handleException(RecordNotFoundException ex, WebRequest request) {
        return handleException(HttpStatus.NOT_FOUND, ex, request);
    }

    private ResponseEntity<ErrorObject> handleException(HttpStatus status, MealtimeException ex, WebRequest request) {
        log.warn("MealtimeException in {}", request, ex);

        return ResponseEntity.status(status)
                .body(
                        ErrorObject.builder()
                                .timestamp(OffsetDateTime.now())
                                .correlationId(request.getHeader(WebConfig.CORRELATION_ID))
                                .message(ex.getMessage())
                                .detailMessage(ex.getDetailMessage())
                                .stacktrace(getStracktrace(ex))
                                .build()
                );
    }

    private String getStracktrace(Throwable ex) {
        if (appConfig.devModeEnabled())
            return Throwables.getStackTraceAsString(ex);

        return null;
    }
}
