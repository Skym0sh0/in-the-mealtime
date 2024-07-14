package de.sky.meal.ordering.mealordering;

import org.springframework.boot.SpringApplication;

public class TestInTheMealtimeApplication {

    public static void main(String[] args) {
        SpringApplication.from(InTheMealtimeApplication::main).with(TestcontainersConfiguration.class).run(args);
    }

}
