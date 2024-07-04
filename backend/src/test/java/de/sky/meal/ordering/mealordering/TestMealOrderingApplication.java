package de.sky.meal.ordering.mealordering;

import org.springframework.boot.SpringApplication;

public class TestMealOrderingApplication {

    public static void main(String[] args) {
        SpringApplication.from(MealOrderingApplication::main).with(TestcontainersConfiguration.class).run(args);
    }

}
