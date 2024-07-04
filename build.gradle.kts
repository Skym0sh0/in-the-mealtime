plugins {
}

group = "de.sky.meal.ordering"
version = "0.0.1-SNAPSHOT"

allprojects {
    repositories {
        mavenCentral()
    }

    tasks.withType<Test> {
        useJUnitPlatform()
    }
}
