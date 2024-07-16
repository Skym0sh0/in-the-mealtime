package de.sky.meal.ordering.mealordering;

import de.sky.meal.ordering.mealordering.config.OrderConfiguration;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@EnableConfigurationProperties(OrderConfiguration.class)
@SpringBootApplication
public class InTheMealtimeApplication {

    public static void main(String[] args) {
        SpringApplication.run(InTheMealtimeApplication.class, args);
    }
}
