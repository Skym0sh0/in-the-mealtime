package de.sky.meal.ordering.mealordering;

import de.sky.meal.ordering.mealordering.config.AppConfig;
import de.sky.meal.ordering.mealordering.config.NotificationConfiguration;
import de.sky.meal.ordering.mealordering.config.OrderConfiguration;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@EnableAsync
@SpringBootApplication
@EnableConfigurationProperties({AppConfig.class, OrderConfiguration.class, NotificationConfiguration.class})
public class InTheMealtimeApplication {

    public static void main(String[] args) {
        SpringApplication.run(InTheMealtimeApplication.class, args);
    }
}
